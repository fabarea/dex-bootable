// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import './IERC20.sol';
import 'hardhat/console.sol';

//import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";

contract Token is IERC20 {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // @dev Transfer event according to ERC-20 standard
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value)
        public
        override
        returns (bool)
    {
        // we check the user has sufficient funds
        require(balanceOf[msg.sender] >= _value);

        // We check the address is valid
        require(_to != address(0));

        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}
