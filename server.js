const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
