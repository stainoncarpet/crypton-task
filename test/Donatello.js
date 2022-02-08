const { expect } = require("chai");
const { ethers } = require("hardhat");

let Donatello, donatello, signers;

describe("Ownership and initial balance", () => {
  beforeEach(async () => {
    Donatello = await ethers.getContractFactory("Donatello");
    donatello = await Donatello.deploy();
    signers = await ethers.getSigners();
    await donatello.deployed();
  });

  it("Initial balance should be 0, owner should be whoever deployed contract and shouldn't be able to extract if balance is 0", async () => {
    expect(await donatello.getBalance()).to.equal(0);
    expect(await donatello.owner()).to.equal(donatello.signer.address);
    expect(donatello.extractAllDonations(await donatello.owner())).to.be.revertedWith("There is nothing to extract");
    expect((await donatello.getAllDonators()).length).to.equal(0);
  });

  it("Contract shouldn't have owner after it's terminated", async () => {
    await donatello.owner();
    await donatello.terminateContract();
    expect(donatello.owner()).to.be.reverted;
  });
});

describe("Transactions & balances", () => {
  beforeEach(async () => {
    Donatello = await ethers.getContractFactory("Donatello");
    donatello = await Donatello.deploy();
    signers = await ethers.getSigners();
    await donatello.deployed();
  });

  it("Shouldn't be able to donate 0", async () => {
    expect(signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("0") })).to.be.revertedWith("Incorrect donation amount")
  });

  it("Contract owner should be able to extract some, but not too much", async () => {
    // donate 5 eth
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("5") });

    // check if contract balance is correct
    const contractEthBalance = await donatello.getBalance();
    expect(parseInt(ethers.utils.formatEther(contractEthBalance))).to.equal(5);

    const ownerBalanceBeforeExtraction = await signers[0].getBalance();

    // try to extract 10 eth to owner's balance
    expect(donatello.extractAmount(signers[0].address, ethers.utils.parseEther("10"))).to.be.revertedWith("Specified amount is higher than contract's balance")

    // extract 2 eth to owner's balance
    await donatello.extractAmount(signers[0].address, ethers.utils.parseEther("2"));

    const ownerBalanceAfterExtraction = await signers[0].getBalance();
    expect(
      Math.round(ethers.utils.formatEther(ownerBalanceAfterExtraction) - ethers.utils.formatEther(ownerBalanceBeforeExtraction))
    )
      .to.equal(2);
  });

  it("Donation should increase contract's balance and correctly record donator's donation", async () => {
    // donate 3 eth
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("3") });

    // check if contract balance is correct
    const contractEthBalance = await donatello.getBalance();
    expect(parseInt(ethers.utils.formatEther(contractEthBalance))).to.equal(3);

    // check if correct amount is tied to donator address
    const donationRecord = await donatello.getDonationsByDonator(signers[1].address);
    expect(parseInt(ethers.utils.formatEther(donationRecord))).to.equal(3);

    // check if any other record changed
    const voidDonationRecord = await donatello.getDonationsByDonator(signers[2].address);
    expect(parseInt(ethers.utils.formatEther(voidDonationRecord))).to.equal(0);
  });

  it("Non-owner shouldn't be able to extract donations", async () => {
    // donate 1 eth
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("1") });
    const contractEthBalance = await donatello.getBalance();

    // check if contract balance is correct
    expect(parseInt(ethers.utils.formatEther(contractEthBalance))).to.equal(1);

    // try to extract eth to non-owner address
    expect(donatello.connect(signers[2]).extractAllDonations(signers[2].address)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Multiple donations should be registered correctly and owner should be able to extract all", async () => {
    // donate from 3 different addresses 6 eth in total
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("1") });
    await signers[2].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("2") });
    await signers[3].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("3") });

    // check if contract balance is correct
    const contractEthBalance = await donatello.getBalance();
    expect(parseInt(ethers.utils.formatEther(contractEthBalance))).to.equal(6);

    // remember how much eth owner's address has before extraction, then extract
    const ownerEthBalanceBeforeExtraction = parseInt(ethers.utils.formatEther(await signers[0].getBalance()));
    await donatello.extractAllDonations(signers[0].address);

    // remember how much eth contract and owner have after extraction
    const contractEthBalanceAfterExtraction = await donatello.getBalance();
    const ownerEthBalanceAfterExtraction = parseInt(ethers.utils.formatEther(await signers[0].getBalance()));

    // check if contract balance was emptied and owner's address receved the correct amount of eth
    expect(parseInt(ethers.utils.formatEther(contractEthBalanceAfterExtraction))).to.equal(0);
    expect(ownerEthBalanceAfterExtraction - ownerEthBalanceBeforeExtraction).to.equal(6);

    // check if the contract remembers addresses of donators
    expect((await donatello.getAllDonators()).length).to.equal(3);
  });

  it("Multiple donations from one address should be combined and recorded as originated from that address", async () => {
    // donate 10 eth in 4 transations
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("1") });
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("2") });
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("3") });
    await signers[1].sendTransaction({ to: donatello.address, value: ethers.utils.parseEther("4") });

    // get address-specific amount of donated eth and contract balance
    const aggregatedDonationsByAdress = await donatello.getDonationsByDonator(signers[1].address);
    const contractEthBalanceAfterDonations = await donatello.getBalance();

    // check if contract's balance is correct and all donations are tied to single donator
    expect(parseInt(ethers.utils.formatEther(contractEthBalanceAfterDonations))).to.equal(10);
    expect(parseInt(ethers.utils.formatEther(aggregatedDonationsByAdress))).to.equal(10);
    expect((await donatello.getAllDonators()).length).to.equal(1);
  });
});