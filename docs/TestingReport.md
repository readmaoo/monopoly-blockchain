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
## Live Transaction Demonstration

During testing, the application was demonstrated with real blockchain transactions using MetaMask on a local Ethereum test network.

### Create Game
When the user clicks the "Create Game" button, a blockchain transaction is sent through MetaMask.
This transaction calls the createGame() method of the MonopolyGame smart contract.
After confirmation, a new game ID is generated on-chain.

### Start Game
After players join, the game is started by calling the startGame() method.
This transaction mints ERC-20 tokens and distributes them to all players.
The token balance is updated only after the transaction is confirmed.

### Roll Dice
Each dice roll is executed by calling the rollDice() method.
This action requires a MetaMask transaction and cannot be performed without user confirmation.
The new player position is calculated and stored on the blockchain.

### Buy Property
When a player lands on a property, they can purchase it by calling the buyProperty() method.
This transaction transfers ERC-20 tokens from the player to the contract and updates property ownership.

### Transaction Transparency
All actions are executed as real blockchain transactions.
MetaMask displays transaction details such as method name, contract address, and gas fee.
This confirms that the application performs real on-chain interactions.

## Conclusion
The testing process confirmed that the application behaves correctly and demonstrates real blockchain interaction on an Ethereum test network.
