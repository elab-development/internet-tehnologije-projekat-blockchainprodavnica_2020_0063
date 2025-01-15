const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "TokenMaster";
const SYMBOL = "TM";
const OCCASION_NAME = "ZDRAVKO COLIC";
const OCCASION_COST = ethers.utils.parseUnits("1", "ether");
const OCCASION_MAX_TICKETS = 100;
const OCCASION_TIME = "20:00";
const OCCASION_LOCATION = "STARK ARENA, Beograd";
const OCCASION_DATE = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 45; // 45 dana od sada

describe("TokenMaster", () => {
  let tokenMaster, deployer, buyer;

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();

    const TokenMaster = await ethers.getContractFactory("TokenMaster");
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);

    const transaction = await tokenMaster
      .connect(deployer)
      .list(
        OCCASION_NAME,
        OCCASION_COST,
        OCCASION_MAX_TICKETS,
        OCCASION_DATE,
        OCCASION_TIME,
        OCCASION_LOCATION
      );

    await transaction.wait();
  });

  describe("Deployment", () => {
    it("Sets the name", async () => {
      let name = await tokenMaster.name();
      expect(name).to.equal(NAME);
    });
    it("Sets the symbol", async () => {
      let symbol = await tokenMaster.symbol();
      expect(symbol).to.equal(SYMBOL);
    });
    it("Sets the owner", async () => {
      expect(await tokenMaster.owner()).to.equal(deployer.address);
    });
  });

  describe("Occasions", () => {
    it("Updates occasions count", async () => {
      const totalOccasions = await tokenMaster.totalOccasions();
      expect(totalOccasions.toNumber()).to.be.equal(1);
    });

    it("Returns occasions count", async () => {
      const occasion = await tokenMaster.getOccasion(1);

      expect(occasion.id.toNumber()).to.be.equal(1);
      expect(occasion.name).to.be.equal(OCCASION_NAME);
      expect(occasion.cost.toString()).to.be.equal(OCCASION_COST.toString());
      expect(occasion.maxTickets).to.be.equal(OCCASION_MAX_TICKETS);
      expect(occasion.ticketsSold).to.be.equal(0);
      expect(occasion.eventTimestamp.toNumber()).to.be.equal(OCCASION_DATE); // UNIX timestamp
      expect(occasion.time).to.be.equal(OCCASION_TIME);
      expect(occasion.location).to.be.equal(OCCASION_LOCATION);
    });
  });

  describe("Minting", () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");

    beforeEach(async () => {
      const transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();
    });

    it("Updates ticket count", async () => {
      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.ticketsSold).to.be.equal(1);
    });
    it("Updates buying status", async () => {
      const status = await tokenMaster.hasBought(ID, buyer.address);
      expect(status).to.be.equal(true);
    });
    it("Updates seat status", async () => {
      const owner = await tokenMaster.seatTaken(ID, SEAT);
      expect(owner).to.equal(buyer.address);
    });
    it("Updates overall seating status", async () => {
      const seats = await tokenMaster.getSeatsTaken(ID);
      expect(seats.length).to.equal(1);
      expect(seats[0]).to.equals(SEAT);
    });
    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(tokenMaster.address);
      expect(balance).to.be.equal(AMOUNT);
    });
  });

  describe("Refunding", () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");

    beforeEach(async () => {
      const transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();
    });

    it("Refunds full amount if more than 30 days before event", async () => {
      const balanceBefore = await ethers.provider.getBalance(buyer.address);

      const transaction = await tokenMaster.connect(buyer).refund(ID, SEAT);
      const receipt = await transaction.wait();

      const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
      const balanceAfter = await ethers.provider.getBalance(buyer.address);

      expect(balanceAfter.add(gasUsed)).to.be.closeTo(
        balanceBefore.add(AMOUNT),
        ethers.utils.parseUnits("0.01", "ether")
      );

      const occasion = await tokenMaster.getOccasion(ID);
      expect(occasion.ticketsSold).to.equal(0);
    });

    it("Refunds half amount if between 15 and 30 days before event", async () => {
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 25]);
      await ethers.provider.send("evm_mine");

      const balanceBefore = await ethers.provider.getBalance(buyer.address);

      const transaction = await tokenMaster.connect(buyer).refund(ID, SEAT);
      const receipt = await transaction.wait();

      const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
      const balanceAfter = await ethers.provider.getBalance(buyer.address);

      expect(balanceAfter.add(gasUsed)).to.be.closeTo(
        balanceBefore.add(AMOUNT.div(2)),
        ethers.utils.parseUnits("0.01", "ether")
      );

      const occasion = await tokenMaster.getOccasion(ID);
      expect(occasion.ticketsSold).to.equal(0);
    });
    it("Does not allow refund within 15 days of the event", async () => {
      // Pomeramo vreme na 15 dana i 1 sekundu pre događaja
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 15 + 1]);
      await ethers.provider.send("evm_mine");

      await expect(
        tokenMaster.connect(buyer).refund(ID, SEAT)
      ).to.be.revertedWith("Refund not allowed within 15 days of the event");
    });
  });

  describe("Get User Purchases", () => {
    const ID = 1;
    const SEAT = 50;

    beforeEach(async () => {
      const transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: OCCASION_COST });
      await transaction.wait();
    });

    it("Returns purchases for a user", async () => {
      const purchases = await tokenMaster.getUserPurchases(buyer.address);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(ID);
    });
  });

  describe("Withdrawing", () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();

      transaction = await tokenMaster.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(tokenMaster.address);
      expect(balance).to.equal(0);
    });
  });
});
