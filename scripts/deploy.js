const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Postavljanje naloga i promenljivih
  const [deployer] = await ethers.getSigners()
  const NAME = "TokenMaster"
  const SYMBOL = "TM"

  // Postavljanje ugovora
  const TokenMaster = await ethers.getContractFactory("TokenMaster")
  const tokenMaster = await TokenMaster.deploy(NAME, SYMBOL)
  await tokenMaster.deployed()

  console.log(`Deployed TokenMaster Contract at: ${tokenMaster.address}\n`)

  // Izlistavanje dogadjaja
  const occasions = [
    {
      name: "Aleksandra Prijovic",
      cost: tokens(3),
      tickets: 0,
      date: "25. Februar 2024.",
      time: "21:00",
      location: "STARK ARENA BEOGRAD"
    },
    {
      name: "Krcko Orascic",
      cost: tokens(1),
      tickets: 125,
      date: "3. Mart 2024.",
      time: "20:00",
      location: "MTS Dvorana"
    },
    {
      name: "KK CRVENA ZVEZDA VS KK PARTIZAN",
      cost: tokens(0.25),
      tickets: 200,
      date: "9.April 2024.",
      time: "19:30",
      location: "STARK ARENA BEOGRAD"
    },
    {
      name: "Ed Sheeran",
      cost: tokens(5),
      tickets: 0,
      date: "11.Jun 2024.",
      time: "21:00",
      location: "Usce"
    },
    {
      name: "Galija",
      cost: tokens(1.5),
      tickets: 125,
      date: "23.Avgust 2024.",
      time: "19:00",
      location: "Tasmajdan"
    }
  ]

  for (var i = 0; i < 5; i++) {
    const transaction = await tokenMaster.connect(deployer).list(
      occasions[i].name,
      occasions[i].cost,
      occasions[i].tickets,
      occasions[i].date,
      occasions[i].time,
      occasions[i].location,
    )

    await transaction.wait()

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});