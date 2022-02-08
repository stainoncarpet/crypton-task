const { ethers } = require("ethers");

const network = "ropsten"; // ""rinkeby

const API_TOKEN = process.env.ALCHEMY_API_URL_KEY;

const runTasks = async () => {
    task("accounts", "Prints the list of accounts")
        .setAction(async (taskArguments, hre) => {
            const accounts = await hre.ethers.getSigners();

            for (const account of accounts) {
                console.log(account.address);ß
            }
        })
    ;

    // task("refund", "Return donations to donator")
    //     .addParam("address", "Donator's address")
    //     .setAction(async (taskArguments, hre) => {
    //         const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
    //         const alchemyProvider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_URL_KEY);
    //         const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
    //         const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

    //         const returnedAmount = await contractInstance.getDonationsByDonator(walletOwner.address);
    //         await returnedAmount.wait();
    //         const tx = await contractInstance.returnDonationsToAddress(walletOwner.address);
    //         await tx.wait();

    //         console.log(`${ethers.utils.formatEther(returnedAmount)} returned to address ${walletOwner.address}`);
    //     })
    // ;

    task("donate", "Send a certain amount of wei to the contract's address")
        .addParam("address", "Contract address")
        .addParam("amount", "Amount to donate in wei")
        .setAction(async (taskArguments, hre) => {
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, API_TOKEN);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);

            const donationTransaction = await walletOwner.sendTransaction({ to: taskArguments.address, value: taskArguments.amount});

            console.log(`Donation of ${taskArguments.amount} was successful`);
            console.log("Receipt: ", donationTransaction);
        })
    ;

    task("extract", "Extract specified amount from contract's donations pool to specified address")
        .addParam("addressc", "Contract address")
        .addParam("addressr", "Recipient's address")
        .addParam("amount", "Amount to send")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, API_TOKEN);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.addressc, contractSchema.abi, walletOwner);

            const extractionTx = await contractInstance.extractAmount(taskArguments.addressr, taskArguments.amount);

            console.log(`Extracted ${taskArguments.amount} to ${taskArguments.address} successfully`);
            console.log("Receipt: ", extractionTx);
        })
    ;

    task("donators", "Show list of donators")
        .addParam("address", "Contract address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");

            const alchemyProvider = new ethers.providers.AlchemyProvider(network, API_TOKEN);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const donatorTx = await contractInstance.getAllDonators();

            console.log(`${donatorTx.length} donators found: ${donatorTx}`);
        })
    ;

    task("donator", "View donator's total amount donated")
        .addParam("addressc", "Contract address")
        .addParam("addressd", "Donators's address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");
            const alchemyProvider = new ethers.providers.AlchemyProvider(network, API_TOKEN);
            const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new ethers.Contract(taskArguments.addressc, contractSchema.abi, walletOwner);

            const donated = await contractInstance.getDonationsByDonator(taskArguments.addressd);

            console.log(`Address donated ${donated} wei in total`);
        })
    ;

    // task("terminate", "Terminate contract")
    //     .addParam("address", "Contract address")
    //     .setAction(async (taskArguments, hre) => {
    //         const contractSchema = require("../artifacts/contracts/Donatello.sol/Donatello.json");

    //         const defaultProvider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_URL_KEY);
    //         const walletOwner = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, defaultProvider);
    //         const contractInstance = new ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

    //         const terminationTx = await contractInstance.terminateContract();

    //         console.log(`Contract terminated ${terminationTx}`);
    //     })
    // ;
};

module.exports = { runTasks };