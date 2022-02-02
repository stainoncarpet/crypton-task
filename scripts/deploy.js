const hre = require("hardhat");

const main = async () => {
  const Donatello = await hre.ethers.getContractFactory("Donatello");
  const donatello = await Donatello.deploy();

  await donatello.deployed();

  console.log(`Contract 'Donatello' deployed to ${donatello.address} by account ${donatello.signer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });