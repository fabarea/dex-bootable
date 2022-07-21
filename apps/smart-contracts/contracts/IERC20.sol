// SPDX-License-Identifier: GPL-3.0
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    //function name() external view returns (string memory);

    //function symbol() external view returns (string memory);

    //function decimals() external view returns (uint8);

    //function totalSupply() external view returns (uint256);

    // function balanceOf(address _owner) public view returns (uint256 balance);

    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value)
        external
        returns (bool success);

    function allowance(address _owner, address _spender)
        external
        view
        returns (uint256 remaining);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool success);
}
