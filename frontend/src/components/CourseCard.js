export default function CourseCard({ course }) {
  const isLoggedIn = !!localStorage.getItem("token");
  console.log("Course data in CourseCard:", course); // Debug log

  // Parse qa if it's a string, default to empty object
  let qa = course.qa || { questions: [] };
  if (typeof qa === "string") {
    try {
      qa = JSON.parse(qa);
    } catch (e) {
      console.log("Failed to parse qa:", e, "Raw qa:", course.qa);
      qa = { questions: [] };
    }
  }

  // Flatten nested questions if present
  if (qa.questions && qa.questions.questions && Array.isArray(qa.questions.questions)) {
    qa = { questions: qa.questions.questions };
  }

  return (
    <div className="border p-4 mb-4 rounded shadow hover:shadow-lg transition">
      <h2 className="text-xl font-bold text-blue-600">{course.title}</h2>
      <p className="text-gray-700">{isLoggedIn ? course.full_summary : course.short_summary}</p>
      {isLoggedIn && qa && Array.isArray(qa.questions) && qa.questions.length > 0 ? (
        <div>
          <h3 className="text-lg mt-2 font-semibold text-gray-800">Q&A</h3>
          <ul className="list-disc pl-5">
            {qa.questions.map((qaItem, index) => (
              <li key={index} className="mt-2">
                <strong className="text-gray-900">Q:</strong> {qaItem.question}
                <ul className="list-circle pl-5 mt-1">
                  {qaItem.options && qaItem.options.length > 0 ? (
                    qaItem.options.map((opt, i) => (
                      <li key={i} className={qaItem.correctAnswer === opt ? "text-green-600 font-semibold" : "text-gray-600"}>
                        {opt}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">No options available</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : isLoggedIn ? (
        <p className="text-gray-500 mt-2">No Q&A available</p>
      ) : null}
    </div>
  );
}

/*
export default function CourseCard({ course }) {
  const isLoggedIn = !!localStorage.getItem("token");
  console.log("Course data in CourseCard:", course); //Debug log

  // Parse qa if it's a string (unlikely now, but for safety)
  const qa = typeof course.qa === "string" ? JSON.parse(course.qa) : course.qa || { questions: [] };

  return (
    <div className="border p-4 mb-4 rounded shadow hover:shadow-lg transition">
      <h2 className="text-xl font-bold text-blue-600">{course.title}</h2>
      <p className="text-gray-700">{isLoggedIn ? course.full_summary : course.short_summary}</p>
      {isLoggedIn && course.qa && Array.isArray(course.qa.questions) && course.qa.questions.length > 0 ? (
        <div>
          <h3 className="text-lg mt-2 font-semibold text-gray-800">Q&A</h3>
          <ul className="list-disc pl-5">
            {course.qa.questions.map((qaItem, index) => (
              <li key={index} className="mt-2">
                <strong className="text-gray-900">Q:</strong> {qaItem.question}
                <ul className="list-circle pl-5 mt-1">
                  {qaItem.options && qaItem.options.length > 0 ? (
                    qaItem.options.map((opt, i) => (
                      <li key={i} className={qaItem.correctAnswer === opt ? "text-green-600 font-semibold" : "text-gray-600"}>
                        {opt}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">No options available</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : isLoggedIn ? (
        <p className="text-gray-500 mt-2">No Q&A available</p>
      ) : null}
    </div>
  );
}


export default function CourseCard({ course }) {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="border p-4 mb-4 rounded shadow hover:shadow-lg transition">
      <h2 className="text-xl font-bold text-blue-600">{course.title}</h2>
      <p className="text-gray-700">{isLoggedIn ? course.full_summary : course.short_summary}</p>
      {isLoggedIn && (
        <div>
          <h3 className="text-lg mt-2 font-semibold text-gray-800">Q&A</h3>
          <ul className="list-disc pl-5">
            {course.qa.questions.map((qa, index) => (
              <li key={index} className="mt-2">
                <strong className="text-gray-900">Q:</strong> {qa.question}
                <ul className="list-circle pl-5 mt-1">
                  {qa.options.map((opt, i) => (
                    <li key={i} className={qa.correctAnswer === opt ? "text-green-600 font-semibold" : "text-gray-600"}>{opt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
*/