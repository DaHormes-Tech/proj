
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
//import axios from "axios";
import api from '../api'; // Use api instead of axios
import { AuthContext } from '../context/AuthContext';

// CBT exam interface for courses, with robust error handling and randomization
export default function Exam() {
  const { courseId, examId } = useParams(); // Extract course and exam IDs from URL
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({}); // Track user-selected answers
  const [submitted, setSubmitted] = useState(false); // Track if exam is submitted
  const [score, setScore] = useState({ fraction: "0/0", percentage: 0 }); // Track exam score
  const [error, setError] = useState(""); // Track errors
  const { user, loading } = useContext(AuthContext); // Add AuthContext

  // Fetch exam data when component mounts or params change
  useEffect(() => {
    const fetchExam = async () => {
      try {
        console.log(`Fetching exam for course ${courseId}, exam ${examId}`); // Debug: Log fetch attempt
        const { data } = await api.get(`/api/courses/exams/${courseId}`); // Use api
        //const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/exams/${courseId}`);
        console.log("Exam data response:", data); // Debug: Log API response
        // Match by ID (numeric)
        const numericExamId = parseInt(examId);
        const selectedExam = data.find(e => e.id === numericExamId);
        if (!selectedExam) {
          setError("Exam not found.");
          return;
        }
        const examQuestions = selectedExam.questions?.questions || selectedExam.questions || [];
        if (!examQuestions.length) {
          setError("No questions available for this exam.");
          return;
        }
        // Shuffle questions and options for freshness
        //const shuffledQuestions = shuffleArray(selectedExam.questions.questions.map(q => ({
        //  ...q,
        //  options: shuffleArray(q.options)
          //})));
        const shuffledQuestions = shuffleArray(examQuestions.map(q => ({
          ...q,
          options: shuffleArray(q.options)
        })));
        setExam({ ...selectedExam, questions: { questions: shuffledQuestions } });
        setError("");
      } catch (error) {
        console.log("Fetch exam error:", error.response?.data || error.message);
        setError("Failed to load exam. Check course and exam IDs or server status.");
      }
    };
    
    if (!loading && user) {
      fetchExam(); // Only fetch when authenticated
    }
    //fetchExam();
  }, [courseId, examId, loading, user]); // Re-run on route param changes

  // Fisher-Yates shuffle algorithm for randomizing arrays
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Handle user answer selection
  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  // Submit exam and calculate score
  const handleSubmit = () => {
    if (!exam) {
      setError("Exam not loaded. Try again.");
      return;
    }
    let correct = 0;
    const total = exam.questions.questions.length;
    exam.questions.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correct++;
    });
    const fraction = `${correct}/${total}`;
    const percentage = Math.round((correct / total) * 100);
    setScore({ fraction, percentage });
    setSubmitted(true);
  };

  // Reset exam, clearing answers and reshuffling questions/options
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore({ fraction: "0/0", percentage: 0 });
    if (exam) {
      const shuffledQuestions = shuffleArray(exam.questions.questions.map(q => ({
        ...q,
        options: shuffleArray(q.options)
      })));
      setExam(prev => ({ ...prev, questions: { questions: shuffledQuestions } }));
    }
  };

  // Handle errors or loading states
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>; // Display error message if any
  if (!exam) return <div className="p-4">Loading exam...</div>; // Show loading while fetching

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{exam.name} for Course {courseId}</h1>
      {exam.questions.questions.map((q, index) => (
        <div key={index} className="border p-4 mb-4 rounded shadow">
          <p className="text-lg font-semibold">{q.question}</p>
          {q.options.map((option, i) => (
            <label key={i} className="block mt-2">
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                checked={answers[index] === option}
                onChange={() => handleAnswerChange(index, option)}
                disabled={submitted}
                className="mr-2"
              />
              {option}
            </label>
          ))}
          {submitted && (
            <p className="mt-2 text-sm">
              Correct Answer: <span className={answers[index] === q.correctAnswer ? "text-green-600" : "text-red-600"}>
                {q.correctAnswer} {answers[index] !== q.correctAnswer && `(Your answer: ${answers[index] || "None"})`}
              </span>
            </p>
          )}
        </div>
      ))}
      {!submitted ? (
        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600">
          Submit Exam
        </button>
      ) : (
        <div className="mt-4">
          <p className="text-lg font-bold">Score: {score.fraction} ({score.percentage}%)</p>
          <button onClick={handleReset} className="bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600">
            Reset Exam
          </button>
        </div>
      )}
    </div>
  );
}

/*
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Exam() {
  const { courseId, examId } = useParams(); // Get course and exam IDs from URL
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({}); // Track user answers
  const [submitted, setSubmitted] = useState(false); // Track submission state
  const [score, setScore] = useState({ fraction: "0/0", percentage: 0 }); // Track score

  // Fetch exam data on mount
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/exams/${courseId}`);
        const selectedExam = data.find(e => e.id === parseInt(examId));
        if (selectedExam) {
          // Shuffle questions and options for freshness
          const shuffledQuestions = shuffleArray(selectedExam.questions.questions.map(q => ({
            ...q,
            options: shuffleArray(q.options)
          })));
          setExam({ ...selectedExam, questions: { questions: shuffledQuestions } });
        }
      } catch (error) {
        console.log("Fetch exam error:", error.response?.data || error.message); // Log errors
      }
    };
    fetchExam();
  }, [courseId, examId]);

  // Shuffle array helper (Fisher-Yates)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Handle answer selection
  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  // Submit exam
  const handleSubmit = () => {
    if (!exam) return;
    let correct = 0;
    const total = exam.questions.questions.length;
    exam.questions.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correct++;
    });
    const fraction = `${correct}/${total}`;
    const percentage = Math.round((correct / total) * 100);
    setScore({ fraction, percentage });
    setSubmitted(true);
  };

  // Reset exam (reshuffle)
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore({ fraction: "0/0", percentage: 0 });
    if (exam) {
      const shuffledQuestions = shuffleArray(exam.questions.questions.map(q => ({
        ...q,
        options: shuffleArray(q.options)
      })));
      setExam(prev => ({ ...prev, questions: { questions: shuffledQuestions } }));
    }
  };

  if (!exam) return <div className="p-4">Loading exam...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{exam.name} for {courseId}</h1>
      {exam.questions.questions.map((q, index) => (
        <div key={index} className="border p-4 mb-4 rounded shadow">
          <p className="text-lg font-semibold">{q.question}</p>
          {q.options.map((option, i) => (
            <label key={i} className="block mt-2">
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                checked={answers[index] === option}
                onChange={() => handleAnswerChange(index, option)}
                disabled={submitted}
                className="mr-2"
              />
              {option}
            </label>
          ))}
          {submitted && (
            <p className="mt-2 text-sm">
              Correct Answer: <span className={answers[index] === q.correctAnswer ? "text-green-600" : "text-red-600"}>
                {q.correctAnswer} {answers[index] !== q.correctAnswer && `(Your answer: ${answers[index] || "None"})`}
              </span>
            </p>
          )}
        </div>
      ))}
      {!submitted ? (
        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded mt-4">Submit Exam</button>
      ) : (
        <div className="mt-4">
          <p className="text-lg font-bold">Score: {score.fraction} ({score.percentage}%)</p>
          <button onClick={handleReset} className="bg-gray-500 text-white p-2 rounded mt-2">Reset Exam</button>
        </div>
      )}
    </div>
  );
}

*/