import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";

const TASK_COFHE_MOCKS_DEPLOY = "task:cofhe-mocks:deploy";

describe("ShadowBid", function () {
  async function deployFixture() {
    await hre.run(TASK_COFHE_MOCKS_DEPLOY);

    const [seller, alice, bob, carol] = await hre.ethers.getSigners();

    const ShadowBid = await hre.ethers.getContractFactory("ShadowBid");
    const shadowBid = await ShadowBid.deploy();

    const sellerClient = await hre.cofhe.createClientWithBatteries(seller);
    const aliceClient = await hre.cofhe.createClientWithBatteries(alice);
    const bobClient = await hre.cofhe.createClientWithBatteries(bob);
    const carolClient = await hre.cofhe.createClientWithBatteries(carol);

    return {
      shadowBid,
      seller,
      alice,
      bob,
      carol,
      sellerClient,
      aliceClient,
      bobClient,
      carolClient,
    };
  }

  // ─────────────────────── Helpers ───────────────────────

  async function encryptMinBid(client: any, value: bigint) {
    const [encrypted] = await client
      .encryptInputs([Encryptable.uint64(value)])
      .execute();
    return encrypted;
  }

  async function encryptBid(client: any, value: bigint) {
    const [encrypted] = await client
      .encryptInputs([Encryptable.uint64(value)])
      .execute();
    return encrypted;
  }

  // ─────────────────────── Create Auction ───────────────────────

  describe("createAuction", function () {
    it("should create an auction with encrypted minimum bid", async function () {
      const { shadowBid, seller, sellerClient } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 100n);

      const tx = await shadowBid
        .connect(seller)
        .createAuction("Rare NFT #1", 3600, minBid);
      await tx.wait();

      expect(await shadowBid.auctionCounter()).to.equal(1n);

      const auction = await shadowBid.auctions(0);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.title).to.equal("Rare NFT #1");
      expect(auction.finalized).to.be.false;
      expect(auction.revealedWinner).to.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    it("should emit AuctionCreated event", async function () {
      const { shadowBid, seller, sellerClient } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 50n);

      await expect(
        shadowBid.connect(seller).createAuction("Art Piece", 1800, minBid),
      ).to.emit(shadowBid, "AuctionCreated");
    });
  });

  // ─────────────────────── Place Bid ───────────────────────

  describe("placeBid", function () {
    it("should accept an encrypted bid and store it", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 100n);
      await shadowBid.connect(seller).createAuction("Token", 3600, minBid);

      const bid = await encryptBid(aliceClient, 500n);
      await shadowBid.connect(alice).placeBid(0, bid);

      expect(await shadowBid.getBidderCount(0)).to.equal(1n);
      expect(await shadowBid.getBidder(0, 0)).to.equal(alice.address);
    });

    it("should emit BidSubmitted event", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 100n);
      await shadowBid.connect(seller).createAuction("Item", 3600, minBid);

      const bid = await encryptBid(aliceClient, 200n);

      await expect(shadowBid.connect(alice).placeBid(0, bid)).to.emit(
        shadowBid,
        "BidSubmitted",
      );
    });

    it("should reject duplicate bids from the same address", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 100n);
      await shadowBid.connect(seller).createAuction("Dup Test", 3600, minBid);

      const bid1 = await encryptBid(aliceClient, 300n);
      await shadowBid.connect(alice).placeBid(0, bid1);

      const bid2 = await encryptBid(aliceClient, 400n);
      await expect(
        shadowBid.connect(alice).placeBid(0, bid2),
      ).to.be.revertedWithCustomError(shadowBid, "AlreadyBid");
    });

    it("should reject bids after bidding period ends", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 100n);
      await shadowBid.connect(seller).createAuction("Late Bid", 1, minBid);

      // Fast-forward past bidding end
      await hre.network.provider.send("evm_increaseTime", [2]);
      await hre.network.provider.send("evm_mine");

      const bid = await encryptBid(aliceClient, 500n);
      await expect(
        shadowBid.connect(alice).placeBid(0, bid),
      ).to.be.revertedWithCustomError(shadowBid, "BiddingPeriodEnded");
    });
  });

  // ─────────────────────── Encrypted Winner Selection ───────────────────────

  describe("encrypted winner selection (CMUX)", function () {
    it("should correctly determine the highest bidder with 3 bids", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        carol,
        sellerClient,
        aliceClient,
        bobClient,
        carolClient,
      } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 10n);
      await shadowBid
        .connect(seller)
        .createAuction("Rare Token", 3600, minBid);

      // Alice bids 500, Bob bids 1500, Carol bids 800
      const aliceBid = await encryptBid(aliceClient, 500n);
      const bobBid = await encryptBid(bobClient, 1500n);
      const carolBid = await encryptBid(carolClient, 800n);

      await shadowBid.connect(alice).placeBid(0, aliceBid);
      await shadowBid.connect(bob).placeBid(0, bobBid);
      await shadowBid.connect(carol).placeBid(0, carolBid);

      // Use the mock coprocessor to read raw plaintext of the encrypted state.
      // This bypasses ACL — only works in the mock Hardhat environment.
      const highestBidHash = await shadowBid.getHighestBidCtHash(0);
      const highestBidderHash = await shadowBid.getHighestBidderCtHash(0);

      const highestBidPlain = await hre.cofhe.mocks.getPlaintext(highestBidHash);
      const highestBidderPlain =
        await hre.cofhe.mocks.getPlaintext(highestBidderHash);

      // Bob (1500) should be the winner
      expect(highestBidPlain).to.equal(1500n);
      expect(highestBidderPlain).to.equal(bob.address);
    });

    it("should handle bids in descending order (first bid is highest)", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        carol,
        sellerClient,
        aliceClient,
        bobClient,
        carolClient,
      } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 1n);
      await shadowBid.connect(seller).createAuction("Descending", 3600, minBid);

      // Alice bids 3000, Bob bids 2000, Carol bids 1000
      const aliceBid = await encryptBid(aliceClient, 3000n);
      const bobBid = await encryptBid(bobClient, 2000n);
      const carolBid = await encryptBid(carolClient, 1000n);

      await shadowBid.connect(alice).placeBid(0, aliceBid);
      await shadowBid.connect(bob).placeBid(0, bobBid);
      await shadowBid.connect(carol).placeBid(0, carolBid);

      const highestBidHash = await shadowBid.getHighestBidCtHash(0);
      const highestBidderHash = await shadowBid.getHighestBidderCtHash(0);

      const highestBidPlain = await hre.cofhe.mocks.getPlaintext(highestBidHash);
      const highestBidderPlain =
        await hre.cofhe.mocks.getPlaintext(highestBidderHash);

      // Alice (3000) should still be the winner
      expect(highestBidPlain).to.equal(3000n);
      expect(highestBidderPlain).to.equal(alice.address);
    });

    it("should handle ties — first highest bid wins", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 1n);
      await shadowBid.connect(seller).createAuction("Tie", 3600, minBid);

      // Both bid 1000
      const aliceBid = await encryptBid(aliceClient, 1000n);
      const bobBid = await encryptBid(bobClient, 1000n);

      await shadowBid.connect(alice).placeBid(0, aliceBid);
      await shadowBid.connect(bob).placeBid(0, bobBid);

      const highestBidderHash = await shadowBid.getHighestBidderCtHash(0);
      const highestBidderPlain =
        await hre.cofhe.mocks.getPlaintext(highestBidderHash);

      // Alice placed first, so she should win the tie (FHE.gt is strictly greater)
      expect(highestBidderPlain).to.equal(alice.address);
    });

    it("should zero out bids below the encrypted minimum", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      // Minimum bid = 1000
      const minBid = await encryptMinBid(sellerClient, 1000n);
      await shadowBid.connect(seller).createAuction("MinBid Test", 3600, minBid);

      // Alice bids 500 (below min), Bob bids 2000 (above min)
      const aliceBid = await encryptBid(aliceClient, 500n);
      const bobBid = await encryptBid(bobClient, 2000n);

      await shadowBid.connect(alice).placeBid(0, aliceBid);
      await shadowBid.connect(bob).placeBid(0, bobBid);

      const highestBidHash = await shadowBid.getHighestBidCtHash(0);
      const highestBidderHash = await shadowBid.getHighestBidderCtHash(0);

      const highestBidPlain = await hre.cofhe.mocks.getPlaintext(highestBidHash);
      const highestBidderPlain =
        await hre.cofhe.mocks.getPlaintext(highestBidderHash);

      // Bob should win with 2000; Alice's 500 was zeroed by min bid check
      expect(highestBidPlain).to.equal(2000n);
      expect(highestBidderPlain).to.equal(bob.address);
    });
  });

  // ─────────────────────── Finalize + Reveal ───────────────────────

  describe("finalize", function () {
    it("should allow seller to finalize after bidding ends", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 10n);
      await shadowBid.connect(seller).createAuction("Fin", 60, minBid);

      const bid = await encryptBid(aliceClient, 500n);
      await shadowBid.connect(alice).placeBid(0, bid);

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      await shadowBid.connect(seller).finalize(0);

      const auction = await shadowBid.auctions(0);
      expect(auction.finalized).to.be.true;
    });

    it("should reject finalize from non-seller", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 10n);
      await shadowBid.connect(seller).createAuction("NoAuth", 60, minBid);

      const bid = await encryptBid(aliceClient, 500n);
      await shadowBid.connect(alice).placeBid(0, bid);

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      await expect(
        shadowBid.connect(alice).finalize(0),
      ).to.be.revertedWithCustomError(shadowBid, "OnlySellerCanFinalize");
    });

    it("should reject finalize before bidding ends", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 10n);
      await shadowBid.connect(seller).createAuction("Early", 3600, minBid);

      const bid = await encryptBid(aliceClient, 500n);
      await shadowBid.connect(alice).placeBid(0, bid);

      await expect(
        shadowBid.connect(seller).finalize(0),
      ).to.be.revertedWithCustomError(shadowBid, "BiddingPeriodActive");
    });

    it("should reject finalize when there are no bids", async function () {
      const { shadowBid, seller, sellerClient } =
        await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 10n);
      await shadowBid.connect(seller).createAuction("Empty", 60, minBid);

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      await expect(
        shadowBid.connect(seller).finalize(0),
      ).to.be.revertedWithCustomError(shadowBid, "NoBids");
    });
  });

  describe("revealWinner (decryptForTx flow)", function () {
    it("should decrypt and reveal the winner on-chain", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        carol,
        sellerClient,
        aliceClient,
        bobClient,
        carolClient,
      } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 10n);
      await shadowBid
        .connect(seller)
        .createAuction("Reveal Test", 60, minBid);

      // Alice 300, Bob 900, Carol 600
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
      );
      await shadowBid.connect(carol).placeBid(
        0,
        await encryptBid(carolClient, 600n),
      );

      // Fast-forward & finalize
      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");
      await shadowBid.connect(seller).finalize(0);

      // ── CoFHE SDK decrypt-for-tx flow ──
      // After finalize(), highestBid and highestBidder are publicly allowed.
      // The SDK's decryptForTx(...).withoutPermit() returns a Threshold
      // Network signature that the contract can verify on-chain.

      const bidCtHash = await shadowBid.getHighestBidCtHash(0);
      const bidderCtHash = await shadowBid.getHighestBidderCtHash(0);

      const bidResult = await sellerClient
        .decryptForTx(bidCtHash)
        .withoutPermit()
        .execute();

      const bidderResult = await sellerClient
        .decryptForTx(bidderCtHash)
        .withoutPermit()
        .execute();

      // Submit verified plaintext + signatures on-chain.
      // bidderResult.decryptedValue is a bigint for eaddress — convert to address string.
      const winnerAddress = hre.ethers.getAddress(
        "0x" + bidderResult.decryptedValue.toString(16).padStart(40, "0"),
      );

      await shadowBid
        .connect(seller)
        .revealWinner(
          0,
          bidResult.ctHash,
          bidResult.decryptedValue,
          bidResult.signature,
          bidderResult.ctHash,
          winnerAddress,
          bidderResult.signature,
        );

      // Assert on-chain revealed state
      const auction = await shadowBid.auctions(0);
      expect(auction.revealedBid).to.equal(900n);
      expect(auction.revealedWinner).to.equal(bob.address);
    });

    it("should emit AuctionFinalized event with correct values", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 1n);
      await shadowBid.connect(seller).createAuction("Event Test", 60, minBid);

      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 420n),
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 690n),
      );

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");
      await shadowBid.connect(seller).finalize(0);

      const bidCtHash = await shadowBid.getHighestBidCtHash(0);
      const bidderCtHash = await shadowBid.getHighestBidderCtHash(0);

      const bidResult = await sellerClient
        .decryptForTx(bidCtHash)
        .withoutPermit()
        .execute();
      const bidderResult = await sellerClient
        .decryptForTx(bidderCtHash)
        .withoutPermit()
        .execute();

      const winnerAddress = hre.ethers.getAddress(
        "0x" + bidderResult.decryptedValue.toString(16).padStart(40, "0"),
      );

      await expect(
        shadowBid
          .connect(seller)
          .revealWinner(
            0,
            bidResult.ctHash,
            bidResult.decryptedValue,
            bidResult.signature,
            bidderResult.ctHash,
            winnerAddress,
            bidderResult.signature,
          ),
      )
        .to.emit(shadowBid, "AuctionFinalized")
        .withArgs(0, bob.address, 690n);
    });
  });
});
