
import { useState, useEffect } from "react";
import { db, syncCourses } from "../database";
import axios from "axios";
import CourseCard from "../components/CourseCard";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/list`);
        await syncCourses(data);
        const offlineCourses = await db.courses.toArray();
        setCourses(offlineCourses);
      } catch (error) {
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
      {filteredCourses.length ? (
        filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
      ) : (
        <p className="text-gray-500">No courses found.</p>
      )}
    </div>
  );

  /*
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
  */
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
