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