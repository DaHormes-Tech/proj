// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';


//const supabaseUrl = 'https://vgdrntzfxwrfmgzvmhtk.supabase.co'; // Replace with your URL
//const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZHJudHpmeHdyZm1nenZtaHRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTgwNTIyNCwiZXhwIjoyMDU1MzgxMjI0fQ.S_rBhvLBO3zB7Nn9vACPVvIFb7Z2U1PaMt8ZxF6PUQw'; // Replace with your anon key

//const supabaseUrl = process.env.SUPABASE_URL;
//const supabaseKey = process.env.SUPABASE_KEY;

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

//console.log('Supabase URL:', supabaseUrl);
//console.log('Supabase Key:', supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
