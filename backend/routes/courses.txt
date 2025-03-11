
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const XLSX = require("xlsx");
const fs = require("fs");
const router = express.Router();
const { supabase } = require("../config/supabase"); // Assuming supabase config
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for Supabase


module.exports = (upload) => { // Accept upload as param
  const router = express.Router();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  console.log("Loading routes/courses.js..."); // Add this at the top of the file

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

  console.log("Loadidhdtg routes/courses.js..."); // Add this at the top of the file
  
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


  console.log("Loading roukhjgtes/courses.js..."); // Add this at the top of the file
  
    
  // Upload course or material file (e.g., PDF)
  router.post("/upload-file", isAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const courseId = req.body.courseId;
      console.log("Received courseId:", courseId); // Debug log for incoming courseId
      if (!courseId || isNaN(parseInt(courseId)) || parseInt(courseId) <= 0) {
        return res.status(400).json({ error: "Valid Course ID is required" });
      }

      const numericCourseId = parseInt(courseId);
      console.log(`Uploading file for course ${numericCourseId}`); // Debug log
      console.log("Full request body:", req.body); // Debug full request body
      console.log("File details:", file); // Debug file details

      const fileName = `${numericCourseId}/${Date.now()}_${file.originalname}`;

      // Upload to Supabase Storage
      console.log("Uploading to Supabase Storage...");
      const { data: storageData, error: storageError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (storageError) {
        console.error("Supabase Storage error:", storageError.message);
        throw storageError;
      }
      console.log("Storage upload successful, public URL generating...");

      // Verify course exists and fetch current data
      console.log(`Fetching course with ID ${numericCourseId}...`);
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, materials")
        .eq("id", numericCourseId)
        .single();

      if (courseError) {
        console.error("Course fetch error:", courseError.message);
        return res.status(500).json({ error: "Failed to fetch course: " + courseError.message });
      }

      if (!courseData) {
        console.error(`Course with ID ${numericCourseId} not found in fetched data`);
        return res.status(404).json({ error: `Course with ID ${numericCourseId} not found` });
      }

      console.log("Fetched course data:", courseData); // Debug log

      // Update materials field, preserving existing data
      const publicUrl = supabase.storage.from("course-materials").getPublicUrl(fileName).data.publicUrl;
      const updatedMaterials = courseData.materials ? [...courseData.materials, publicUrl] : [publicUrl];
      console.log("Updating course with new materials:", updatedMaterials); // Debug log
      const { error: updateError } = await supabase
        .from("courses")
        .update({
          materials: updatedMaterials,
        })
        .eq("id", numericCourseId);

      if (updateError) {
        console.error("Update error details:", updateError.message, updateError.code, updateError.details);
        throw updateError;
      }

      console.log(`Successfully updated course ${numericCourseId} with new material URL`);
      res.json({ message: "File uploaded successfully", url: publicUrl });
    } catch (error) {
      console.error("Upload error:", error.message, error.stack); // Include stack trace
      res.status(500).json({ error: "Failed to upload material: " + error.message });
    }
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