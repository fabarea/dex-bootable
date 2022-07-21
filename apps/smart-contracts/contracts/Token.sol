// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import './IERC20.sol';
import 'hardhat/console.sol';

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Token is IERC20 {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // @dev Transfer event according to ERC-20 standard
    event Transfer(address indexed from, address indexed to, uint256 value);

    // @dev Approval event according to ERC-20 standard
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

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
        return _transfer(msg.sender, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        // we check the user has sufficient funds
        //        require(balanceOf[_spender] >= _value);

        // We check the address is valid
        require(_spender != address(0));

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(allowance[_from][msg.sender] >= _value);

        _transfer(_from, _to, _value);
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        // we check the user has sufficient funds
        require(balanceOf[_from] >= _value);

        // We check the address is valid
        require(_to != address(0));

        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
}
