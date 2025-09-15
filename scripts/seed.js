const mongoose = require("mongoose");

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

// Funkcija za povezivanje sa MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/eventsDB");
    console.log("MongoDB konektovan!");
  } catch (err) {
    console.error("Greška prilikom povezivanja na MongoDB:", err);
    process.exit(1);
  }
};

const testEvents = [
  {
    name: "ZDRAVKO ČOLIĆ",
    cost: 1,
    tickets: 200,
    date: "2025-09-28", // Prvi od onih sa 200 karata
    time: "20:00",
    location: "Stark Arena, Beograd"
  },
  {
    name: "HAMLET - Pozorišna predstava",
    cost: 0.5,
    tickets: 0,
    date: "2025-10-15", // Datum za događaj sa 0 karata
    time: "19:00",
    location: "Narodno pozorište, Beograd"
  },
  {
    name: "ŽELJKO JOKSIMOVIĆ",
    cost: 0.8,
    tickets: 200,
    date: "2025-10-09", // Drugi od onih sa 200 karata
    time: "20:30",
    location: "Sava Centar, Beograd"
  },
  {
    name: "MARIJA ŠERIFOVIĆ",
    cost: 0.9,
    tickets: 200,
    date: "2025-12-28",
    time: "20:00",
    location: "Dom omladine, Beograd"
  },
  {
    name: "CRVENA ZVEZDA vs PARTIZAN",
    cost: 2,
    tickets: 200,
    date: "2026-01-15", // Posle tih datuma
    time: "18:00",
    location: "Rajko Mitić stadion, Beograd"
  },
  {
    name: "NOVAK ĐOKOVIĆ - Exhibition match",
    cost: 3,
    tickets: 200,
    date: "2026-02-10", // Posle tih datuma
    time: "16:00",
    location: "Novak Tennis Center, Beograd"
  },
  {
    name: "ROMEO I JULIJA - Balet",
    cost: 0.6,
    tickets: 200,
    date: "2025-10-30", // Posle tih datuma
    time: "19:30",
    location: "Opera i balet, Beograd"
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    
    // Obriši postojeće događaje
    await Event.deleteMany({});
    console.log("Obrisani stari događaji");
    
    // Dodaj nove događaje
    await Event.insertMany(testEvents);
    console.log(`Dodano ${testEvents.length} test događaja`);
    
    // Prikaži dodane događaje
    const events = await Event.find();
    console.log("Događaji u bazi:");
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name} - ${event.cost} ETH - ${event.date}`);
    });
    
    mongoose.connection.close();
    console.log("Seeding završen uspešno!");
  } catch (error) {
    console.error("Greška prilikom seeding baze:", error);
    process.exit(1);
  }
}

// Pokreni seeding
seedDatabase();
