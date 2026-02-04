// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameToken is ERC20, Ownable {
    // Адрес игрового контракта (только он может минтить)
    address public gameContract;
    
    constructor() ERC20("MonopolyToken", "MONO") Ownable(msg.sender) {}
    
    // Установить адрес игрового контракта
    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "Invalid address");
        gameContract = _gameContract;
    }
    
    // Минт токенов (только игровой контракт)
    function mint(address to, uint256 amount) external {
        require(msg.sender == gameContract, "Only game contract can mint");
        _mint(to, amount);
    }
    
    // Burn токенов (опционально)
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
