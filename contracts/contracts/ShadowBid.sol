// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @title ShadowBid — Sealed-Bid Auction with FHE
/// @notice Bids remain encrypted on-chain until finalization. Winner is
///         determined entirely in encrypted space using FHE.select() (CMUX).
contract ShadowBid {
    // ──────────────────────────────── Types ────────────────────────────────

    struct Auction {
        address seller;
        string title;
        uint256 biddingEnd;
        bool finalized;
        // Encrypted running state — only the contract (via ACL) can read these
        euint64 minimumBid;
        euint64 highestBid;
        eaddress highestBidder;
        // Decrypted result — zero until finalize + reveal
        uint64 revealedBid;
        address revealedWinner;
    }

    struct Bid {
        euint64 amount;
        bool exists;
    }

    // ──────────────────────────── State ────────────────────────────

    uint256 public auctionCounter;

    // auctionId => Auction
    mapping(uint256 => Auction) public auctions;

    // auctionId => bidder => Bid
    mapping(uint256 => mapping(address => Bid)) public bids;

    // auctionId => list of bidders (for iteration during finalize)
    mapping(uint256 => address[]) internal _bidders;

    // ──────────────────────────── Events ───────────────────────────

    event AuctionCreated(uint256 indexed auctionId, address seller, string title, uint256 biddingEnd);
    event BidSubmitted(uint256 indexed auctionId, address indexed bidder);
    event AuctionFinalized(uint256 indexed auctionId, address winner, uint64 winningBid);

    // ──────────────────────────── Errors ───────────────────────────

    error AuctionDoesNotExist(uint256 auctionId);
    error BiddingPeriodEnded(uint256 auctionId);
    error BiddingPeriodActive(uint256 auctionId);
    error AuctionAlreadyFinalized(uint256 auctionId);
    error OnlySellerCanFinalize();
    error AlreadyBid(uint256 auctionId);
    error RevealNotReady();
    error NoBids(uint256 auctionId);

    // ─────────────────────────── Modifiers ─────────────────────────

    modifier auctionExists(uint256 auctionId) {
        if (auctions[auctionId].seller == address(0)) revert AuctionDoesNotExist(auctionId);
        _;
    }

    modifier biddingActive(uint256 auctionId) {
        if (block.timestamp >= auctions[auctionId].biddingEnd) revert BiddingPeriodEnded(auctionId);
        _;
    }

    modifier biddingEnded(uint256 auctionId) {
        if (block.timestamp < auctions[auctionId].biddingEnd) revert BiddingPeriodActive(auctionId);
        _;
    }

    modifier notFinalized(uint256 auctionId) {
        if (auctions[auctionId].finalized) revert AuctionAlreadyFinalized(auctionId);
        _;
    }

    // ────────────────────────── Create Auction ─────────────────────

    /// @notice Create a new sealed-bid auction
    /// @param title Human-readable item description
    /// @param duration Bidding window in seconds from now
    /// @param minimumBidEncrypted Encrypted minimum bid (InEuint64 from SDK)
    function createAuction(
        string calldata title,
        uint256 duration,
        InEuint64 calldata minimumBidEncrypted
    ) external returns (uint256 auctionId) {
        auctionId = auctionCounter++;

        euint64 minimumBid = FHE.asEuint64(minimumBidEncrypted);
        euint64 initialBid = FHE.asEuint64(uint64(0));
        eaddress initialBidder = FHE.asEaddress(address(0));

        Auction storage a = auctions[auctionId];
        a.seller = msg.sender;
        a.title = title;
        a.biddingEnd = block.timestamp + duration;
        a.finalized = false;
        a.minimumBid = minimumBid;
        a.highestBid = initialBid;
        a.highestBidder = initialBidder;

        // Grant the contract permission to use these encrypted values later
        FHE.allowThis(a.minimumBid);
        FHE.allowThis(a.highestBid);
        FHE.allowThis(a.highestBidder);

        emit AuctionCreated(auctionId, msg.sender, title, a.biddingEnd);
    }

    // ────────────────────────── Place Bid ──────────────────────────

    /// @notice Submit a sealed bid. The amount is never visible on-chain
    ///         until after finalization.
    /// @param auctionId The auction to bid on
    /// @param bidAmountEncrypted Encrypted bid amount (InEuint64 from SDK)
    function placeBid(uint256 auctionId, InEuint64 calldata bidAmountEncrypted)
        external
        auctionExists(auctionId)
        biddingActive(auctionId)
        notFinalized(auctionId)
    {
        if (bids[auctionId][msg.sender].exists) revert AlreadyBid(auctionId);

        Auction storage a = auctions[auctionId];
        euint64 bidAmount = FHE.asEuint64(bidAmountEncrypted);

        // ── Enforce minimum bid (encrypted comparison) ──
        // FHE.ge returns ebool; FHE.select zeros out the bid if below min.
        // The contract never learns whether the bid was above or below.
        ebool meetsMinimum = FHE.gte(bidAmount, a.minimumBid);
        bidAmount = FHE.select(meetsMinimum, bidAmount, FHE.asEuint64(uint64(0)));

        // Store the (conditionally-zeroed) encrypted bid
        bids[auctionId][msg.sender] = Bid({amount: bidAmount, exists: true});
        _bidders[auctionId].push(msg.sender);

        // ── Encrypted winner comparison (CMUX) ──
        // FHE.select(cond, ifTrue, ifFalse) works like a hardware MUX:
        //   if cond == true  → returns ifTrue
        //   if cond == false → returns ifFalse
        //
        // We compare the new bid against the current highest entirely in
        // encrypted space. The ebool result of FHE.gt never leaves the
        // coprocessor in plaintext.

        ebool isNewHighest = FHE.gt(bidAmount, a.highestBid);

        // Update highest bid: select(newBid, oldBid) → max(old, new)
        a.highestBid = FHE.select(isNewHighest, bidAmount, a.highestBid);

        // Update highest bidder: select(newBidder, oldBidder)
        eaddress newBidder = FHE.asEaddress(msg.sender);
        a.highestBidder = FHE.select(isNewHighest, newBidder, a.highestBidder);

        // Re-grant contract-level access after mutation
        FHE.allowThis(a.highestBid);
        FHE.allowThis(a.highestBidder);

        // Grant the bidder read access to their own encrypted bid
        FHE.allowSender(bidAmount);

        emit BidSubmitted(auctionId, msg.sender);
    }

    // ────────────────────────── Finalize ───────────────────────────

    /// @notice End the auction and make the winner + amount publicly
    ///         decryptable. Only the seller can call this.
    /// @dev After this call, anyone can use the CoFHE SDK's
    ///      `decryptForTx(...).withoutPermit()` to get a signed plaintext,
    ///      then call `revealWinner` to store it on-chain.
    function finalize(uint256 auctionId)
        external
        auctionExists(auctionId)
        biddingEnded(auctionId)
        notFinalized(auctionId)
    {
        Auction storage a = auctions[auctionId];

        if (msg.sender != a.seller) revert OnlySellerCanFinalize();
        if (_bidders[auctionId].length == 0) revert NoBids(auctionId);

        a.finalized = true;

        // Make the encrypted winner data publicly decryptable.
        // After this, the Threshold Network will serve decryption for anyone.
        FHE.allowPublic(a.highestBid);
        FHE.allowPublic(a.highestBidder);
    }

    // ────────────────────────── Reveal Winner ──────────────────────

    /// @notice Publish the decrypted winner and winning bid on-chain.
    /// @dev Three-step flow (standard CoFHE pattern):
    ///      1. Contract calls `finalize()` → FHE.allowPublic on ctHashes
    ///      2. Client reads the ctHash getters, calls
    ///         `decryptForTx(ctHash).withoutPermit().execute()` for each
    ///      3. Client submits plaintext + signature here
    /// @param auctionId The auction to reveal
    /// @param bidCtHash The ciphertext hash of highestBid (from getHighestBidCtHash)
    /// @param bidDecrypted The plaintext winning bid amount
    /// @param bidSignature Threshold Network signature for the bid
    /// @param winnerCtHash The ciphertext hash of highestBidder (from getHighestBidderCtHash)
    /// @param winnerDecrypted The plaintext winner address
    /// @param winnerSignature Threshold Network signature for the winner
    function revealWinner(
        uint256 auctionId,
        euint64 bidCtHash,
        uint64 bidDecrypted,
        bytes calldata bidSignature,
        eaddress winnerCtHash,
        address winnerDecrypted,
        bytes calldata winnerSignature
    )
        external
        auctionExists(auctionId)
        biddingEnded(auctionId)
    {
        Auction storage a = auctions[auctionId];
        if (!a.finalized) revert RevealNotReady();
        if (a.revealedWinner != address(0)) revert AuctionAlreadyFinalized(auctionId);

        // Verify & store the Threshold Network signatures on-chain.
        // Reverts if the signature is invalid (tampered decrypt proof).
        FHE.publishDecryptResult(bidCtHash, bidDecrypted, bidSignature);
        FHE.publishDecryptResult(winnerCtHash, winnerDecrypted, winnerSignature);

        a.revealedBid = bidDecrypted;
        a.revealedWinner = winnerDecrypted;

        emit AuctionFinalized(auctionId, winnerDecrypted, bidDecrypted);
    }

    // ────────────────────────── View Helpers ───────────────────────

    /// @notice Returns the encrypted highest bid ciphertext hash
    function getHighestBidCtHash(uint256 auctionId)
        external
        view
        auctionExists(auctionId)
        returns (euint64)
    {
        return auctions[auctionId].highestBid;
    }

    /// @notice Returns the encrypted highest bidder ciphertext hash
    function getHighestBidderCtHash(uint256 auctionId)
        external
        view
        auctionExists(auctionId)
        returns (eaddress)
    {
        return auctions[auctionId].highestBidder;
    }

    /// @notice Returns the number of bidders for an auction
    function getBidderCount(uint256 auctionId) external view returns (uint256) {
        return _bidders[auctionId].length;
    }

    /// @notice Returns a specific bidder address by index
    function getBidder(uint256 auctionId, uint256 index) external view returns (address) {
        return _bidders[auctionId][index];
    }
}
