
import { useState } from "react";
import axios from "axios";

export default function Admin() {
  const [form, setForm] = useState({
    title: "",
    short_summary: "",
    full_summary: "",
    qa: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
    faculty: "Science",
    level: 100,
    email: "admin@uniben.edu"
  });

  const addQuestion = () => {
    setForm({
      ...form,
      qa: [...form.qa, { question: "", options: ["", "", "", ""], correctAnswer: "" }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQa = [...form.qa];
    if (field === "options") {
      newQa[index].options = value.split("\n").slice(0, 4); // Limit to 4 options
    } else {
      newQa[index][field] = value;
    }
    setForm({ ...form, qa: newQa });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/add-course`, {
        ...form,
        qa: { questions: form.qa }
      });
      alert("Course added!");
    } catch (error) {
      console.log("Upload error:", error.response?.data || error.message);
      alert("Failed to add course: " + (error.response?.data?.error || error.message));
    }
  };

  // File upload for Excel
  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", "admin@uniben.edu");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/courses/upload-file`, formData);
      alert("Courses uploaded!");
    } catch (error) {
      console.log("File upload error:", error.response?.data || error.message);
      alert("Failed to upload file: " + (error.response?.data?.error || error.message));
    }
  };


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
}

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