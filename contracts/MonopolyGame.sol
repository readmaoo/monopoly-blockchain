// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GameToken.sol";

contract MonopolyGame {
    GameToken public token;

    // --- КОНСТАНТЫ ---
    uint256 public constant STARTING_BALANCE = 1000 * 10**18;
    uint256 public constant MAX_PLAYERS = 4;
    uint256 public constant TOTAL_PROPERTIES = 12;
    uint256 public constant TOTAL_FIELDS = 16;

    // --- ENUMS ---
    enum GameStatus { Waiting, Active, Finished }
    enum PropertyCategory { Tech, Auto, Retail }

    // --- СТРУКТУРЫ ---
    struct Property {
        uint256 id;
        string name;
        uint256 price;
        uint256 rent;
        PropertyCategory category;
        address owner;
    }

    struct Player {
        address playerAddress;
        uint256 balance;
        uint256 position; // 0-15
        bool isActive;
        uint256[] ownedProperties;
    }

    struct Game {
        uint256 id;
        address[] players;
        mapping(address => Player) playerData;
        uint256 currentPlayerIndex;
        GameStatus status;
        uint256 createdAt;
        address winner;
    }

    // --- STATE VARIABLES ---
    mapping(uint256 => Game) public games;
    mapping(uint256 => Property) public properties;
    mapping(uint256 => uint256) public fieldToProperty;

    uint256 public gameCounter;
    uint256 private nonce;

    // --- СОБЫТИЯ ---
    event GameCreated(uint256 indexed gameId, address indexed creator);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId);
    event DiceRolled(uint256 indexed gameId, address indexed player, uint256 value);
    event PropertyBought(uint256 indexed gameId, address indexed player, uint256 propertyId);
    event RentPaid(uint256 indexed gameId, address indexed from, address indexed to, uint256 amount);
    event MonopolyAchieved(uint256 indexed gameId, address indexed player, PropertyCategory category);
    event PlayerEliminated(uint256 indexed gameId, address indexed player);
    event GameEnded(uint256 indexed gameId, address indexed winner);

    // --- КОНСТРУКТОР ---
    constructor(address _tokenAddress) {
        token = GameToken(_tokenAddress);
        _initializeProperties();
        _initializeBoard();
    }

    // --- ИНИЦИАЛИЗАЦИЯ ---
    function _initializeProperties() private {
        // Tech (0-3)
        properties[0] = Property(0, "Samsung", 100 * 10**18, 10 * 10**18, PropertyCategory.Tech, address(0));
        properties[1] = Property(1, "Apple", 120 * 10**18, 12 * 10**18, PropertyCategory.Tech, address(0));
        properties[2] = Property(2, "Sony", 110 * 10**18, 11 * 10**18, PropertyCategory.Tech, address(0));
        properties[3] = Property(3, "Google", 130 * 10**18, 13 * 10**18, PropertyCategory.Tech, address(0));

        // Auto (4-7)
        properties[4] = Property(4, "Tesla", 150 * 10**18, 15 * 10**18, PropertyCategory.Auto, address(0));
        properties[5] = Property(5, "BMW", 140 * 10**18, 14 * 10**18, PropertyCategory.Auto, address(0));
        properties[6] = Property(6, "Toyota", 135 * 10**18, 13 * 10**18, PropertyCategory.Auto, address(0));
        properties[7] = Property(7, "Mercedes", 145 * 10**18, 14 * 10**18, PropertyCategory.Auto, address(0));

        // Retail (8-11)
        properties[8] = Property(8, "Amazon", 160 * 10**18, 16 * 10**18, PropertyCategory.Retail, address(0));
        properties[9] = Property(9, "Walmart", 150 * 10**18, 15 * 10**18, PropertyCategory.Retail, address(0));
        properties[10] = Property(10, "Alibaba", 155 * 10**18, 15 * 10**18, PropertyCategory.Retail, address(0));
        properties[11] = Property(11, "Target", 145 * 10**18, 14 * 10**18, PropertyCategory.Retail, address(0));
    }

    function _initializeBoard() private {
        // Map board positions (1-16) to Property IDs
        fieldToProperty[1] = 0; fieldToProperty[2] = 1; fieldToProperty[3] = 2; fieldToProperty[4] = 3;
        // 5 is Bonus
        fieldToProperty[6] = 4; fieldToProperty[7] = 5; fieldToProperty[8] = 6; fieldToProperty[9] = 7;
        // 10 is Prison
        fieldToProperty[11] = 8; fieldToProperty[12] = 9; fieldToProperty[13] = 10; fieldToProperty[14] = 11;
        // 15 is Bonus
    }

    // --- GAMEPLAY FUNCTIONS ---
    function createGame() external returns (uint256) {
        gameCounter++;
        uint256 gameId = gameCounter;

        Game storage game = games[gameId];
        game.id = gameId;
        game.status = GameStatus.Waiting;
        game.createdAt = block.timestamp;
        game.currentPlayerIndex = 0;

        _addPlayer(gameId, msg.sender);
        
        emit GameCreated(gameId, msg.sender);
        return gameId;
    }

    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game started");
        require(game.players.length < MAX_PLAYERS, "Full");
        require(!_isPlayerInGame(gameId, msg.sender), "Joined");

        _addPlayer(gameId, msg.sender);
        emit PlayerJoined(gameId, msg.sender);
    }

    function startGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Started");
        require(game.players.length >= 2, "Need 2+ players");
        require(_isPlayerInGame(gameId, msg.sender), "Not player");

        game.status = GameStatus.Active;

        for (uint256 i = 0; i < game.players.length; i++) {
            address player = game.players[i];
            token.mint(player, STARTING_BALANCE);
            game.playerData[player].balance = STARTING_BALANCE;
        }
        
        emit GameStarted(gameId);
    }

    function rollDice(uint256 gameId) external returns (uint256) {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Not active");
        require(game.players[game.currentPlayerIndex] == msg.sender, "Not turn");
        
        uint256 diceValue = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce++))) % 6) + 1;
        
        Player storage player = game.playerData[msg.sender];
        player.position = (player.position + diceValue) % TOTAL_FIELDS;
        
        emit DiceRolled(gameId, msg.sender, diceValue);
        
        _handleLanding(gameId, msg.sender);
        _nextTurn(gameId);
        
        return diceValue;
    }

    function buyProperty(uint256 gameId, uint256 propertyId) external {
        Game storage game = games[gameId];
        Player storage player = game.playerData[msg.sender];
        Property storage property = properties[propertyId];

        require(game.status == GameStatus.Active, "Not active");
        require(property.owner == address(0), "Owned");
        require(player.balance >= property.price, "No funds");
        require(fieldToProperty[player.position] == propertyId, "Wrong pos");

        player.balance -= property.price;
        property.owner = msg.sender;
        player.ownedProperties.push(propertyId);

        _checkMonopoly(gameId, msg.sender);
        emit PropertyBought(gameId, msg.sender, propertyId);
    }

    // --- INTERNAL LOGIC ---
    function _addPlayer(uint256 gameId, address playerAddress) private {
        Game storage game = games[gameId];
        game.players.push(playerAddress);
        game.playerData[playerAddress].playerAddress = playerAddress;
        game.playerData[playerAddress].isActive = true;
    }

    function _isPlayerInGame(uint256 gameId, address player) private view returns (bool) {
        Game storage game = games[gameId];
        for(uint i=0; i<game.players.length; i++) {
            if(game.players[i] == player) return true;
        }
        return false;
    }

    function _handleLanding(uint256 gameId, address playerAddr) private {
        Player storage player = games[gameId].playerData[playerAddr];
        uint256 pos = player.position;

        if (pos == 0 || pos == 10) return; // Start or Prison
        
        if (pos == 5 || pos == 15) { // Bonus
            token.mint(playerAddr, 50 * 10**18);
            player.balance += 50 * 10**18;
            return;
        }

        uint256 propId = fieldToProperty[pos];
        Property storage prop = properties[propId];
        
        if (prop.owner != address(0) && prop.owner != playerAddr) {
            _payRent(gameId, playerAddr, prop.owner, propId);
        }
    }

    function _payRent(uint256 gameId, address from, address to, uint256 propId) private {
        Player storage payer = games[gameId].playerData[from];
        Player storage receiver = games[gameId].playerData[to];
        uint256 rent = properties[propId].rent;

        if (_hasMonopoly(gameId, to, properties[propId].category)) {
            rent *= 2;
        }

        if (payer.balance >= rent) {
            payer.balance -= rent;
            receiver.balance += rent;
            emit RentPaid(gameId, from, to, rent);
        } else {
            _eliminatePlayer(gameId, from);
        }
    }

    function _eliminatePlayer(uint256 gameId, address playerAddr) private {
        Game storage game = games[gameId];
        Player storage player = game.playerData[playerAddr];
        player.isActive = false;
        player.balance = 0;
        
        for(uint i=0; i<player.ownedProperties.length; i++) {
            properties[player.ownedProperties[i]].owner = address(0);
        }
        delete player.ownedProperties;
        emit PlayerEliminated(gameId, playerAddr);
        
        // Check winner logic omitted for brevity
    }

    function _nextTurn(uint256 gameId) private {
        Game storage game = games[gameId];
        uint256 attempts = 0;
        do {
            game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
            attempts++;
        } while (!game.playerData[game.players[game.currentPlayerIndex]].isActive && attempts < MAX_PLAYERS);
    }

    function _hasMonopoly(uint256 gameId, address player, PropertyCategory category) private view returns (bool) {
        uint count = 0;
        uint[] memory props = games[gameId].playerData[player].ownedProperties;
        for(uint i=0; i<props.length; i++) {
            if(properties[props[i]].category == category) count++;
        }
        return count >= 4;
    }

    function _checkMonopoly(uint256 gameId, address player) private {
        if(_hasMonopoly(gameId, player, PropertyCategory.Tech)) emit MonopolyAchieved(gameId, player, PropertyCategory.Tech);
        if(_hasMonopoly(gameId, player, PropertyCategory.Auto)) emit MonopolyAchieved(gameId, player, PropertyCategory.Auto);
        if(_hasMonopoly(gameId, player, PropertyCategory.Retail)) emit MonopolyAchieved(gameId, player, PropertyCategory.Retail);
    }

    // --- VIEW FUNCTIONS ---
    function getGameInfo(uint256 gameId) external view returns (uint256, address[] memory, uint256, GameStatus) {
        return (games[gameId].id, games[gameId].players, games[gameId].currentPlayerIndex, games[gameId].status);
    }

    function getPlayer(uint256 gameId, address player) external view returns (uint256, uint256, bool, uint256[] memory) {
        Player storage p = games[gameId].playerData[player];
        return (p.balance, p.position, p.isActive, p.ownedProperties);
    }
}
