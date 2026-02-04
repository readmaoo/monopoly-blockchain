const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting deployment...");

  try {
    // 1. Деплоим токен
    console.log("Deploying GameToken...");
    const GameToken = await hre.ethers.getContractFactory("GameToken");
    const gameToken = await GameToken.deploy();
    await gameToken.waitForDeployment();
    const tokenAddress = await gameToken.getAddress();
    console.log("✅ GameToken deployed to:", tokenAddress);

    // 2. Деплоим игру
    console.log("Deploying MonopolyGame...");
    const MonopolyGame = await hre.ethers.getContractFactory("MonopolyGame");
    const monopolyGame = await MonopolyGame.deploy(tokenAddress);
    await monopolyGame.waitForDeployment();
    const gameAddress = await monopolyGame.getAddress();
    console.log("✅ MonopolyGame deployed to:", gameAddress);

    // 3. Сообщаем токену адрес игры
    console.log("Setting game contract address in token...");
    await gameToken.setGameContract(gameAddress);
    console.log("✅ Game contract set in Token");

    // 4. Сохраняем конфиг
    console.log("Saving config...");
    const data = {
      gameToken: tokenAddress,
      monopolyGame: gameAddress,
      // Временно уберем ABI, если с ним проблема чтения файла
      // tokenAbi: ..., 
      // gameAbi: ...
    };

    fs.writeFileSync("frontend-config.json", JSON.stringify(data, null, 2));
    console.log("🎉 Config saved to frontend-config.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main();
