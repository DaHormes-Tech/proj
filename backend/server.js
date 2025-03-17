
// Load environment variables at the start
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


// Load environment variables first
dotenv.config();
console.log("Environment Variables:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY);
console.log("PORT:", process.env.PORT);


// Initialize Express *after* dotenv
const app = express();

// Middleware and routes
app.use(cors());
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For form-data parsing

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const courseRouter = require("./routes/courses"); //Pass upload here

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRouter);

app.get("/", (req, res) => res.send("EdTeech API running"));

// Start server
const PORT = process.env.PORT || 65269;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

