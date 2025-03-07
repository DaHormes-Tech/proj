
import { useState, useEffect } from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import axios from "axios";

// Admin portal component for managing courses and exams, designed for scalability and readability
export default function Admin() {
  const [courseForm, setCourseForm] = useState({
    title: "",
    short_summary: "",
    full_summary: "",
    faculty: "Science",
    level: 100,
    email: "admin@uniben.edu"
  });
  const [examForm, setExamForm] = useState({
    courseId: "",
    name: "Exam 1",
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
    email: "admin@uniben.edu"
  });
  const [file, setFile] = useState(null); // For course/exam files
  const [materialFile, setMaterialFile] = useState(null); // For material (PDF) upload
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState({});
  const location = useLocation();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
        setCourses(data);
        for (const course of data) {
          const { data: examsData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/exams/${course.id}`);
          setExams(prev => ({ ...prev, [course.id]: examsData }));
        }
      } catch (error) {
        console.log("Failed to fetch courses/exams:", error.response?.data || error.message);
      }
    };
    fetchCourses();
  }, []);

  console.log("Admin component rendered at path:", location.pathname);

  const addQuestion = () => {
    setExamForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...examForm.questions];
    if (field === "options") {
      newQuestions[index].options = value.split("\n").slice(0, 4);
    } else {
      newQuestions[index][field] = value;
    }
    setExamForm({ ...examForm, questions: newQuestions });
  };

  const handleCourseSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/add-course`, courseForm);
      alert("Course added!");
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
      setCourses(data);
    } catch (error) {
      console.log("Course upload error:", error.response?.data || error.message);
      alert("Failed to add course: " + (error.response?.data?.error || error.message));
    }
  };

  const handleExamSubmit = async () => {
    if (!courses.some(c => c.id === parseInt(examForm.courseId))) {
      alert("Invalid Course ID.");
      return;
    }
    try {
      const formattedExam = {
        name: examForm.name,
        questions: { questions: examForm.questions },
        email: examForm.email
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/add-exam/${examForm.courseId}`, formattedExam);
      alert("Exam added!");
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/exams/${examForm.courseId}`);
      setExams(prev => ({ ...prev, [examForm.courseId]: data }));
    } catch (error) {
      console.log("Exam upload error:", error.response?.data || error.message);
      alert("Failed to add exam: " + (error.response?.data?.error || error.message));
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", "admin@uniben.edu");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/upload-file`, formData);
      alert("Courses uploaded!");
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
      setCourses(data);
    } catch (error) {
      console.log("File upload error:", error.response?.data || error.message);
      alert("Failed to upload file: " + (error.response?.data?.error || error.message));
    }
  };

  const handleMaterialUpload = async (courseId) => {
    if (!materialFile) {
      alert("Please select a PDF file first!");
      return;
    }
    const selectedCourseId = document.querySelector("select").value; // Get selected courseId
    if (!selectedCourseId || isNaN(parseInt(selectedCourseId)) || parseInt(selectedCourseId) <= 0) {
      alert("Please select a valid course!");
      return;
    }
    const formData = new FormData();
    formData.append("file", materialFile);
    formData.append("courseId", courseId); // Link to specific course
    formData.append("email", "admin@uniben.edu"); // Add admin email for validation
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/upload-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Material uploaded successfully!");
      // Optionally update course materials (fetch new data if needed)
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
      setCourses(data); 
    } catch (error) {
      console.log("Material upload error:", error.response?.data || error.message);
      alert("Failed to upload material: " + (error.response?.data?.error || error.message));
    }
  };

  if (!location.pathname.startsWith("/admin")) {
    console.log("Invalid admin path detected, redirecting to /admin/courses");
    return <Navigate to="/admin/courses" replace />;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
      <nav className="mb-4">
        <Link to="/admin/courses" className="mr-4 text-blue-500 hover:text-blue-700">Courses</Link>
        <Link to="/admin/exams" className="text-blue-500 hover:text-blue-700">Exams</Link>
      </nav>

      <Routes>
        <Route path="courses" element={
          <div>
            <h2 className="text-xl font-semibold mb-2">Add Course</h2>
            <input className="border p-2 m-2 w-full rounded" placeholder="Title" onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
            <textarea className="border p-2 m-2 w-full rounded" placeholder="Short Summary" onChange={(e) => setCourseForm({ ...courseForm, short_summary: e.target.value })} />
            <textarea className="border p-2 m-2 w-full rounded" placeholder="Full Summary" onChange={(e) => setCourseForm({ ...courseForm, full_summary: e.target.value })} />
            <select className="border p-2 m-2 w-full rounded" onChange={(e) => setCourseForm({ ...courseForm, faculty: e.target.value })}>
              <option value="Science">Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Arts">Arts</option>
            </select>
            <input type="number" className="border p-2 m-2 w-full rounded" placeholder="Level (e.g., 100)" onChange={(e) => setCourseForm({ ...courseForm, level: parseInt(e.target.value) || 100 })} />
            <button onClick={handleCourseSubmit} className="bg-green-500 text-white p-2 rounded mt-2">Upload Course</button>
            <div className="mt-4">
              <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="m-2" />
              <button onClick={handleFileUpload} className="bg-purple-500 text-white p-2 rounded">Upload Excel File</button>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Upload Course Material (PDF)</h3>
              <select className="border p-2 m-2 w-full rounded" onChange={(e) => {
                // Pre-select course for material upload (optional)
              }}>
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title} (ID: {course.id})</option>
                ))}
              </select>
              <input type="file" accept="application/pdf" onChange={(e) => setMaterialFile(e.target.files[0])} className="m-2" />
              <button onClick={() => handleMaterialUpload(courses.find(c => c.id === parseInt(document.querySelector("select").value))?.id || "")} className="bg-blue-500 text-white p-2 rounded">Upload PDF</button>
            </div>
            {courses.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Existing Courses</h3>
                {courses.map(course => (
                  <div key={course.id} className="border p-2 rounded mt-2">
                    {course.title} (ID: {course.id}) - Exams: {exams[course.id]?.length || 0} - Materials: {course.materials ? "Yes" : "No"}
                  </div>
                ))}
              </div>
            )}
          </div>
        } />
        <Route path="exams" element={
          <div>
            <h2 className="text-xl font-semibold mb-2">Add Exam</h2>
            <select className="border p-2 m-2 w-full rounded" value={examForm.courseId} onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })}>
              <option value="">Select Course ID</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title} (ID: {course.id})</option>
              ))}
            </select>
            <input className="border p-2 m-2 w-full rounded" placeholder="Exam Name (e.g., Exam 1)" onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} />
            <h3 className="text-lg mt-2">Q&A (MCQs)</h3>
            {examForm.questions.map((q, index) => (
              <div key={index} className="border p-2 m-2 rounded">
                <input className="border p-2 m-1 w-full rounded" placeholder="Question" value={q.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} />
                <textarea className="border p-2 m-1 w-full rounded" placeholder="Options (one per line, max 4)" value={q.options.join("\n")} onChange={(e) => updateQuestion(index, "options", e.target.value)} />
                <input className="border p-2 m-1 w-full rounded" placeholder="Correct Answer" value={q.correctAnswer} onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)} />
              </div>
            ))}
            <button onClick={addQuestion} className="bg-blue-500 text-white p-2 rounded mt-2">Add Question</button>
            <button onClick={handleExamSubmit} className="bg-green-500 text-white p-2 rounded mt-2">Upload Exam</button>
            {examForm.courseId && exams[examForm.courseId] && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Existing Exams for Course {examForm.courseId}</h3>
                {exams[examForm.courseId].map(exam => (
                  <div key={exam.id} className="border p-2 rounded mt-2">
                    {exam.name} (ID: {exam.id})
                  </div>
                ))}
              </div>
            )}
          </div>
        } />
      </Routes>
    </div>
  );
}

/*
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Admin() {
  const [courseForm, setCourseForm] = useState({
    title: "",
    short_summary: "",
    full_summary: "",
    faculty: "Science",
    level: 100,
    email: "admin@uniben.edu"
  });

  const [examForm, setExamForm] = useState({
    courseId: "",
    name: "Exam 1",
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
    email: "admin@uniben.edu"
  });

  const [file, setFile] = useState(null); // Separate state for file

  const addQuestion = () => {
    setExamForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...examForm.questions];
    if (field === "options") {
      newQuestions[index].options = value.split("\n").slice(0, 4);
    } else {
      newQuestions[index][field] = value;
    }
    setExamForm({ ...examForm, questions: newQuestions });
  };

  const handleCourseSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/add-course`, courseForm);
      alert("Course added!");
    } catch (error) {
      console.log("Upload error:", error.response?.data || error.message);
      alert("Failed to add course: " + (error.response?.data?.error || error.message));
    }
  };

  const handleExamSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/add-exam/${examForm.courseId}`, {
        name: examForm.name,
        questions: examForm.questions,
        email: examForm.email
      });
      alert("Exam added!");
    } catch (error) {
      console.log("Exam upload error:", error.response?.data || error.message); // Log errors for debugging
      alert("Failed to add exam: " + (error.response?.data?.error || error.message));
    }
  };

  // File upload for Excel
  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", "admin@uniben.edu");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/upload-file`, formData);
      alert("Courses uploaded!");
    } catch (error) {
      console.log("File upload error:", error.response?.data || error.message); // Log errors for debugging
      alert("Failed to upload file: " + (error.response?.data?.error || error.message));
    }
  };


  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
      <nav className="mb-4">
        <Link to="/admin/courses" className="mr-4 text-blue-500 hover:text-blue-700">Courses</Link>
        <Link to="/admin/exams" className="text-blue-500 hover:text-blue-700">Exams</Link>
      </nav>

      <Routes>
        <Route path="/courses" element={
          <div>
            <h2 className="text-xl font-semibold mb-2">Add Course</h2>
            <input className="border p-2 m-2 w-full rounded" placeholder="Title" onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
            <textarea className="border p-2 m-2 w-full rounded" placeholder="Short Summary" onChange={(e) => setCourseForm({ ...courseForm, short_summary: e.target.value })} />
            <textarea className="border p-2 m-2 w-full rounded" placeholder="Full Summary" onChange={(e) => setCourseForm({ ...courseForm, full_summary: e.target.value })} />
            <select className="border p-2 m-2 w-full rounded" onChange={(e) => setCourseForm({ ...courseForm, faculty: e.target.value })}>
              <option value="Science">Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Arts">Arts</option>
            </select>
            <input type="number" className="border p-2 m-2 w-full rounded" placeholder="Level (e.g., 100)" onChange={(e) => setCourseForm({ ...courseForm, level: parseInt(e.target.value) || 100 })} />
            <button onClick={handleCourseSubmit} className="bg-green-500 text-white p-2 rounded mt-2">Upload Course</button>
            <div className="mt-4">
              <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="m-2" />
              <button onClick={handleFileUpload} className="bg-purple-500 text-white p-2 rounded">Upload Excel File</button>
            </div>
          </div>
        } />
        <Route path="/exams" element={
          <div>
            <h2 className="text-xl font-semibold mb-2">Add Exam</h2>
            <input className="border p-2 m-2 w-full rounded" placeholder="Course ID" onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })} />
            <input className="border p-2 m-2 w-full rounded" placeholder="Exam Name (e.g., Exam 1)" onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} />
            <h3 className="text-lg mt-2">Q&A (MCQs)</h3>
            {examForm.questions.map((q, index) => (
              <div key={index} className="border p-2 m-2 rounded">
                <input className="border p-2 m-1 w-full rounded" placeholder="Question" value={q.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} />
                <textarea className="border p-2 m-1 w-full rounded" placeholder="Options (one per line, max 4)" value={q.options.join("\n")} onChange={(e) => updateQuestion(index, "options", e.target.value)} />
                <input className="border p-2 m-1 w-full rounded" placeholder="Correct Answer" value={q.correctAnswer} onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)} />
              </div>
            ))}
            <button onClick={addQuestion} className="bg-blue-500 text-white p-2 rounded mt-2">Add Question</button>
            <button onClick={handleExamSubmit} className="bg-green-500 text-white p-2 rounded mt-2">Upload Exam</button>
          </div>
        } />
      </Routes>
    </div>
  );

}
*/

/*
import { useState } from "react";
import axios from "axios";

export default function Admin() {
  const [form, setForm] = useState({ title: "", short_summary: "", full_summary: "", qa: "", faculty: "Science", level: 100, email: "admin@uniben.edu" });

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/add-course`, {
        ...form,
        qa: { questions: form.qa.split("\n").map(q => ({ q, a: "Sample answer" })) } // Simple Q&A parsing
      });
      alert("Course added!");
    } catch (error) {
      console.log("Upload error:", error.response?.data || error.message);
      alert("Failed to add course: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl">Admin Portal</h1>
      <input className="border p-2 m-2" placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="border p-2 m-2" placeholder="Short Summary" onChange={(e) => setForm({ ...form, short_summary: e.target.value })} />
      <textarea className="border p-2 m-2" placeholder="Full Summary" onChange={(e) => setForm({ ...form, full_summary: e.target.value })} />
      <textarea className="border p-2 m-2" placeholder="Q&A (one question per line)" onChange={(e) => setForm({ ...form, qa: e.target.value })} />
      <button className="bg-green-500 text-white p-2" onClick={handleSubmit}>Upload Course</button>
    </div>
  );
}
*/

/*
return (
    <div className="p-4">
      <h1 className="text-2xl">Admin Portal</h1>
      <input className="border p-2 m-2 w-full" placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="border p-2 m-2 w-full" placeholder="Short Summary" onChange={(e) => setForm({ ...form, short_summary: e.target.value })} />
      <textarea className="border p-2 m-2 w-full" placeholder="Full Summary" onChange={(e) => setForm({ ...form, full_summary: e.target.value })} />
      <h3 className="text-lg mt-2">Q&A (MCQs)</h3>
      {form.qa.map((q, index) => (
        <div key={index} className="border p-2 m-2">
          <input className="border p-2 m-1 w-full" placeholder="Question" value={q.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} />
          <textarea className="border p-2 m-1 w-full" placeholder="Options (one per line, max 4)" value={q.options.join("\n")} onChange={(e) => updateQuestion(index, "options", e.target.value)} />
          <input className="border p-2 m-1 w-full" placeholder="Correct Answer" value={q.correctAnswer} onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)} />
        </div>
      ))}
      <button className="bg-blue-500 text-white p-2 m-2" onClick={addQuestion}>Add Question</button>
      <button className="bg-green-500 text-white p-2 m-2" onClick={handleSubmit}>Upload Course</button>
      <div className="mt-4">
        <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="m-2" />
        <button className="bg-purple-500 text-white p-2 m-2" onClick={handleFileUpload}>Upload Excel File</button>
      </div>
    </div>
  );
*/
