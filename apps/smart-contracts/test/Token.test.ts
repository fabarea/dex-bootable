import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('Token', () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMyTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners()

    const Token = await ethers.getContractFactory('Token')
    const token = await Token.deploy()

    return { token, owner, otherAccount }
  }

  describe('Deployment', () => {
    it('Has a name', async function () {
      const { token } = await loadFixture(deployMyTokenFixture)

      expect(await token.name()).to.equal('My Token')
    })
  })
})
