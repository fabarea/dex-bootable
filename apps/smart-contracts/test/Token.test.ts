import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, ContractReceipt } from 'ethers'
import { ethers } from 'hardhat'
import { Token } from '../typechain-types'

const tokens = (number: string) => {
  return ethers.utils.parseUnits(number, 'ether')
}

describe('Token', () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMyTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, exchange, account3, otherAccount] = await ethers.getSigners()

    const Token = await ethers.getContractFactory('Token')
    const token = await Token.deploy('FabToken', 'Fab', '1000000')

    return { token, owner, exchange, account3, otherAccount }
  }

  describe('Valid ERC-20 token deployment', () => {
    const name = 'FabToken'
    const symbol = 'Fab'
    const decimal = 18
    const totalSupply = '1000000'

    it('has correct name', async function () {
      const { token } = await loadFixture(deployMyTokenFixture)
      expect(await token.name()).to.equal(name)
    })

    it('has correct symbol', async function () {
      const { token } = await loadFixture(deployMyTokenFixture)
      expect(await token.symbol()).to.equal(symbol)
    })

    it('has correct decimal', async function () {
      const { token } = await loadFixture(deployMyTokenFixture)
      expect(await token.decimals()).to.equal(decimal)
    })

    it('has correct total supply', async function () {
      const { token } = await loadFixture(deployMyTokenFixture)
      expect(await token.totalSupply()).to.equal(tokens(totalSupply))
    })

    it('assigns total supply to deployer', async function () {
      const { token, owner } = await loadFixture(deployMyTokenFixture)
      expect(await token.balanceOf(owner.address)).to.equal(tokens(totalSupply))
    })
  })

  describe('Sending token', async () => {
    let amount = tokens('100')
    let ownerBalance: BigNumber
    let token: Token
    let owner: SignerWithAddress
    let exchange: SignerWithAddress
    let result: ContractReceipt

    describe('Success', async () => {
      beforeEach(async () => {
        ;({ token, owner, exchange } = await loadFixture(deployMyTokenFixture))
        ownerBalance = await token.balanceOf(owner.address)
        const transaction = await token
          .connect(owner)
          .transfer(exchange.address, amount)
        result = await transaction.wait()
      })

      it('transfers token balances', async () => {
        expect(await token.balanceOf(owner.address)).to.equal(
          ownerBalance.sub(tokens('100'))
        )
        expect(await token.balanceOf(exchange.address)).to.equal(amount)
      })

      it('emits a "transfer" event', async () => {
        const expectedEvent = 'Transfer'
        const [transferEvent] = result.events!
        expect(transferEvent.event).to.equal(expectedEvent)
        expect(transferEvent.args!.from).to.equal(owner.address)
        expect(transferEvent.args!.to).to.equal(exchange.address)
        expect(transferEvent.args!.value).to.equal(amount)
      })
    })

    describe('Failure', async () => {
      it('rejects if user has insufficient funds', async () => {
        ;({ token, owner, exchange } = await loadFixture(deployMyTokenFixture))
        let invalidAmount = tokens('100000000000')
        await expect(
          token.connect(owner).transfer(exchange.getAddress(), invalidAmount)
        ).to.be.reverted
      })

      it('rejects invalid address', async () => {
        ;({ token, owner, exchange } = await loadFixture(deployMyTokenFixture))
        await expect(
          token
            .connect(owner)
            .transfer('0x0000000000000000000000000000000000000000', tokens('1'))
        ).to.be.reverted
      })
    })
  })

  describe('Approving token', async () => {
    let amount = tokens('100')
    let ownerBalance: BigNumber
    let token: Token
    let owner: SignerWithAddress
    let account3: SignerWithAddress
    let result: ContractReceipt

    beforeEach(async () => {
      ;({ token, owner, account3 } = await loadFixture(deployMyTokenFixture))
      const transaction = await token
        .connect(owner)
        .approve(account3.address, amount)
      result = await transaction.wait()
    })

    describe('Success', async () => {
      it('allocate an allowance for delegated token spending', async () => {
        expect(await token.allowance(owner.address, account3.address)).to.equal(
          amount
        )
      })

      it('emits a "approval" event', async () => {
        const expectedEvent = 'Approval'
        const [approvalEvent] = result.events!
        expect(approvalEvent.event).to.equal(expectedEvent)
        expect(approvalEvent.args!.owner).to.equal(owner.address)
        expect(approvalEvent.args!.spender).to.equal(account3.address)
        expect(approvalEvent.args!.value).to.equal(amount)
      })
    })

    describe('Failure', async () => {
      it('rejects invalid spender', async () => {
        ;({ token, owner, account3 } = await loadFixture(deployMyTokenFixture))
        await expect(
          token
            .connect(owner)
            .approve('0x0000000000000000000000000000000000000000', tokens('1'))
        ).to.be.reverted
      })
    })
  })

  describe('Transfer from', async () => {
    let amount = tokens('10')
    let ownerBalance: BigNumber
    let token: Token
    let owner: SignerWithAddress
    let exchange: SignerWithAddress
    let account3: SignerWithAddress
    let result: ContractReceipt

    beforeEach(async () => {
      ;({ token, owner, exchange, account3 } = await loadFixture(
        deployMyTokenFixture
      ))
      const transaction = await token
        .connect(owner)
        .approve(exchange.address, amount)
      result = await transaction.wait()
    })

    describe('Success', async () => {
      beforeEach(async () => {
        const transaction2 = await token
          .connect(exchange)
          .transferFrom(owner.address, account3.address, amount)
        result = await transaction2.wait()
      })

      it('removes allowance after transfer', async () => {
        expect(await token.allowance(owner.address, exchange.address)).to.equal(
          0
        )
      })

      it('emits a "transfer" event', async () => {
        const expectedEvent = 'Transfer'
        const [transferEvent] = result.events!
        expect(transferEvent.event).to.equal(expectedEvent)
        expect(transferEvent.args!.from).to.equal(owner.address)
        expect(transferEvent.args!.to).to.equal(account3.address)
        expect(transferEvent.args!.value).to.equal(amount)
      })
    })

    describe('Failure', async () => {
      it('rejects invalid allowance spender', async () => {
        ;({ token, owner, account3 } = await loadFixture(deployMyTokenFixture))
        await expect(
          token
            .connect(account3)
            .transferFrom(owner.address, account3.address, amount)
        ).to.be.reverted
      })
    })
  })
})
