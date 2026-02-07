export const CONTRACTS = {
  monopolyGame: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  gameToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

export const MONOPOLY_ABI = [
  "function createGame() returns (uint256)",
  "function joinGame(uint256 gameId)",
  "function startGame(uint256 gameId)",
  "function rollDice(uint256 gameId) returns (uint256)",
  "function buyProperty(uint256 gameId, uint256 propertyId)",
  "function getPlayer(uint256 gameId, address player) view returns (uint256,uint256,bool,uint256[])",
  "function gameCounter() view returns (uint256)"
];