const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oodqutwsljhvuyotuthu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZHF1dHdzbGpodnV5b3R1dGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk3MDYsImV4cCI6MjA5NzEwNTcwNn0.XgxUO7bUC24GFziKvZCawVgUKRjxC7OGzSdu1aN3xL0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = `diag-test-${Date.now()}@makersflow.com`;
  console.log('Signing up:', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: 'password',
    options: {
      data: { name: 'Diagnostic Test User' }
    }
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError);
    return;
  }

  console.log('Sign up success! User:', signUpData.user?.email, 'Confirmed:', signUpData.user?.email_confirmed_at);
}

test();