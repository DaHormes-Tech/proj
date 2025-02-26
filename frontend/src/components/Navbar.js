
import { Link } from "react-router-dom";

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div>
        <Link to="/" className="mr-4 hover:text-gray-300">Login</Link>
        <Link to="/courses" className="mr-4 hover:text-gray-300">Courses</Link>
      </div>
      {localStorage.getItem("token") && (
        <button onClick={handleLogout} className="bg-red-500 p-2 rounded hover:bg-red-600">Logout</button>
      )}
    </nav>
  );
}

/*
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <Link to="/" className="mr-4">Login</Link>
      <Link to="/courses">Courses</Link>
      {/* Admin link hidden but accessible /*}
    </nav>
  );
}
*/