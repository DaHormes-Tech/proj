
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const XLSX = require("xlsx");
const fs = require("fs");

module.exports = (upload) => { // Accept upload as param
  const router = express.Router();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Middleware to check admin (for simplicity, hardcoded email)
  const isAdmin = (req, res, next) => {
    console.log("Request body after multer:", req.body); // Debug log
    const { email } = req.body;
    if (email !== "admin@uniben.edu") {
      return res.status(403).json({ error: "Admin access only" });
    }
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
  router.post("/upload-file", upload.single("file"), isAdmin, async (req, res) => {
    console.log("File upload body:", req.body, "File:", req.file); //Debug log
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const courses = data.map(row => {
      let qaData = { questions: [] }; // Default empty QA for courses
      if (row.QA) {
        try {
          const parsedQA = JSON.parse(row.QA.replace(/\\"/g, '"').replace(/^\\|\\/g, '')); // Clean and parse JSON
          qaData = { questions: parsedQA.questions && Array.isArray(parsedQA.questions) ? parsedQA.questions : [] };
        } catch (e) {
          console.log(`Invalid QA JSON in row "${row.Title}":`, row.QA, "Error:", e.message); // Log parsing errors
          qaData = { questions: [] }; // Fallback to empty array
        }
      }
      return {
        title: row.Title,
        short_summary: row["Short Summary"],
        full_summary: row["Full Summary"],
        qa: qaData,
        faculty: row.Faculty || "Science",
        level: row.Level || 100
      };
    });

    /*
    const courses = data.map(row => ({
      title: row.Title,
      short_summary: row["Short Summary"],
      full_summary: row["Full Summary"],
      qa: { questions: row.QA ? JSON.parse(row.QA) : [] },
      faculty: row.Faculty || "Science",
      level: row.Level || 100
    }));
    */

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
    if (error) return res.status(400).json({ error: error.message }); // Handle fetch errors
    res.json(data);
  });


  // Add exam for a course (admin only)
  router.post("/add-exam/:courseId", isAdmin, async (req, res) => {
    const { courseId } = req.params;
    const { name, questions } = req.body; // e.g., { name: "Exam 1", questions: [{question, options, correctAnswer}] }
    console.log("Adding exam for course:", courseId, "Exam:", { name, questions }); // Log exam details
    const { data, error } = await supabase
      .from("exams")
      .insert([{ name, course_id: courseId, questions }])
      .select();
    if (error) return res.status(400).json({ error: error.message }); // Handle insertion errors
    res.json({ message: "Exam added", data });
  });

  // Get exams for a course
  router.get("/exams/:courseId", async (req, res) => {
    const { courseId } = req.params;
    const { data, error } = await supabase.from("exams").select("*").eq("course_id", courseId);
    if (error) return res.status(400).json({ error: error.message }); // Handle fetch errors
    res.json(data);
  });

  return router; // Must return the router

}

/*
// Clean up any legacy escaped JSON or nested structure
    const cleanedData = data.map(course => {
      if (course.qa && typeof course.qa === "string" && course.qa.startsWith('{\"')) {
        const cleanedQA = course.qa.replace(/\\"/g, '"').replace(/^\\|\\/g, '');
        return { ...course, qa: JSON.parse(cleanedQA) };
      } else if (course.qa && course.qa.questions && course.qa.questions.questions) {
        return { ...course, qa: { questions: course.qa.questions.questions } };
      }
      return course;
    });
  
    // Optional: Update Supabase with cleaned data
    if (cleanedData.some(c => JSON.stringify(c.qa) !== JSON.stringify(data.find(d => d.id === c.id)?.qa))) {
      await supabase.from("courses").upsert(cleanedData, { onConflict: "id" });
      console.log("Updated legacy QA data in Supabase");
    }
  
    res.json(cleanedData);
  });

 router.get("/list", async (req, res) => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

*/