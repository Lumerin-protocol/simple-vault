// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleVault is Ownable {
  using SafeERC20 for IERC20;

  /// @notice Token to be stored in the vault
  IERC20 public token;

  /// @dev userAddress => balance
  mapping(address => uint256) private balances;

  /// @dev Kept for convenience of tracking claimed amounts
  mapping(address => uint256) private claimed;

  error InsufficientBalance();
  error ArrayLengthMismatch();
  error ZeroAddress();
  error NoAddressesProvided();
  error ZeroBalance();

  event Deposit(address indexed user, uint256 amount);
  event Claim(address indexed user, uint256 amount);
  event Cancel(address indexed user, uint256 amount);

  constructor(address _token) Ownable(_msgSender()) {
    token = IERC20(_token);
  }

  /// @notice Deposit tokens to the vault
  /// @param users array of addresses to deposit tokens for
  /// @param amounts array of amounts to deposit for corresponding addresses
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
      uint256 amount = amounts[i];

      if (userAddress == address(0)) {
        revert ZeroAddress();
      }

      totalAmount += amount;
      balances[userAddress] += amount;
      emit Deposit(userAddress, amount);
    }

    token.safeTransferFrom(_msgSender(), address(this), totalAmount);
  }

  /// @notice Claim tokens from the vault for the sender address
  /// @param amount amount to claim
  function claim(uint256 amount) public {
    uint256 balance = balances[_msgSender()];
    if (balance == 0) {
      revert ZeroBalance();
    }
    if (amount > balance) {
      revert InsufficientBalance();
    }
    if (amount == 0) {
      amount = balance;
    }

    balances[_msgSender()] -= amount;
    claimed[_msgSender()] += amount;
    emit Claim(_msgSender(), amount);
    token.safeTransfer(_msgSender(), amount);
  }

  /// @notice [OnlyOwner] Cancel tokens for the provided addresses, sending them back to the sender
  /// @param users array of addresses to cancel tokens for
  function batchCancel(address[] calldata users) public onlyOwner {
    uint256 totalAmount;

    for (uint256 i = 0; i < users.length; i++) {
      address userAddress = users[i];
      uint256 userBalance = balances[userAddress];
      totalAmount += userBalance;
      balances[userAddress] = 0;
      emit Cancel(userAddress, userBalance);
    }

    if (totalAmount == 0) {
      revert ZeroBalance();
    }

    token.safeTransfer(_msgSender(), totalAmount);
  }

  /// @notice Get the balance of the provided user
  /// @param user user address to get the balance for
  function balanceOf(address user) public view returns (uint256) {
    return balances[user];
  }

  /// @notice Get the claimed amount of the provided user
  /// @param user user address to get the claimed amount for
  function claimedAmount(address user) public view returns (uint256) {
    return claimed[user];
  }
}
