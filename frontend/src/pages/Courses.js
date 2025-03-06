
import { useState, useEffect } from "react";
import { db, syncCourses } from "../database";
import axios from "axios";
import CourseCard from "../components/CourseCard";
import { Link } from "react-router-dom";

// Courses list component for users, displaying courses and linking to exams/details with enhanced UI
export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: courseData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
        console.log("Fetched courses from API:", courseData);
        const parsedCourses = courseData.map(course => ({
          ...course,
          qa: { questions: [] }
        }));
        await syncCourses(parsedCourses);
        const offlineCourses = await db.courses.toArray();
        setCourses(offlineCourses);

        const examsData = {};
        for (const course of offlineCourses) {
          const { data: examData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/exams/${course.id}`);
          examsData[course.id] = examData;
        }
        setExams(examsData);
        setError("");
      } catch (error) {
        console.log("Fetch error:", error.response?.data || error.message);
        setError("Failed to load courses/exams. Showing offline data if available.");
        const offlineCourses = await db.courses.toArray();
        setCourses(offlineCourses);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 max-w-4xl mx-auto min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Course Catalog</h1>
      <input
        className="border-2 border-gray-300 p-2 mb-6 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search courses..."
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length ? (
          filteredCourses.map(course => (
            <div key={course.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <CourseCard course={course} />
              <Link
                to={`/courses/${course.id}`}
                className="bg-blue-500 text-white p-2 rounded-lg mt-4 block text-center hover:bg-blue-600 transition-colors"
              >
                View Course Details
              </Link>
              <div className="mt-4">
                {exams[course.id] && exams[course.id].length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <button className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors">Take Exam</button>
                    <select
                      className="border-2 border-gray-300 p-2 rounded-lg w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
                      onChange={(e) => window.location.href = `/courses/${course.id}/exam/${e.target.value}`}
                    >
                      <option value="">Select Exam</option>
                      {exams[course.id].map(exam => (
                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2 text-center">No Exams available</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">No courses found.</p>
        )}
      </div>
    </div>
  );
}
 
/*
import { useState, useEffect } from "react";
import { db, syncCourses } from "../database";
import axios from "axios";
import CourseCard from "../components/CourseCard";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
        await syncCourses(data);
        const offlineCourses = await db.courses.toArray();
        setCourses(offlineCourses);
        setError("");
      } catch (error) {
        console.log("Fetch error:", error.response?.data || error.message);
        setError("Failed to load courses. Showing offline data if available.");
        const offlineCourses = await db.courses.toArray();
        setCourses(offlineCourses);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  // Course Card
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <input className="border p-2 mb-4 w-full rounded" placeholder="Search courses..." onChange={(e) => setSearch(e.target.value)} />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {filteredCourses.length ? (
        filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
      ) : (
        <p className="text-gray-500">No courses found.</p>
      )}
    </div>
  );


  return (
    <div className="p-4">
      <input className="border p-2 mb-4 w-full" placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
      {filteredCourses.map(course => (
        <div key={course.id} className="border p-4 mb-4 rounded shadow">
          <h2 className="text-xl font-bold">{course.title}</h2>
          <p className="text-gray-700">{localStorage.getItem("token") ? course.full_summary : course.short_summary}</p>
          {localStorage.getItem("token") && (
            <div>
              <h3 className="text-lg mt-2 font-semibold">Q&A</h3>
              <ul className="list-disc pl-5">
                {course.qa.questions.map((qa, index) => (
                  <li key={index} className="mt-2">
                    <strong>Q:</strong> {qa.question}
                    <ul className="list-circle pl-5">
                      {qa.options.map((opt, i) => (
                        <li key={i} className={qa.correctAnswer === opt ? "text-green-600" : ""}>{opt}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  *
}

/*
import { useState, useEffect } from "react";
import { db, syncCourses } from "../database";
import axios from "axios";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
        await syncCourses(data); // Sync with offline DB
        const offlineCourses = await db.courses.toArray();
        setCourses(offlineCourses);
      } catch (error) {
        const offlineCourses = await db.courses.toArray();
        setCourses(offlineCourses); // Fallback to offline
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));


  return (
    <div className="p-4">
      <input className="border p-2 mb-4" placeholder="Search (AI placeholder)" onChange={(e) => setSearch(e.target.value)} />
      {filteredCourses.map(course => (
        <div key={course.id} className="border p-4 mb-4">
          <h2 className="text-xl">{course.title}</h2>
          <p>{localStorage.getItem("token") ? course.full_summary : course.short_summary}</p>
          {localStorage.getItem("token") && (
            <div>
              <h3 className="text-lg mt-2">Q&A</h3>
              <ul>
                {JSON.parse(course.qa).questions.map((qa, index) => (
                  <li key={index} className="mt-1">
                    <strong>Q:</strong> {qa.q} <br />
                    <strong>A:</strong> {qa.a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  /*
  return (
    <div className="p-4">
      <input className="border p-2 mb-4" placeholder="Search (AI placeholder)" onChange={(e) => setSearch(e.target.value)} />
      {filteredCourses.map(course => (
        <div key={course.id} className="border p-4 mb-4">
          <h2 className="text-xl">{course.title}</h2>
          <p>{localStorage.getItem("token") ? course.full_summary : course.short_summary}</p>
          {localStorage.getItem("token") && (
            <div>
              <h3>Q&A</h3>
              <pre>{JSON.parse(course.qa)}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  // mini comment end
}
*/


/*
return (
    <div className="p-4 max-w-4xl mx-auto">
      <input className="border p-2 mb-4 w-full rounded" placeholder="Search courses..." onChange={(e) => setSearch(e.target.value)} />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {filteredCourses.length ? (
        filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
      ) : (
        <p className="text-gray-500">No courses found.</p>
      )}
    </div>
  );
*/