const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oodqutwsljhvuyotuthu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZHF1dHdzbGpodnV5b3R1dGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk3MDYsImV4cCI6MjA5NzEwNTcwNn0.XgxUO7bUC24GFziKvZCawVgUKRjxC7OGzSdu1aN3xL0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const emails = ['student@edodwaja.com', 'student@makersflow.com'];
const passwords = ['password', 'Password123', 'password123', 'student', '12345678', 'makersflow', 'makersflow123', 'Edodwaja', 'edodwaja123'];

async function test() {
  for (const email of emails) {
    for (const password of passwords) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        console.log(`SUCCESS! email: ${email}, password: ${password}`);
        console.log('User ID:', data.user.id);
        return;
      }
    }
  }
  console.log('All attempts failed.');
}

test();