# Monopoly Blockchain Game (Ethereum Testnet)

## Project Overview
This project is a decentralized multiplayer Monopoly-style game developed for educational purposes.
The application demonstrates smart contracts, ERC-20 token usage, MetaMask integration, and real blockchain interaction on an Ethereum test network.

## Purpose of the Project
The purpose of this project is to demonstrate practical skills in blockchain development, including:
- Smart contract development with Solidity
- ERC-20 token implementation
- MetaMask wallet integration
- Frontend-to-blockchain interaction
- Deployment on Ethereum test networks

## Technology Stack
- Solidity
- Hardhat
- Ethereum Test Network (Sepolia)
- MetaMask
- JavaScript (Vite + Vanilla JS)
- ethers.js

## Architecture
The project follows a decentralized application (DApp) architecture:
- Frontend interacts with smart contracts using ethers.js
- MetaMask is used to sign and send transactions
- All operations are executed on Ethereum test network using test ETH

## Smart Contracts
- MonopolyGame.sol — manages the game logic (game creation, joining, turns, dice rolls, property management)
- GameToken.sol — ERC-20 utility token used internally in the game and has no real-world value

## Frontend Features
- Connect MetaMask wallet
- Create and join game sessions
- Roll dice and interact with the game board
- Execute blockchain transactions through MetaMask

## Deployment
The project can be deployed on:
- Localhost (Hardhat)
- Sepolia Test Network

## Testing
The application was tested through multiple gameplay scenarios.
Smart contract functions and frontend interactions were manually tested.
Bug tracking and regression testing were performed during development.

## Documentation
Detailed project documentation is available in the `/docs` folder.

## Disclaimer
This project is created for educational purposes only.
All tokens and test ETH used in this project have no real-world value.
