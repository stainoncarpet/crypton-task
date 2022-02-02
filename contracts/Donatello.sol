//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Donatello is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private donatorsList;
    mapping(address => uint256) private donationsByDonator;

    enum TxType { BALANCE, VALUE }

    constructor() {}

    // I know, uint can't be less than 0, but can't be too safe
    modifier onlyPositive(TxType txType, uint256 txAmount) {
        if (txType == TxType.BALANCE && txAmount <= 0) {
            revert("There is nothing to extract");
        } else if (txType == TxType.VALUE && txAmount <= 0) {
            revert("Incorrect donation amount");
        }
        _;
    }

    // use built-in function to receive donations
    receive() external payable onlyPositive(TxType.VALUE, msg.value) {
        donationsByDonator[msg.sender] += msg.value;
        donatorsList.add(msg.sender);
    }

    function getDonationsByDonator(address _donator) external view returns(uint256) {
        return donationsByDonator[_donator];
    } 

    function extractAllDonations(address payable _to) external onlyOwner onlyPositive(TxType.BALANCE, address(this).balance) {
        _to.transfer(address(this).balance);
    }

    // TODO: test
    function extractAmount(address payable _to, uint256 _amount) external onlyOwner onlyPositive(TxType.BALANCE, address(this).balance) {
        require(address(this).balance >= _amount, "Specified amount is higher than what's on contract's balance");
        _to.transfer(_amount);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // onlyowner
    function terminateContract() external onlyOwner {
        selfdestruct(payable(owner()));
    }

    function getAllDonators() external view returns (address[] memory) {
        return donatorsList.values();
    }

    // extra functions to create a task for
    function returnDonationsToAddress(address payable _donator) external onlyOwner {
        require(donationsByDonator[_donator] > 0, "No donations originating from address found");
        uint256 amountToReturn = donationsByDonator[_donator];
        _donator.transfer(amountToReturn);
        donationsByDonator[_donator] = 0;
        donatorsList.remove(_donator);
    }
}