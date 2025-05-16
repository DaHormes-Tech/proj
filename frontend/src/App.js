
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Admin from "./pages/Admin";
import Exam from "./pages/Exam";
import CourseDetails from "./pages/CourseDetails"; // New component
import Navbar from "./components/Navbar";

//Added for Auth
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, Component } from 'react';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  } 

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page or contact support.</h1>;
    }
    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

// Main application component, routing all pages with React Router
export default function App() {

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} /> {/* Default login route */}
            
            {/* Protected Route */}
            <Route element={<ProtectedRoute />}>
              <Route path="/courses" element={<Courses />} /> {/* Courses list for users */}
              <Route path="/courses/:courseId" element={<CourseDetails />} /> {/* New route for course details */}
              <Route path="/courses/:courseId/exam/:examId" element={<Exam />} /> {/* Dynamic exam route for CBT */}
              <Route path="/admin/*" element={<Admin />} /> {/* Wildcard for admin sub-routes (courses, exams) */}
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}


/*
      <Routes>
        <Route path="/" element={<Login />} /> {/* Default login route *}
        <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>>} /> {/* Courses list for users *}
        <Route path="/courses/:courseId" element={<PrivateRoute><CourseDetails /></PrivateRoute>} /> {/* New route for course details *}
        <Route path="/courses/:courseId/exam/:examId" element={<PrivateRoute><Exam /></PrivateRoute>} /> {/* Dynamic exam route for CBT *}
        <Route path="/admin/*" element={<PrivateRoute><Admin /></PrivateRoute>} /> {/* Wildcard for admin sub-routes (courses, exams) *}
      </Routes>

*/

/*


  // User Auth Start
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = supabase.auth.session();
    setSession(currentSession);

    if (!currentSession) {
      navigate('/login'); // redirect to login page if not authenticated
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) navigate('/login');
      }
    );

    setLoading(false);

    return () => {
      authListener.unsubscribe();
    };
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  // User Auth End

*/