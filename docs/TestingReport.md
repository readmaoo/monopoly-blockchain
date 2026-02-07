# Testing Report

## Overview
This document describes the testing process performed for the Monopoly Blockchain project.
Testing focused on smart contracts, frontend interactions, and MetaMask integration.

## Smart Contract Testing
The following smart contract functions were tested:

- createGame() – game creation works as expected
- joinGame() – players can join before the game starts
- startGame() – tokens are minted and distributed correctly
- rollDice() – dice generates values between 1 and 6
- buyProperty() – property ownership is updated correctly
- payRent() – rent is transferred between players
- endGame() – winner is determined correctly

Edge cases such as invalid actions and incorrect turn order were also tested.

## Frontend Testing
Frontend testing included:
- MetaMask wallet connection
- Network validation (testnet only)
- UI updates after transactions
- Handling of rejected transactions

## MetaMask Integration Testing
MetaMask integration was tested by:
- Requesting wallet access
- Signing transactions
- Confirming transaction status
- Handling user rejection

## Bug Tracking
All identified issues were recorded in the BUGS.md file.
Bug fixes were verified through regression testing.

## Conclusion
The testing process confirmed that the application behaves correctly and demonstrates real blockchain interaction on an Ethereum test network.
