
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
              <h3>Q&A</h3>
              <pre>{JSON.parse(course.qa)}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

