
import { useState, useEffect, useContext } from "react";
//import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../context/AuthContext';


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/courses');
    }
  }, [user, navigate]);


  const loginUser = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      //localStorage.setItem("token", response.data.token); // response.
      alert("Login Successful");
      if (error) throw error;
      // Navigation is handled by AuthContext
    } catch (error) {
      setError(error.message || 'Login failed, please try again');
    }  

  };

    /*
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", response.data.token); // response.
      alert("Login Successful");
      window.location.href = "/courses";
    } catch (error) {
      const msg = error.response?.data?.error || "Login failed, please try again";
      setError(msg);
    }
    */
  
  
  const registerUser = async () => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      alert("Registration Successful");
      if (error) throw error;
      // Navigation is handled by AuthContext
    } catch (error) {
      setError(error.message || 'Registration failed');
    }
  };

  /*
  const registerUser = async () => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, { email, password });
      localStorage.setItem("token", data.token);
      alert("Registration Successful");
      window.location.href = "/courses";
    } catch (error) {
      const msg = error.response?.data?.error || "Registration Failed";
      setError(msg);
    }
  };
*/


  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login / Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input className="border p-2 m-2 w-full rounded" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 m-2 w-full rounded" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 m-2 w-full rounded" onClick={loginUser}>Login</button>
      <button className="bg-green-500 text-white p-2 m-2 w-full rounded" onClick={registerUser}>Register</button>
    </div>
  );
}

/*
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", data.token);
      window.location.href = "/courses";
    } catch (error) {
      alert("Login Failed");
    }
  };

  return (
    <div className="p-4">
      <input className="border p-2 m-2" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 m-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2" onClick={loginUser}>Login</button>
    </div>
  );
}

*/