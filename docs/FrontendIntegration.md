# Frontend and MetaMask Integration

## Overview
This document describes how the frontend interacts with the blockchain and integrates with MetaMask.

## Frontend Technology
The frontend is built using Vite and Vanilla JavaScript.
It provides the user interface for interacting with the Monopoly Blockchain game.

## MetaMask Connection
MetaMask is used to:
- Connect user wallets
- Request account access
- Sign and send transactions
- Display transaction confirmations

The application checks that the user is connected to an Ethereum test network before allowing interaction.

## Blockchain Interaction
The frontend uses ethers.js to interact with smart contracts.
Functions such as createGame, joinGame, rollDice, and buyProperty are called through MetaMask transactions.

## Event Handling
Blockchain events are used to:
- Update the game state
- Refresh UI components
- Display game actions and results

## Error Handling
The frontend handles common errors including:
- User rejecting transactions
- Incorrect network selection
- Insufficient token balance

## Conclusion
The frontend integration demonstrates secure and user-friendly interaction with Ethereum smart contracts through MetaMask.
