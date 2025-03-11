
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Course() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  const fetchCourse = async (retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`, { timeout: 30000 });
        const courseData = data.find(c => c.id === parseInt(id));
        if (courseData && (!courseData.materials || courseData.materials.length === 0)) {
          console.warn("No materials found, retrying...");
          if (attempt === retries) throw new Error("No materials available after retries");
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
        setCourse(courseData);
        return;
      } catch (error) {
        console.error(`Fetch attempt ${attempt} failed:`, error.message);
        if (attempt === retries) {
          setCourse({ id: parseInt(id), title: "Error", full_summary: "Failed to load course details." });
          return;
        }
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (!course) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p className="mb-4">{course.full_summary}</p>
      {course.materials && course.materials.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Course Materials</h2>
          {course.materials.map((url, index) => (
            <div key={index} className="mb-4">
              <iframe
                src={url}
                title={`Course Material ${index + 1}`}
                className="w-full h-96 border"
                onError={(e) => console.log("Iframe error:", e)}
              />
              <a href={url} download className="text-blue-500 hover:underline">
                Download PDF
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>No materials available.</p>
      )}
    </div>
  );
}

/*
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Detailed view for a specific course, including exams and materials
export default function CourseDetails() {
  const { courseId } = useParams(); // Extract course ID from URL
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [materialUrl, setMaterialUrl] = useState(null); // Store PDF URL
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
        setMaterialUrl(selectedCourse.materials || null); // Fetch material URL from course

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

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!course) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p><strong>Course ID:</strong> {course.id}</p>
      <p><strong>Short Summary:</strong> {course.short_summary}</p>
      <p><strong>Full Summary:</strong> {course.full_summary}</p>
      <p><strong>Faculty:</strong> {course.faculty}</p>
      <p><strong>Level:</strong> {course.level}</p>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Course Materials</h2>
        {materialUrl ? (
          <div>
            <iframe
              src={`${materialUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Course Material"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            />
            <a href={materialUrl} download className="bg-blue-500 text-white p-2 rounded mt-2 inline-block hover:bg-blue-600">
              Download PDF
            </a>
          </div>
        ) : (
          <p className="text-gray-500">No materials available</p>
        )}
      </div>
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

*/