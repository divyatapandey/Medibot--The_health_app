require("dotenv").config();
const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");

// Manually connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("✅ Connected to DB");

    const doctors = [
        {
            name: "Dr. Smith",
            specialization: "Cardiologist",
            contactNumber: "9876543210",
            email: "smith@example.com",
            imageUrl: "https://example.com/images/smith.jpg"
        },
        {
            name: "Dr. Jane",
            specialization: "Dermatologist",
            contactNumber: "9123456789",
            email: "jane@example.com",
            imageUrl: "https://example.com/images/jane.jpg"
        },
        {
            name: "Dr. Patel",
            specialization: "Neurologist",
            contactNumber: "9988776655",
            email: "patel@example.com",
            imageUrl: "https://example.com/images/patel.jpg"
        }
    ];

    try {
        await Doctor.insertMany(doctors);
        console.log("✅ Doctors inserted successfully!");
    } catch (error) {
        console.error("❌ Error inserting doctors:", error.message);
    } finally {
        mongoose.disconnect();
    }
}).catch(err => {
    console.error("❌ DB connection failed:", err.message);
});
