
// Supabase client configuration for backend, using environment variables for security
const { createClient } = require("@supabase/supabase-js");

// Load environment variables from .env file
require("dotenv").config();

// Initialize Supabase client with URL and Key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key must be provided in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

module.exports = { supabase };
