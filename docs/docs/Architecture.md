# Architecture Overview

## General Architecture
The Monopoly Blockchain project follows a decentralized application (DApp) architecture.
The system consists of three main layers: Frontend, Smart Contracts, and Blockchain Network.

## Frontend Layer
The frontend is built using Vite and Vanilla JavaScript.
It provides the user interface for the game and communicates with the blockchain through ethers.js.
MetaMask is used to connect user wallets and sign transactions.

## Smart Contract Layer
The backend logic of the game is implemented in Solidity smart contracts:
- MonopolyGame.sol manages the core game logic, including game creation, player turns, dice rolls, and property management.
- GameToken.sol is an ERC-20 utility token used internally within the game.

## Blockchain Network
All smart contracts are deployed on an Ethereum test network (Sepolia or Localhost).
The application uses free test ETH and does not interact with real cryptocurrency.

## Interaction Flow
1. User connects MetaMask wallet to the frontend.
2. Frontend sends transaction requests via ethers.js.
3. MetaMask prompts the user to approve transactions.
4. Smart contracts execute logic on the Ethereum test network.
5. Results are returned to the frontend via blockchain events.

## Security Considerations
The application includes basic security checks such as:
- Validation of player actions
- Restricted function access
- Controlled token minting

## Conclusion
This architecture demonstrates fundamental principles of decentralized applications, including smart contract-based logic, decentralized state management, and secure user interaction via MetaMask.
