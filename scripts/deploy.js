const hre = require("hardhat");
const connectDB = require("./database"); // Import konekcije sa MongoDB
const mongoose = require("mongoose");

// Funkcija za konvertovanje u wei (ETH vrednosti iz baze konvertuju se na wei)
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

// Definiši model za događaje
const eventSchema = new mongoose.Schema({
  name: String,
  cost: Number, // Cena u ETH
  tickets: Number,
  date: String,
  time: String,
  location: String,
});
const Event = mongoose.model("Event", eventSchema);

async function main() {
  // Konektuj se na MongoDB
  await connectDB();

  // Postavljanje naloga i promenljivih
  const [deployer] = await ethers.getSigners();
  const NAME = "TokenMaster";
  const SYMBOL = "TM";

  // Postavljanje ugovora
  const TokenMaster = await ethers.getContractFactory("TokenMaster");
  const tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);
  await tokenMaster.deployed();

  console.log(`Deployed TokenMaster Contract at: ${tokenMaster.address}\n`);

  // Povuci događaje iz MongoDB
  const events = await Event.find(); // Povuci sve događaje iz baze
  console.log("Fetched events from MongoDB:", events);

  // Kreiraj listu `occasions` na osnovu podataka iz baze
  const occasions = events.map((event) => ({
    name: event.name,
    cost: tokens(event.cost), // Konvertuj cenu u wei
    tickets: event.tickets,
    date: new Date(event.date).getTime() / 1000,
    time: event.time,
    location: event.location,
  }));

  console.log("Formatted occasions:", occasions);

  // Izlistavanje događaja na pametnom ugovoru
  for (let i = 0; i < occasions.length; i++) {
    const transaction = await tokenMaster
      .connect(deployer)
      .list(
        occasions[i].name,
        occasions[i].cost,
        occasions[i].tickets,
        occasions[i].date,
        occasions[i].time,
        occasions[i].location
      );

    await transaction.wait();
    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`);
  }

  // Zatvori konekciju sa bazom
  mongoose.connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
