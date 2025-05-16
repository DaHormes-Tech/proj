
import axios from "axios";

//Added for User Auth
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  //headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});


//Added for User Auth
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching Supabase session:', error);
      return config; // Proceed without token if session fetch fails
    }
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log('Added Authorization header with token:', session.access_token);
    } else {
      console.warn('No access token found in session');
    }
  } catch (error) {
    console.error('Failed to fetch Supabase session:', error);
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});


/*
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});*/

export default api;

