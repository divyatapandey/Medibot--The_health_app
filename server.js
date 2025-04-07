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

// Schedule reminder check every minute
const job = cron.schedule('* * * * *', async () => {
    try {
        console.log('\n[CRON] ==========================================');
        console.log(`[CRON] Running reminder check at ${new Date().toLocaleString()}`);
        console.log('[CRON] Making request to reminder endpoint...');
        
        // local
        // const response = await axios.post(`http://localhost:${process.env.PORT || 5000}/v1/api/reminder/send-reminders`);
        const response = await axios.post('https://medibot-8u6y.onrender.com/v1/api/reminder/send-reminders');
        
        console.log('[CRON] Response from reminder endpoint:', response.data);
        console.log('[CRON] ==========================================\n');
    } catch (error) {
        console.error('[CRON] Error during reminder check:', error.message);
        if (error.response) {
            console.error('[CRON] Response data:', error.response.data);
            console.error('[CRON] Response status:', error.response.status);
        }
    }
});

// Start the cron job
job.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Cron job is active and will run every minute');
});
