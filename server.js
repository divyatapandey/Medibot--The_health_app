const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cron = require('node-cron');
const axios = require('axios');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect Database
connectDB();

// Routes with versioning
app.use("/v1/api/auth", require("./routes/authRoutes"));
app.use("/v1/api/email", require("./routes/emailRoutes"));
app.use("/v1/api/appointment", require("./routes/appointmentRoutes"));
app.use("/v1/api/medicine",require("./routes/medicineRoutes"));
app.use("/v1/api/doctor", require("./routes/doctorRoutes"));
app.use("/v1/api/reminder", require("./routes/reminderRoutes"));

// Schedule reminder check every 10 minutes
const job = cron.schedule('*/10 * * * *', async () => {
    try {
        console.log('\n[Cron Job] Running reminder check at', new Date().toLocaleString());
        // local
        // const response = await axios.post(`http://localhost:${process.env.PORT || 5000}/v1/api/reminder/send-reminders`);
        await axios.post('https://medibot-8u6y.onrender.com/v1/api/reminder/send-reminders');
        console.log('[Cron Job] Reminder check completed successfully');
    } catch (error) {
        console.error('[Cron Job] Error during reminder check:', error.message);
    }
});

// Start the cron job
job.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Cron job is active and will run every 10 minutes');
});
