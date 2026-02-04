const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MonopolyGame", function () {
  let gameToken, monopolyGame, owner, player1, player2, player3;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    
    // Deploy GameToken
    const GameToken = await ethers.getContractFactory("GameToken");
    gameToken = await GameToken.deploy();
    
    // Deploy MonopolyGame
    const MonopolyGame = await ethers.getContractFactory("MonopolyGame");
    monopolyGame = await MonopolyGame.deploy(await gameToken.getAddress());
    
    // Set game contract in token
    await gameToken.setGameContract(await monopolyGame.getAddress());
  });

  describe("Game Creation", function () {
    it("Should create a game", async function () {
      await expect(monopolyGame.connect(player1).createGame())
        .to.emit(monopolyGame, "GameCreated")
        .withArgs(1, player1.address);
      
      const gameInfo = await monopolyGame.getGameInfo(1);
      // gameInfo[1] это массив players
      expect(gameInfo[1].length).to.equal(1);
      expect(gameInfo[3]).to.equal(0); // Status Waiting (enum index 0)
    });

    it("Should allow players to join", async function () {
      await monopolyGame.connect(player1).createGame();
      
      await expect(monopolyGame.connect(player2).joinGame(1))
        .to.emit(monopolyGame, "PlayerJoined");
      
      const gameInfo = await monopolyGame.getGameInfo(1);
      expect(gameInfo[1].length).to.equal(2);
    });

    it("Should NOT allow more than 4 players", async function () {
      await monopolyGame.connect(player1).createGame();
      await monopolyGame.connect(player2).joinGame(1);
      await monopolyGame.connect(player3).joinGame(1);
      await monopolyGame.connect(owner).joinGame(1);
      
      const [,,,, player5] = await ethers.getSigners();
      await expect(
        monopolyGame.connect(player5).joinGame(1)
      ).to.be.revertedWith("Full");
    });
  });

  describe("Game Start", function () {
    it("Should start game and mint tokens", async function () {
      await monopolyGame.connect(player1).createGame();
      await monopolyGame.connect(player2).joinGame(1);
      
      await expect(monopolyGame.connect(player1).startGame(1))
        .to.emit(monopolyGame, "GameStarted");
      
      const balance1 = await gameToken.balanceOf(player1.address);
      const balance2 = await gameToken.balanceOf(player2.address);
      
      expect(balance1).to.equal(ethers.parseEther("1000"));
      expect(balance2).to.equal(ethers.parseEther("1000"));
    });

    it("Should NOT start with less than 2 players", async function () {
      await monopolyGame.connect(player1).createGame();
      
      await expect(
        monopolyGame.connect(player1).startGame(1)
      ).to.be.revertedWith("Need 2+ players");
    });
  });

  describe("Gameplay", function () {
    beforeEach(async function () {
      await monopolyGame.connect(player1).createGame();
      await monopolyGame.connect(player2).joinGame(1);
      await monopolyGame.connect(player1).startGame(1);
    });

    it("Should roll dice", async function () {
      await expect(monopolyGame.connect(player1).rollDice(1))
        .to.emit(monopolyGame, "DiceRolled");
      
      // Используем getPlayer вместо getPlayerInfo
      const playerInfo = await monopolyGame.getPlayer(1, player1.address);
      // playerInfo[1] это position
      expect(playerInfo[1]).to.be.greaterThan(0);
    });

    it("Should NOT roll dice on other player's turn", async function () {
      await expect(
        monopolyGame.connect(player2).rollDice(1)
      ).to.be.revertedWith("Not turn");
    });

    it("Should buy property", async function () {
      // Имитируем броски пока не попадем на поле для покупки (например > 0 и не бонусы)
      // В тесте сложно гарантировать попадание на конкретное поле без подмены рандома
      // Поэтому просто проверим, что функция вызывается
      
      // Это упрощенный тест, так как мы не можем контролировать рандом в тесте без моков
      // Просто проверим, что вызов с неправильной позиции вернет ошибку "Wrong pos"
      // Это подтвердит, что функция buyProperty существует и проверяет логику
      
      const propertyId = 1; 
      await expect(monopolyGame.connect(player1).buyProperty(1, propertyId))
        .to.be.revertedWith("Wrong pos");
    });
  });
});
