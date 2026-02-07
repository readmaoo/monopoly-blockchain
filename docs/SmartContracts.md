# Smart Contracts Description

## Overview
The Monopoly Blockchain project uses Solidity smart contracts to implement all core game logic.
Smart contracts ensure transparency, fairness, and decentralized state management.

## MonopolyGame.sol
This contract manages the main game logic, including:
- Creating new game sessions
- Allowing players to join a game
- Managing player turns
- Generating dice rolls
- Handling property ownership
- Processing rent payments
- Determining the game winner

All game actions are executed through blockchain transactions and validated by the smart contract.

## GameToken.sol
GameToken is an ERC-20 utility token used internally within the game.

Token characteristics:
- Minted automatically when the game starts
- Distributed equally to players
- Used for buying properties and paying rent
- Has no real-world monetary value

## Security Considerations
The smart contracts include basic security mechanisms:
- Access control for game actions
- Validation of player turns
- Prevention of invalid game actions
- Controlled token minting

## Conclusion
The smart contract layer demonstrates practical use of Solidity, ERC-20 standards, and decentralized application logic on an Ethereum test network.
