
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const XLSX = require("xlsx");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/"});
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware to check admin (for simplicity, hardcoded email)
const isAdmin = (req, res, next) => {
  const { email } = req.body;
  console.log("Admin check - Email:", email);
  if (email !== "admin@uniben.edu") return res.status(403).json({ error: "Admin access only" });
  next();
};

// Upload course (admin only)
router.post("/add-course", isAdmin, async (req, res) => {
  const { title, short_summary, full_summary, qa, faculty, level } = req.body;
  console.log("Course upload attempt:", { title, short_summary, full_summary, qa, faculty, level });
  const { data, error } = await supabase
    .from("courses")
    .insert([{ title, short_summary, full_summary, qa, faculty, level }]) // qa is already an object
    .select();
  if (error) {
    console.log("Supabase error:", error);
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "Course added", data });
});

// For Excel Upload
router.post("/upload-file", isAdmin, upload.single("file"), async (req, res) => {
  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  const courses = data.map(row => ({
    title: row.Title,
    short_summary: row["Short Summary"],
    full_summary: row["Full Summary"],
    qa: { questions: row.QA ? JSON.parse(row.QA) : [] },
    faculty: row.Faculty || "Science",
    level: row.Level || 100
  }));

  const { data: inserted, error } = await supabase.from("courses").insert(courses).select();
  fs.unlinkSync(req.file.path); // Clean up temp file
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Courses uploaded", data: inserted });
});


/*
router.post("/add-course", isAdmin, async (req, res) => {
  const { title, short_summary, full_summary, qa, faculty, level } = req.body;
  console.log("Course upload attempt:", { title, short_summary, full_summary, qa, faculty, level });
  const { data, error } = await supabase
    .from("courses")
    .insert([{ title, short_summary, full_summary, qa: JSON.stringify(qa), faculty, level }]);
  if (error) {
    console.log("Supabase error:", error);
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "Course added", data });
}); */

/*
router.post("/add-course", isAdmin, async (req, res) => {
  const { title, short_summary, full_summary, qa, faculty, level } = req.body;
  const { data, error } = await supabase
    .from("courses")
    .insert([{ title, short_summary, full_summary, qa: JSON.stringify(qa), faculty, level }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Course added", data });
}); */

// Fetch courses (for frontend)
router.get("/list", async (req, res) => {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
