
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware to check admin (for simplicity, hardcoded email)
const isAdmin = (req, res, next) => {
  const { email } = req.body;
  if (email !== "admin@uniben.edu") return res.status(403).json({ error: "Admin access only" });
  next();
};

// Upload course (admin only)
router.post("/add-course", isAdmin, async (req, res) => {
  const { title, short_summary, full_summary, qa, faculty, level } = req.body;
  const { data, error } = await supabase
    .from("courses")
    .insert([{ title, short_summary, full_summary, qa: JSON.stringify(qa), faculty, level }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Course added", data });
});

// Fetch courses (for frontend)
router.get("/list", async (req, res) => {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
