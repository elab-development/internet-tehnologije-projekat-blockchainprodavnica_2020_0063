const mongoose = require("mongoose");

// Funkcija za povezivanje sa MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/eventsDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB konektovan!");
  } catch (err) {
    console.error("Greška prilikom povezivanja na MongoDB:", err);
    process.exit(1);
  }
};

// Eksportovanje funkcije za povezivanje
module.exports = connectDB;
