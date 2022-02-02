const { ethers } = require("ethers");

const network = "rinkeby";

const runTasks = async () => {
    task("accounts", "Prints the list of accounts")
        .setAction(async (taskArguments, hre, runSuper) => {
            const accounts = await hre.ethers.getSigners();

            for (const account of accounts) {
                console.log(account.address);
            }
        })
    ;

    task("refund", "Return donations to donator")
        .addParam("address", "Donator's address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_URL_KEY);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const returnedAmount = await contractInstance.getDonationsByDonator(walletOwner.address);
            await returnedAmount.wait();
            const tx = await contractInstance.returnDonationsToAddress(walletOwner.address);
            await tx.wait();

            console.log(`${ethers.utils.formatEther(returnedAmount)} returned to address ${walletOwner.address}`);
        })
    ;

    task("donate", "Send a certain amount of wei to the contract's address")
        .addParam("amount", "Amount to donate in wei")
        .setAction(async (taskArguments, hre, runSuper) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_URL_KEY);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const donationTransaction = await contractInstance.sendTransaction({ to: contractInstance.address, value: taskArguments.amount});
            await donationTransaction.wait();

            console.log(`Donation of ${taskArguments.amount} was successful`);
        })
    ;

    task("extract", "Extract specified amount from contract to specified address")
        .addParam("address", "Adress to send funds to")
        .addParam("amount", "Amount to send")
        .setAction(async (taskArguments, hre, runSuper) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_URL_KEY);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const extractionTx = await contractInstance.extractAmount(taskArguments.address, taskArguments.amount);
            await extractionTx.wait();

            console.log(`Extracted ${taskArguments.amount} to ${taskArguments.address} successfully`);
        })
    ;

    task("donators", "Prints the list of accounts")
        .addParam("amount", "")
        .setAction(async (taskArguments, hre, runSuper) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_URL_KEY);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const donatorTx = await contractInstance.getAllDonators();
            await donatorTx.wait();

            console.log(`${donatorsTx.length} donators found: ${donatorsTx}`);
        })
    ;

    task("donator", "View donator's total amount donated")
        .addParam("address", "Donator's address")
        .setAction(async (taskArguments, hre, runSuper) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_URL_KEY);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const donatorTx = await contractInstance.getDonationsByDonator(taskArguments.address);
            await donatorTx.wait();

            console.log(`Address donated ${donatorTx} in total`);
        })
    ;

    task("terminate", "Terminate contract")
        .addParam("address", "Contract address")
        .setAction(async (taskArguments, hre, runSuper) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const defaultProvider = new ethers.providers.getDefaultProvider("http://localhost:8545")
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, defaultProvider);
            const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const signers = await hre.ethers.getSigners();
            await signers[19].sendTransaction({ to: "0x844142a15023cAb209F5fA33FB0497854aD60344", value: ethers.utils.parseEther("10")})
            // 0x844142a15023cAb209F5fA33FB0497854aD60344

            // const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            // const defaultProvider = new ethers.providers.getDefaultProvider("http://localhost:8545")
            // const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, defaultProvider);
            // const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            // const terminationTx = await contractInstance.terminateContract();
            // await terminationTx.wait();

            // console.log(`Contract terminated ${terminationTx}`);
        })
    ;
};

module.exports = { runTasks };