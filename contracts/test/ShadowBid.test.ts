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

  // Helper: full createAuction flow
  async function createTestAuction(
    shadowBid: any,
    seller: any,
    sellerClient: any,
    title = "Test Auction",
    duration = 3600,
    encryptedMin = 10n,
    minBidWei = "0.001"
  ) {
    const minBid = await encryptMinBid(sellerClient, encryptedMin);
    const minBidWeiParsed = hre.ethers.parseEther(minBidWei);
    await shadowBid.connect(seller).createAuction(title, duration, minBid, minBidWeiParsed);
    return { minBidWeiParsed };
  }

  // Helper: full finalize + reveal flow
  async function finalizeAndReveal(
    shadowBid: any,
    seller: any,
    sellerClient: any,
    auctionId = 0
  ) {
    await hre.network.provider.send("evm_increaseTime", [61]);
    await hre.network.provider.send("evm_mine");
    await shadowBid.connect(seller).finalize(auctionId);

    const bidCtHash = await shadowBid.getHighestBidCtHash(auctionId);
    const bidderCtHash = await shadowBid.getHighestBidderCtHash(auctionId);

    const bidResult = await sellerClient.decryptForTx(bidCtHash).withoutPermit().execute();
    const bidderResult = await sellerClient.decryptForTx(bidderCtHash).withoutPermit().execute();

    const winnerAddress = hre.ethers.getAddress(
      "0x" + bidderResult.decryptedValue.toString(16).padStart(40, "0"),
    );

    await shadowBid.connect(seller).revealWinner(
      auctionId,
      bidResult.ctHash,
      bidResult.decryptedValue,
      bidResult.signature,
      bidderResult.ctHash,
      winnerAddress,
      bidderResult.signature,
    );

    return { bidResult, bidderResult, winnerAddress };
  }

  // ─────────────────────── Create Auction ───────────────────────

  describe("createAuction", function () {
    it("should create an auction with encrypted minimum bid", async function () {
      const { shadowBid, seller, sellerClient } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 100n);
      const minBidWei = hre.ethers.parseEther("0.01");

      const tx = await shadowBid
        .connect(seller)
        .createAuction("Rare NFT #1", 3600, minBid, minBidWei);
      await tx.wait();

      expect(await shadowBid.auctionCounter()).to.equal(1n);

      const auction = await shadowBid.auctions(0);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.title).to.equal("Rare NFT #1");
      expect(auction.finalized).to.be.false;
      expect(auction.paymentClaimed).to.be.false;
      expect(auction.minimumBidWei).to.equal(minBidWei);
      expect(auction.revealedWinner).to.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    it("should store minimumBidWei on-chain", async function () {
      const { shadowBid, seller, sellerClient } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 100n);
      const minBidWei = hre.ethers.parseEther("0.05");

      await shadowBid.connect(seller).createAuction("Stored Min", 3600, minBid, minBidWei);

      expect(await shadowBid.getMinimumBidWei(0)).to.equal(minBidWei);
    });

    it("should emit AuctionCreated event", async function () {
      const { shadowBid, seller, sellerClient } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 50n);
      const minBidWei = hre.ethers.parseEther("0.005");

      await expect(
        shadowBid.connect(seller).createAuction("Art Piece", 1800, minBid, minBidWei),
      ).to.emit(shadowBid, "AuctionCreated");
    });

    it("should reject invalid duration", async function () {
      const { shadowBid, seller, sellerClient } = await loadFixture(deployFixture);

      const minBid = await encryptMinBid(sellerClient, 50n);
      const minBidWei = hre.ethers.parseEther("0.005");

      // Too short (less than 60 seconds)
      await expect(
        shadowBid.connect(seller).createAuction("Too Short", 30, minBid, minBidWei),
      ).to.be.revertedWithCustomError(shadowBid, "InvalidDuration");

      // Too long (more than 365 days)
      await expect(
        shadowBid.connect(seller).createAuction("Too Long", 366 * 24 * 3600, minBid, minBidWei),
      ).to.be.revertedWithCustomError(shadowBid, "InvalidDuration");
    });
  });

  // ─────────────────────── Place Bid ───────────────────────

  describe("placeBid", function () {
    it("should accept an encrypted bid with ETH deposit", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient);

      const bid = await encryptBid(aliceClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");
      await shadowBid.connect(alice).placeBid(0, bid, { value: bidWei });

      expect(await shadowBid.getBidderCount(0)).to.equal(1n);
      expect(await shadowBid.getBidder(0, 0)).to.equal(alice.address);
      expect(await shadowBid.getBidderDeposit(0, alice.address)).to.equal(bidWei);
      expect(await shadowBid.totalEscrowed(0)).to.equal(bidWei);
    });

    it("should emit BidSubmitted event", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient);

      const bid = await encryptBid(aliceClient, 200n);
      const bidWei = hre.ethers.parseEther("0.02");

      await expect(
        shadowBid.connect(alice).placeBid(0, bid, { value: bidWei }),
      ).to.emit(shadowBid, "BidSubmitted");
    });

    it("should reject seller bidding on own auction", async function () {
      const { shadowBid, seller, sellerClient } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient);

      const bid = await encryptBid(sellerClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");

      await expect(
        shadowBid.connect(seller).placeBid(0, bid, { value: bidWei }),
      ).to.be.revertedWithCustomError(shadowBid, "SellerCannotBid");
    });

    it("should reject duplicate bids from the same address", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient);

      const bid1 = await encryptBid(aliceClient, 300n);
      const bidWei = hre.ethers.parseEther("0.03");
      await shadowBid.connect(alice).placeBid(0, bid1, { value: bidWei });

      const bid2 = await encryptBid(aliceClient, 400n);
      await expect(
        shadowBid.connect(alice).placeBid(0, bid2, { value: bidWei }),
      ).to.be.revertedWithCustomError(shadowBid, "AlreadyBid");
    });

    it("should reject bids after bidding period ends", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Late Bid", 60);

      // Fast-forward past bidding end (60 seconds)
      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      const bid = await encryptBid(aliceClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");
      await expect(
        shadowBid.connect(alice).placeBid(0, bid, { value: bidWei }),
      ).to.be.revertedWithCustomError(shadowBid, "BiddingPeriodEnded");
    });

    it("should reject bids with insufficient ETH using on-chain minimum", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Insufficient", 3600, 100n, "0.1");

      const bid = await encryptBid(aliceClient, 500n);
      const lowBidWei = hre.ethers.parseEther("0.05"); // Below 0.1 ETH minimum

      await expect(
        shadowBid.connect(alice).placeBid(0, bid, { value: lowBidWei }),
      ).to.be.revertedWithCustomError(shadowBid, "InsufficientETH");
    });

    it("should reject bids on finalized auction", async function () {
      const { shadowBid, seller, alice, carol, sellerClient, aliceClient, carolClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Finalized", 60);

      // Alice bids first
      const bid = await encryptBid(aliceClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");
      await shadowBid.connect(alice).placeBid(0, bid, { value: bidWei });

      // Finalize
      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");
      await shadowBid.connect(seller).finalize(0);

      // Carol tries to bid after finalize — but bidding period also ended
      // The modifiers check in order: auctionExists → biddingActive → notFinalized
      // BiddingPeriodEnded triggers first, which is correct behavior
      // We verify the bid is rejected (the exact error depends on modifier order)
      const carolBid = await encryptBid(carolClient, 600n);
      await expect(
        shadowBid.connect(carol).placeBid(0, carolBid, { value: bidWei }),
      ).to.be.reverted; // Reverted with either BiddingPeriodEnded or AuctionAlreadyFinalized
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

      await createTestAuction(shadowBid, seller, sellerClient, "Rare Token");

      // Alice bids 500, Bob bids 1500, Carol bids 800
      const aliceBid = await encryptBid(aliceClient, 500n);
      const bobBid = await encryptBid(bobClient, 1500n);
      const carolBid = await encryptBid(carolClient, 800n);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(0, aliceBid, { value: bidWei });
      await shadowBid.connect(bob).placeBid(0, bobBid, { value: bidWei });
      await shadowBid.connect(carol).placeBid(0, carolBid, { value: bidWei });

      // Use the mock coprocessor to read raw plaintext of the encrypted state.
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

      await createTestAuction(shadowBid, seller, sellerClient, "Descending");

      // Alice bids 3000, Bob bids 2000, Carol bids 1000
      const aliceBid = await encryptBid(aliceClient, 3000n);
      const bobBid = await encryptBid(bobClient, 2000n);
      const carolBid = await encryptBid(carolClient, 1000n);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(0, aliceBid, { value: bidWei });
      await shadowBid.connect(bob).placeBid(0, bobBid, { value: bidWei });
      await shadowBid.connect(carol).placeBid(0, carolBid, { value: bidWei });

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

      await createTestAuction(shadowBid, seller, sellerClient, "Tie");

      // Both bid 1000
      const aliceBid = await encryptBid(aliceClient, 1000n);
      const bobBid = await encryptBid(bobClient, 1000n);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(0, aliceBid, { value: bidWei });
      await shadowBid.connect(bob).placeBid(0, bobBid, { value: bidWei });

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

      // Minimum bid = 1000, minimumBidWei = 0.1 ETH
      await createTestAuction(shadowBid, seller, sellerClient, "MinBid Test", 3600, 1000n, "0.1");

      // Alice bids 500 (below min), Bob bids 2000 (above min)
      const aliceBid = await encryptBid(aliceClient, 500n);
      const bobBid = await encryptBid(bobClient, 2000n);

      const bidWei = hre.ethers.parseEther("0.1");
      await shadowBid.connect(alice).placeBid(0, aliceBid, { value: bidWei });
      await shadowBid.connect(bob).placeBid(0, bobBid, { value: bidWei });

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

      await createTestAuction(shadowBid, seller, sellerClient, "Fin", 60);

      const bid = await encryptBid(aliceClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");
      await shadowBid.connect(alice).placeBid(0, bid, { value: bidWei });

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      await shadowBid.connect(seller).finalize(0);

      const auction = await shadowBid.auctions(0);
      expect(auction.finalized).to.be.true;
    });

    it("should reject finalize from non-seller", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "NoAuth", 60);

      const bid = await encryptBid(aliceClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");
      await shadowBid.connect(alice).placeBid(0, bid, { value: bidWei });

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      await expect(
        shadowBid.connect(alice).finalize(0),
      ).to.be.revertedWithCustomError(shadowBid, "OnlySellerCanFinalize");
    });

    it("should reject finalize before bidding ends", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Early", 3600);

      const bid = await encryptBid(aliceClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");
      await shadowBid.connect(alice).placeBid(0, bid, { value: bidWei });

      await expect(
        shadowBid.connect(seller).finalize(0),
      ).to.be.revertedWithCustomError(shadowBid, "BiddingPeriodActive");
    });

    it("should reject finalize when there are no bids", async function () {
      const { shadowBid, seller, sellerClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Empty", 60);

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      await expect(
        shadowBid.connect(seller).finalize(0),
      ).to.be.revertedWithCustomError(shadowBid, "NoBids");
    });

    it("should reject double finalize", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Double Fin", 60);

      const bid = await encryptBid(aliceClient, 500n);
      const bidWei = hre.ethers.parseEther("0.05");
      await shadowBid.connect(alice).placeBid(0, bid, { value: bidWei });

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      await shadowBid.connect(seller).finalize(0);

      await expect(
        shadowBid.connect(seller).finalize(0),
      ).to.be.revertedWithCustomError(shadowBid, "AuctionAlreadyFinalized");
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

      await createTestAuction(shadowBid, seller, sellerClient, "Reveal Test", 60);

      // Alice 300, Bob 900, Carol 600
      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
        { value: bidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
        { value: bidWei },
      );
      await shadowBid.connect(carol).placeBid(
        0,
        await encryptBid(carolClient, 600n),
        { value: bidWei },
      );

      // Finalize and reveal
      await finalizeAndReveal(shadowBid, seller, sellerClient);

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

      await createTestAuction(shadowBid, seller, sellerClient, "Event Test", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 420n),
        { value: bidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 690n),
        { value: bidWei },
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

    it("should reject reveal without finalize", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "No Reveal", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 500n),
        { value: bidWei },
      );

      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");

      // Try to reveal without finalize — should fail because
      // ctHashes won't have public access, but the direct revert
      // should be RevealNotReady
      const fakeCtHash = await shadowBid.getHighestBidCtHash(0);
      const fakeBidderCtHash = await shadowBid.getHighestBidderCtHash(0);

      await expect(
        shadowBid.connect(seller).revealWinner(
          0,
          fakeCtHash,
          500n,
          "0x",
          fakeBidderCtHash,
          alice.address,
          "0x",
        ),
      ).to.be.revertedWithCustomError(shadowBid, "RevealNotReady");
    });

    it("should reject double reveal", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Double Reveal", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 500n),
        { value: bidWei },
      );

      // First reveal succeeds
      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // Second reveal should fail
      const fakeCtHash = await shadowBid.getHighestBidCtHash(0);
      const fakeBidderCtHash = await shadowBid.getHighestBidderCtHash(0);

      await expect(
        shadowBid.connect(seller).revealWinner(
          0,
          fakeCtHash,
          500n,
          "0x",
          fakeBidderCtHash,
          alice.address,
          "0x",
        ),
      ).to.be.revertedWithCustomError(shadowBid, "AuctionAlreadyFinalized");
    });
  });

  // ─────────────────────── Payment Flow ───────────────────────

  describe("claimPayment", function () {
    it("should allow seller to claim winning bid after reveal", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Payment Test", 60);

      // Alice bids 0.05 ETH, Bob bids 0.1 ETH
      const aliceBidWei = hre.ethers.parseEther("0.05");
      const bobBidWei = hre.ethers.parseEther("0.1");

      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
        { value: aliceBidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
        { value: bobBidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // Claim payment
      const sellerBalanceBefore = await hre.ethers.provider.getBalance(seller.address);
      await shadowBid.connect(seller).claimPayment(0);
      const sellerBalanceAfter = await hre.ethers.provider.getBalance(seller.address);

      // Seller should receive Bob's 0.1 ETH (minus gas)
      expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);
      expect(await shadowBid.isPaymentClaimed(0)).to.be.true;
    });

    it("should reject claimPayment from non-seller", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "No Claim", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 500n),
        { value: bidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // Non-seller tries to claim — should use OnlySellerCanClaim error
      await expect(
        shadowBid.connect(alice).claimPayment(0),
      ).to.be.revertedWithCustomError(shadowBid, "OnlySellerCanClaim");
    });

    it("should reject double claimPayment", async function () {
      const {
        shadowBid,
        seller,
        alice,
        sellerClient,
        aliceClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Double Claim", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 500n),
        { value: bidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // First claim succeeds
      await shadowBid.connect(seller).claimPayment(0);

      // Second claim fails
      await expect(
        shadowBid.connect(seller).claimPayment(0),
      ).to.be.revertedWithCustomError(shadowBid, "PaymentAlreadyClaimed");
    });

    it("should reject claimPayment before reveal", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Early Claim", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 500n),
        { value: bidWei },
      );

      // Finalize but don't reveal
      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");
      await shadowBid.connect(seller).finalize(0);

      await expect(
        shadowBid.connect(seller).claimPayment(0),
      ).to.be.revertedWithCustomError(shadowBid, "RevealNotReady");
    });
  });

  // ─────────────────────── Refund Flow ───────────────────────

  describe("claimRefund", function () {
    it("should allow losing bidders to claim refund", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Refund Test", 60);

      // Alice bids 0.05 ETH, Bob bids 0.1 ETH (winner)
      const aliceBidWei = hre.ethers.parseEther("0.05");
      const bobBidWei = hre.ethers.parseEther("0.1");

      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
        { value: aliceBidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
        { value: bobBidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // Alice (loser) claims refund
      const aliceBalanceBefore = await hre.ethers.provider.getBalance(alice.address);
      await shadowBid.connect(alice).claimRefund(0);
      const aliceBalanceAfter = await hre.ethers.provider.getBalance(alice.address);

      // Alice should get her 0.05 ETH back (minus gas)
      expect(aliceBalanceAfter).to.be.gt(aliceBalanceBefore);
      expect(await shadowBid.getBidderDeposit(0, alice.address)).to.equal(0);
    });

    it("should reject refund for winner", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Winner No Refund", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
        { value: bidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
        { value: bidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // Bob (winner) tries to claim refund — should fail
      await expect(
        shadowBid.connect(bob).claimRefund(0),
      ).to.be.revertedWithCustomError(shadowBid, "WinnerCannotRefund");
    });

    it("should reject double refund", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Double Refund", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
        { value: bidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
        { value: bidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // First refund succeeds
      await shadowBid.connect(alice).claimRefund(0);

      // Second refund fails
      await expect(
        shadowBid.connect(alice).claimRefund(0),
      ).to.be.revertedWithCustomError(shadowBid, "NoRefundAvailable");
    });

    it("should reject refund before reveal", async function () {
      const { shadowBid, seller, alice, sellerClient, aliceClient } =
        await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Early Refund", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 500n),
        { value: bidWei },
      );

      // Finalize but don't reveal
      await hre.network.provider.send("evm_increaseTime", [61]);
      await hre.network.provider.send("evm_mine");
      await shadowBid.connect(seller).finalize(0);

      await expect(
        shadowBid.connect(alice).claimRefund(0),
      ).to.be.revertedWithCustomError(shadowBid, "RevealNotReady");
    });

    it("should emit RefundClaimed event", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Refund Event", 60);

      const aliceBidWei = hre.ethers.parseEther("0.05");
      const bobBidWei = hre.ethers.parseEther("0.1");

      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
        { value: aliceBidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
        { value: bobBidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      await expect(
        shadowBid.connect(alice).claimRefund(0),
      )
        .to.emit(shadowBid, "RefundClaimed")
        .withArgs(0, alice.address, aliceBidWei);
    });

    it("should reject refund from non-bidder", async function () {
      const {
        shadowBid,
        seller,
        alice,
        bob,
        carol,
        sellerClient,
        aliceClient,
        bobClient,
      } = await loadFixture(deployFixture);

      await createTestAuction(shadowBid, seller, sellerClient, "Non-Bidder Refund", 60);

      const bidWei = hre.ethers.parseEther("0.01");
      await shadowBid.connect(alice).placeBid(
        0,
        await encryptBid(aliceClient, 300n),
        { value: bidWei },
      );
      await shadowBid.connect(bob).placeBid(
        0,
        await encryptBid(bobClient, 900n),
        { value: bidWei },
      );

      await finalizeAndReveal(shadowBid, seller, sellerClient);

      // Carol never bid — should revert
      await expect(
        shadowBid.connect(carol).claimRefund(0),
      ).to.be.revertedWithCustomError(shadowBid, "NoRefundAvailable");
    });
  });
});
