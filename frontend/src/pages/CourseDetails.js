
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Detailed view for a specific course, including exams and materials
export default function CourseDetails() {
  const { courseId } = useParams(); // Extract course ID from URL
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: courseData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
        const selectedCourse = courseData.find(c => c.id === parseInt(courseId));
        if (!selectedCourse) {
          setError("Course not found.");
          return;
        }
        setCourse(selectedCourse);

        const { data: examData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/exams/${courseId}`);
        setExams(examData);
        setError("");
      } catch (error) {
        console.log("Fetch error:", error.response?.data || error.message); // Log fetch errors
        setError("Failed to load course details or exams.");
      }
    };
    fetchData();
  }, [courseId]);

  if (error) return <div className="p-4 text-red-500">{error}</div>; // Display error message
  if (!course) return <div className="p-4">Loading...</div>; // Show loading while fetching

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p><strong>Course ID:</strong> {course.id}</p>
      <p><strong>Short Summary:</strong> {course.short_summary}</p>
      <p><strong>Full Summary:</strong> {course.full_summary}</p>
      <p><strong>Faculty:</strong> {course.faculty}</p>
      <p><strong>Level:</strong> {course.level}</p>
      <p><strong>Course Materials:</strong> [Placeholder - Add material upload logic later]</p>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Exams</h2>
        {exams.length > 0 ? (
          exams.map(exam => (
            <Link key={exam.id} to={`/courses/${courseId}/exam/${exam.id}`} className="block bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">
              Take {exam.name}
            </Link>
          ))
        ) : (
          <p className="text-gray-500">No Exams available</p>
        )}
      </div>
      <Link to="/courses" className="bg-gray-500 text-white p-2 rounded mt-4 hover:bg-gray-600">Back to Courses</Link>
    </div>
  );
}
