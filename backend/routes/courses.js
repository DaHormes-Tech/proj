
console.log("Loading routes/courses.js..."); // Debug to confirm file is loaded

const express = require("express");
const { supabase } = require("../config/supabase"); // Use global supabase config
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for Supabase

const router = express.Router();

// Middleware to check admin access
const isAdmin = (req, res, next) => {
  console.log("Request body after multer:", req.body); // Debug log
  const { email } = req.body;
  if (email !== "admin@uniben.edu") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};

// Custom timeout function using Promise.race
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]);
};

// Add course (admin only)
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

// Upload course or material file (e.g., PDF)
router.post("/upload-file", upload.single("file"), isAdmin, async (req, res) => {
  try {
    console.log("Handling /upload-file route..."); // Debug to confirm route is hit
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

    // Upload to Supabase Storage with timeout and retry
    console.log("Uploading to Supabase Storage...");
    const maxRetries = 3;
    let attempt = 0;
    let storageData, storageError;
    while (attempt < maxRetries) {
      try {
        const response = await withTimeout(
          supabase.storage
            .from("course-materials")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            }),
          30000 // 30-second timeout
        );
        
        storageData = response.data;
        storageError = response.error;
        break;
      } catch (error) {
        attempt++;
        console.warn(`Upload attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
      }
    }
    if (storageError) {
      console.error("Supabase Storage error:", storageError.message);
      throw storageError;
    }
    console.log("Storage upload successful, public URL generating...");

    // Verify the file exists in Storage
    console.log("Verifying file exists in Storage...");
    const { data: fileCheck, error: fileCheckError } = await supabase.storage
      .from("course-materials")
      .list(`${numericCourseId}/`, { search: fileName.split("/")[1] });
    if (fileCheckError || !fileCheck || fileCheck.length === 0) {
      console.error("File not found after upload:", fileCheckError?.message || "No file found");
      throw new Error("Failed to verify file in Storage");
    }
    console.log("File verified in Storage:", fileCheck);

    // Fetch course with retry logic
    console.log(`Fetching course with ID ${numericCourseId}...`);
    let courseData, courseError;
    attempt = 0;
    while (attempt < maxRetries) {
      try {
        const response = await withTimeout(
          supabase.storage
            .from("course-materials")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            }),
          30000 // 30-second timeout
        );
        courseData = response.data;
        courseError = response.error;
        break;
      } catch (error) {
        attempt++;
        console.warn(`Fetch attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
      }
    }
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
    const { data: updatedData, error: updateError } = await supabase
      .from("courses")
      .update({
        materials: updatedMaterials,
      })
      .eq("id", numericCourseId)
      .select();

    if (updateError) {
      console.error("Update error details:", updateError.message, updateError.code, updateError.details);
      throw updateError;
    }

    console.log(`Successfully updated course ${numericCourseId} with new material URL`, updatedData);
    res.json({ message: "File uploaded successfully", url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error.message, error.stack); // Include stack trace
    res.status(500).json({ error: "Failed to upload material: " + error.message });
  }
});

module.exports = router; // Export the router directly