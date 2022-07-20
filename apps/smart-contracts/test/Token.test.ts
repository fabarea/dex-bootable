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
    const [owner, user2, otherAccount] = await ethers.getSigners()

    const Token = await ethers.getContractFactory('Token')
    const token = await Token.deploy('FabToken', 'Fab', '1000000')

    return { token, owner, user2, otherAccount }
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
    let value: BigNumber
    let ownerBalance: BigNumber
    let token: Token
    let owner: SignerWithAddress
    let user2: SignerWithAddress
    let result: ContractReceipt

    describe('Success', async () => {
      let value = tokens('100')
      beforeEach(async () => {
        ;({ token, owner, user2 } = await loadFixture(deployMyTokenFixture))
        ownerBalance = await token.balanceOf(owner.address)
        const transaction = await token
          .connect(owner)
          .transfer(user2.address, value)
        result = await transaction.wait()
      })

      it('transfers token balances', async () => {
        expect(await token.balanceOf(owner.address)).to.equal(
          ownerBalance.sub(tokens('100'))
        )
        expect(await token.balanceOf(user2.address)).to.equal(value)
      })

      it('emits a "transfer" event', async () => {
        const expectedEvent = 'Transfer'
        const [transferEvent] = result.events!
        expect(transferEvent.event).to.equal(expectedEvent)
        expect(transferEvent.args!.from).to.equal(owner.address)
        expect(transferEvent.args!.to).to.equal(user2.address)
        expect(transferEvent.args!.value).to.equal(value)
      })
    })

    describe('Failure', async () => {
      it('rejects if user has insufficient funds', async () => {
        ;({ token, owner, user2 } = await loadFixture(deployMyTokenFixture))
        let invalidAmount = tokens('100000000000')
        await expect(
          token.connect(owner).transfer(user2.getAddress(), invalidAmount)
        ).to.be.reverted
      })

      it('rejects invalid address', async () => {
        ;({ token, owner, user2 } = await loadFixture(deployMyTokenFixture))
        await expect(
          token
            .connect(owner)
            .transfer('0x0000000000000000000000000000000000000000', tokens('1'))
        ).to.be.reverted
      })
    })
  })
})
