// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleVault is Ownable {
  using SafeERC20 for IERC20;

  IERC20 public token;
  mapping(address => uint256) public balances;

  error InsufficientBalance();
  error ArrayLengthMismatch();
  error ZeroAddress();
  error NoAddressesProvided();
  error ZeroBalance();

  constructor(address _token) Ownable(msg.sender) {
    token = IERC20(_token);
  }

  function batchDeposit(address[] calldata users, uint256[] calldata amounts) public {
    if (users.length != amounts.length) {
      revert ArrayLengthMismatch();
    }
    if (users.length == 0) {
      revert NoAddressesProvided();
    }
    uint256 totalAmount;
    for (uint256 i = 0; i < users.length; i++) {
      address userAddress = users[i];
      if (userAddress == address(0)) {
        revert ZeroAddress();
      }
      totalAmount += amounts[i];
      balances[users[i]] += amounts[i];
    }
    token.safeTransferFrom(msg.sender, address(this), totalAmount);
  }

  function claim(uint256 amount) public {
    uint256 balance = balances[msg.sender];
    if (balance == 0) {
      revert ZeroBalance();
    }
    if (amount > balance) {
      revert InsufficientBalance();
    }
    if (amount == 0) {
      amount = balance;
    }
    balances[msg.sender] -= amount;
    token.safeTransfer(msg.sender, amount);
  }

  function batchCancel(address[] calldata users) public onlyOwner {
    uint256 totalAmount;

    for (uint256 i = 0; i < users.length; i++) {
      totalAmount += balances[users[i]];
      balances[users[i]] = 0;
    }

    if (totalAmount == 0) {
      revert ZeroBalance();
    }

    token.safeTransfer(msg.sender, totalAmount);
  }

  function balanceOf(address user) public view returns (uint256) {
    return balances[user];
  }
}
