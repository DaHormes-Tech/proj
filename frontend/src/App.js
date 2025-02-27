
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Admin from "./pages/Admin";
import Exam from "./pages/Exam"; // New CBT page
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId/exam/:examId" element={<Exam />} /> {/* New route */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
