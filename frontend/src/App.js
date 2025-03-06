
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Admin from "./pages/Admin";
import Exam from "./pages/Exam";
import Navbar from "./components/Navbar";

// Main application component, routing all pages with React Router
export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} /> {/* Default login route */}
        <Route path="/courses" element={<Courses />} /> {/* Courses list for users */}
        <Route path="/courses/:courseId/exam/:examId" element={<Exam />} /> {/* Dynamic exam route for CBT */}
        <Route path="/admin/*" element={<Admin />} /> {/* Wildcard for admin sub-routes (courses, exams) */}
      </Routes>
    </Router>
  );
}
