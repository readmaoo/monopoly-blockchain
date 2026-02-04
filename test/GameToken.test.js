const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameToken", function () {
  let gameToken, owner, gameContract, player1;

  beforeEach(async function () {
    [owner, gameContract, player1] = await ethers.getSigners();
    
    const GameToken = await ethers.getContractFactory("GameToken");
    gameToken = await GameToken.deploy();
  });

  it("Should have correct name and symbol", async function () {
    expect(await gameToken.name()).to.equal("MonopolyToken");
    expect(await gameToken.symbol()).to.equal("MONO");
  });

  it("Should set game contract", async function () {
    await gameToken.setGameContract(gameContract.address);
    expect(await gameToken.gameContract()).to.equal(gameContract.address);
  });

  it("Should mint tokens from game contract", async function () {
    await gameToken.setGameContract(gameContract.address);
    await gameToken.connect(gameContract).mint(player1.address, 1000);
    expect(await gameToken.balanceOf(player1.address)).to.equal(1000);
  });

  it("Should NOT mint from non-game contract", async function () {
    await gameToken.setGameContract(gameContract.address);
    await expect(
      gameToken.connect(player1).mint(player1.address, 1000)
    ).to.be.revertedWith("Only game contract can mint");
  });
});
