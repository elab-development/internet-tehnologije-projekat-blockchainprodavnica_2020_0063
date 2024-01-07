const { expect } = require("chai")
const { ethers } = require("hardhat")

const NAME = "TokenMaster"
const SYMBOL = "TM"

describe("TokenMaster", () => {
    let tokenMaster
    let deployer, buyer
    beforeEach(async () => {
        [deployer, buyer] = await ethers.getSigners()

        const TokenMaster = await ethers.getContractFactory("TokenMaster")
        tokenMaster = await TokenMaster.deploy(NAME, SYMBOL)
    })

    describe("Deployment", () => {
        it("Sets the name", async () => {

            let name = await tokenMaster.name()
            expect(name).to.equal(NAME)
        })
        it("Sets the symbol", async () => {
            let symbol = await tokenMaster.symbol()
            expect(symbol).to.equal(SYMBOL)
        })
        it("Sets the owner", async () => {
            expect(await tokenMaster.owner()).to.equal(deployer.address)
        })
    })
})