import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

const tokens = (n: string) => {
  return ethers.utils.parseUnits(n, 'ether')
}

describe('Token', () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMyTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners()

    const Token = await ethers.getContractFactory('Token')
    const token = await Token.deploy('FabToken', 'Fab', '1000000')

    return { token, owner, otherAccount }
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
  })
})
