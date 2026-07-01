const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oodqutwsljhvuyotuthu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZHF1dHdzbGpodnV5b3R1dGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk3MDYsImV4cCI6MjA5NzEwNTcwNn0.XgxUO7bUC24GFziKvZCawVgUKRjxC7OGzSdu1aN3xL0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  // Try querying supabase.from('orders') or checking schemas
  // Sign in first
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'student@edodwaja.com',
    password: 'password',
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  console.log('Signed in successfully as:', authData.user.email);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Profiles error:', error);
  } else if (data && data.length > 0) {
    console.log('Profile columns:', Object.keys(data[0]));
    console.log('Profile data:', data[0]);
  } else {
    console.log('No profiles found.');
  }
}

test();
