
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
      alert("Failed to add course");
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
