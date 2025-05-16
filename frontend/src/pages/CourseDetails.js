
// frontend/src/pages/CourseDetails.js
import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api'; // Use api instead of axios
import { AuthContext } from '../context/AuthContext';

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [materialUrl, setMaterialUrl] = useState(null);
  const [error, setError] = useState('');
  const { user, loading } = useContext(AuthContext); // Add AuthContext

  const fetchData = async (retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Fetching data for course ID ${courseId}, attempt ${attempt}`);
        // Fetch course data
        const { data: courseData } = await api.get(`/api/courses/${courseId}`); // Use specific endpoint
        if (!courseData) {
          console.warn(`Course with ID ${courseId} not found, attempt ${attempt}`);
          if (attempt === retries) throw new Error('Course not found');
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }
        setCourse(courseData);
        setMaterialUrl(courseData.materials && courseData.materials.length > 0 ? courseData.materials[0] : null);

        // Fetch exam data
        try {
          console.log(`Fetching exams for course ID ${courseId}`);
          const { data: examData } = await api.get(`/api/courses/exams/${courseId}`);
          console.log('Fetched exams:', examData);
          setExams(examData || []);
        } catch (examError) {
          console.error(`Failed to fetch exams:`, examError.response?.data || examError.message);
          setExams([]);
        }
        //const { data: examData } = await api.get(`/api/courses/exams/${courseId}`);
        //setExams(examData || []);
        setError('');
        return;
      } catch (error) {
        console.error(`Fetch attempt ${attempt} failed:`, error.message);
        if (attempt === retries) {
          setError('Failed to load course details or exams.');
          setCourse({ id: parseInt(courseId), title: 'Error', full_summary: 'Failed to load course details.' });
          setExams([]);
          setMaterialUrl(null);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchData(); // Only fetch when authenticated
    }
  }, [courseId, loading, user]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!course) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p>
        <strong>Course ID:</strong> {course.id}
      </p>
      <p>
        <strong>Short Summary:</strong> {course.short_summary}
      </p>
      <p>
        <strong>Full Summary:</strong> {course.full_summary}
      </p>
      <p>
        <strong>Faculty:</strong> {course.faculty}
      </p>
      <p>
        <strong>Level:</strong> {course.level}
      </p>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Course Materials</h2>
        {materialUrl ? (
          <div>
            <iframe
              src={`${materialUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Course Material"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
            <a
              href={materialUrl}
              download
              className="bg-blue-500 text-white p-2 rounded mt-2 inline-block hover:bg-blue-600"
            >
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
          exams.map((exam) => (
            <Link
              key={exam.id}
              to={`/courses/${courseId}/exam/${exam.id}`}
              className="block bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600"
            >
              Take {exam.name}
            </Link>
          ))
        ) : (
          <p className="text-gray-500">No Exams available</p>
        )}
      </div>
      <Link
        to="/courses"
        className="bg-gray-500 text-white p-2 rounded mt-4 hover:bg-gray-600"
      >
        Back to Courses
      </Link>
    </div>
  );
}

{/*
import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
//import axios from "axios";
import api from '../api'; // Use api instead of axios
import { AuthContext } from '../context/AuthContext';

// Detailed view for a specific course, including exams and materials
export default function CourseDetails() {
  const { courseId } = useParams(); // Extract course ID from URL
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [materialUrl, setMaterialUrl] = useState(null); // Store PDF URL
  const [error, setError] = useState("");
  const { user, loading } = useContext(AuthContext); // Add AuthContext

  const fetchData = async (retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Fetching data for course ID ${courseId}, attempt ${attempt}`);
        // Fetch course data
        //const { data: courseData } = await axios.get(
        //  `${process.env.REACT_APP_API_URL}/api/courses/list`,
        //  { timeout: 30000 } // 30-second timeout
        //);
        const { data: courseData } = await api.get(`/api/courses/${courseId}`,
          { timeout: 30000 } // 30-second timeout
        ); // Use specific endpoint
        
        const selectedCourse = courseData.find(c => c.id === parseInt(courseId));
        if (!selectedCourse) {
          console.warn(`Course with ID ${courseId} not found, attempt ${attempt}`);
          if (attempt === retries) throw new Error("Course not found");
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }
        setCourse(selectedCourse);
        setMaterialUrl(selectedCourse.materials && selectedCourse.materials.length > 0 ? selectedCourse.materials[0] : null);

        // Fetch exam data
        const { data: examData } = await api.get(`/api/courses/exams/${courseId}`);
        
        //const { data: examData } = await axios.get(
        //  `${process.env.REACT_APP_API_URL}/api/courses/exams/${courseId}`,
        //  { timeout: 30000 } // 30-second timeout
        //);
        setExams(examData || []);
        setError("");
        return;
      } catch (error) {
        console.error(`Fetch attempt ${attempt} failed:`, error.message);
        if (attempt === retries) {
          setError("Failed to load course details or exams.");
          setCourse({ id: parseInt(courseId), title: "Error", full_summary: "Failed to load course details." });
          setExams([]);
          setMaterialUrl(null);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchData(); // Only fetch when authenticated
    }
  }, [courseId, loading, user]);

  if (loading) return <div className="p-4">Loading...</div>;
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

*/}