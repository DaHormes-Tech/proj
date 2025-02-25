const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

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
app.use(express.json());

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const courseRoutes = require("./routes/courses");

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => res.send("EdTech API running"));

// Start server
const PORT = process.env.PORT || 65269;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

