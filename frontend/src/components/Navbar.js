
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <Link to="/" className="mr-4">Login</Link>
      <Link to="/courses">Courses</Link>
      {/* Admin link hidden but accessible */}
    </nav>
  );
}
