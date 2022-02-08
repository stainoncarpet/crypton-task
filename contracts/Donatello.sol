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

    modifier onlyPositive(TxType txType, uint256 txAmount) {
        if (txType == TxType.BALANCE && txAmount <= 0) {
            revert("There is nothing to extract");
        } else if (txType == TxType.VALUE && txAmount <= 0) {
            revert("Incorrect donation amount");
        }
        _;
    }

    receive() external payable onlyPositive(TxType.VALUE, msg.value) {
        donationsByDonator[msg.sender] += msg.value;
        donatorsList.add(msg.sender);
    }

    function extractAllDonations(address payable _to) external onlyOwner onlyPositive(TxType.BALANCE, address(this).balance) {
        _to.transfer(address(this).balance);
    }

    function extractAmount(address payable _to, uint256 _amount) external onlyOwner onlyPositive(TxType.BALANCE, address(this).balance) {
        require(address(this).balance >= _amount, "Specified amount is higher than contract's balance");
        _to.transfer(_amount);
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getAllDonators() external view returns (address[] memory) {
        return donatorsList.values();
    }

    function getDonationsByDonator(address _donator) external view returns(uint256) {
        return donationsByDonator[_donator];
    } 

    function terminateContract() external onlyOwner {
        selfdestruct(payable(owner()));
    }
}