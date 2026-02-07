import { ethers } from "ethers";

// Адреса контрактов (monopolyGame, gameToken)
import addresses from "./frontend-config.json";

// ABI из артефактов
import MonopolyArtifact from "./artifacts/contracts/MonopolyGame.sol/MonopolyGame.json";
import TokenArtifact from "./artifacts/contracts/GameToken.sol/GameToken.json";

const MONOPOLY_ADDRESS = addresses.monopolyGame;
const MONOPOLY_ABI = MonopolyArtifact.abi;

let provider, signer, contract;
let currentGameId = null;
let currentPosition = 0;

const boardSize = 16;

// ---------------- UI HELPERS ----------------
const log = (msg) => {
  const ul = document.getElementById("gameLog");
  if (!ul) return;
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
  ul.scrollTop = ul.scrollHeight;
};

const renderBoard = () => {
  const board = document.getElementById("board");
  if (!board) return;
  board.innerHTML = "";

  for (let i = 0; i < boardSize; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = i;
    if (i === currentPosition) cell.classList.add("player");
    board.appendChild(cell);
  }
};

const setWalletUI = async () => {
  if (!signer) return;
  const address = await signer.getAddress();
  const el = document.getElementById("wallet");
  if (el) el.innerText = address.substring(0, 6) + "..." + address.substring(38);
};

const setGameIdUI = (id) => {
  const el = document.getElementById("currentGameId");
  if (el) el.innerText = id ?? "-";
};

// -------------- ERROR NORMALIZER --------------
function prettyEthersError(e) {
  const msg =
    e?.reason ||
    e?.shortMessage ||
    e?.info?.error?.message ||
    e?.message ||
    "Unknown error";

  const m = String(msg).match(/execution reverted:\s*"([^"]+)"/);
  if (m?.[1]) return m[1];
  return msg;
}

// -------------- SAFE GAS SENDER --------------
// Решает "Transaction ran out of gas" в MetaMask (Hardhat Local часто дает маленький gas).
async function sendWithGas(txPromiseFactory, { fallbackGasLimit = 800000 } = {}) {
  // txPromiseFactory({ gasLimit?, estimateOnly? }) -> estimateGas или tx
  try {
    const estimated = await txPromiseFactory({ estimateOnly: true });
    const est = BigInt(estimated);
    const padded = (est * 130n) / 100n; // +30%
    return await txPromiseFactory({ gasLimit: padded });
  } catch {
    return await txPromiseFactory({ gasLimit: BigInt(fallbackGasLimit) });
  }
}

// -------------- CONTRACT INIT --------------
async function initProviderAndContract() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  contract = new ethers.Contract(MONOPOLY_ADDRESS, MONOPOLY_ABI, signer);

  const net = await provider.getNetwork();
  const chainId = Number(net.chainId);

  if (chainId !== 31337) {
    log(`⚠️ Wrong network. Current chainId=${chainId}. Switch to Hardhat Local (31337).`);
  } else {
    log(`✅ Network OK (chainId=${chainId})`);
  }

  await setWalletUI();
}

// ---------------- EVENTS / LISTENERS ----------------
let listenersAttached = false;
async function attachWalletListeners() {
  if (!window.ethereum) return;
  if (listenersAttached) return;
  listenersAttached = true;

  window.ethereum.on("accountsChanged", async () => {
    try {
      await initProviderAndContract();
      log("🔁 Account changed");
      await updatePlayer();
    } catch (e) {
      console.error(e);
    }
  });

  window.ethereum.on("chainChanged", async () => {
    try {
      await initProviderAndContract();
      log("🔁 Network changed");
      await updatePlayer();
    } catch (e) {
      console.error(e);
    }
  });
}

// ---------------- BUTTON HANDLERS ----------------
async function connectWallet() {
  try {
    await initProviderAndContract();
    await attachWalletListeners();
    log("Wallet connected");
    await updatePlayer();
  } catch (e) {
    console.error(e);
    log("Connection failed: " + prettyEthersError(e));
  }
}

async function createGame() {
  if (!contract) return alert("Connect wallet first!");

  try {
    log("Creating game... Please confirm transaction.");

    const tx = await sendWithGas(async ({ gasLimit, estimateOnly } = {}) => {
      if (estimateOnly) return await contract.createGame.estimateGas();
      return await contract.createGame({ gasLimit });
    }, { fallbackGasLimit: 600000 });

    log("Transaction sent, waiting...");
    const receipt = await tx.wait();

    const iface = new ethers.Interface(MONOPOLY_ABI);
    let gameId = null;

    for (const lg of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: Array.from(lg.topics), data: lg.data });
        if (parsed?.name === "GameCreated") {
          gameId = Number(parsed.args[0]);
          break;
        }
      } catch {}
    }

    if (gameId === null) throw new Error("GameCreated event not found");

    currentGameId = gameId;
    setGameIdUI(gameId);

    log("✅ Game created! ID: " + gameId);
    await updatePlayer();
  } catch (e) {
    console.error(e);
    log("❌ Create game failed: " + prettyEthersError(e));
  }
}

async function joinGame() {
  if (!contract) return alert("Connect wallet first!");

  try {
    const idInput = document.getElementById("gameIdInput")?.value;
    if (!idInput) return alert("Enter Game ID");

    const id = Number(idInput);
    log(`Joining game ${id}...`);

    const tx = await sendWithGas(async ({ gasLimit, estimateOnly } = {}) => {
      if (estimateOnly) return await contract.joinGame.estimateGas(id);
      return await contract.joinGame(id, { gasLimit });
    }, { fallbackGasLimit: 600000 });

    await tx.wait();

    currentGameId = id;
    setGameIdUI(id);

    log("✅ Joined game " + id);
    await updatePlayer();
  } catch (e) {
    console.error(e);
    log("❌ Join failed: " + prettyEthersError(e));
  }
}

async function startGame() {
  if (!contract) return alert("Connect wallet first!");
  if (currentGameId === null) return alert("Create or Join a game first!");

  try {
    log("Starting game...");

    const tx = await sendWithGas(async ({ gasLimit, estimateOnly } = {}) => {
      if (estimateOnly) return await contract.startGame.estimateGas(currentGameId);
      return await contract.startGame(currentGameId, { gasLimit });
    }, { fallbackGasLimit: 1200000 });

    await tx.wait();

    log("✅ Game started! Tokens minted.");
    await updatePlayer();
  } catch (e) {
    console.error(e);
    log("❌ Start failed: " + prettyEthersError(e));
  }
}

async function rollDice() {
  if (!contract) return alert("Connect wallet first!");
  if (currentGameId === null) return alert("Create or Join a game first!");

  try {
    log("Rolling dice...");

    const tx = await sendWithGas(async ({ gasLimit, estimateOnly } = {}) => {
      if (estimateOnly) return await contract.rollDice.estimateGas(currentGameId);
      return await contract.rollDice(currentGameId, { gasLimit });
    }, { fallbackGasLimit: 800000 });

    const receipt = await tx.wait();

    const iface = new ethers.Interface(MONOPOLY_ABI);
    let diceValue = null;

    for (const lg of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: Array.from(lg.topics), data: lg.data });
        if (parsed?.name === "DiceRolled") {
          diceValue = parsed.args[2];
          break;
        }
      } catch {}
    }

    if (diceValue !== null) log(`🎲 You rolled: ${diceValue}`);
    else log("✅ Dice rolled");

    await updatePlayer();
  } catch (e) {
    console.error(e);
    log("❌ Roll failed: " + prettyEthersError(e));
  }
}

async function buyProperty() {
  if (!contract) return alert("Connect wallet first!");
  if (currentGameId === null) return alert("Create or Join a game first!");

  try {
    const propIdRaw = document.getElementById("propertyId")?.value;
    const propId = Number(propIdRaw);
    if (!Number.isFinite(propId)) return alert("Enter Property ID (number)");

    log(`Buying property ${propId}...`);

    const tx = await sendWithGas(async ({ gasLimit, estimateOnly } = {}) => {
      if (estimateOnly) return await contract.buyProperty.estimateGas(currentGameId, propId);
      return await contract.buyProperty(currentGameId, propId, { gasLimit });
    }, { fallbackGasLimit: 800000 });

    await tx.wait();

    log("✅ Property bought: " + propId);
    await updatePlayer();
  } catch (e) {
    console.error(e);
    log("❌ Buy failed: " + prettyEthersError(e));
  }
}

// ---------------- REFRESH PLAYER ----------------
async function updatePlayer() {
  if (!contract || currentGameId === null || !signer) return;

  try {
    const addr = await signer.getAddress();
    const [balance, position] = await contract.getPlayer(currentGameId, addr);

    currentPosition = Number(position);

    const posEl = document.getElementById("position");
    if (posEl) posEl.innerText = currentPosition;

    const balEl = document.getElementById("balance");
    if (balEl) balEl.innerText = ethers.formatEther(balance);

    renderBoard();
  } catch (e) {
    console.error("Update player error:", e);
  }
}

// ---------------- OPTIONAL: MANUAL REFRESH BUTTON ----------------
function wireRefreshButtonIfExists() {
  const btn = document.getElementById("refresh");
  if (!btn) return;
  btn.onclick = async () => {
    await updatePlayer();
    log("🔄 Refreshed");
  };
}

// ---------------- INIT UI ----------------
renderBoard();

// Кнопки
document.getElementById("connectWallet").onclick = connectWallet;
document.getElementById("createGame").onclick = createGame;
document.getElementById("joinGame").onclick = joinGame;
document.getElementById("startGame").onclick = startGame;
document.getElementById("rollDice").onclick = rollDice;
document.getElementById("buyProperty").onclick = buyProperty;

wireRefreshButtonIfExists();
