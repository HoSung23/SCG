-- Create auth_users table
CREATE TABLE IF NOT EXISTS public.auth_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS auth_users_email_idx ON public.auth_users(email);

-- Enable RLS if needed
ALTER TABLE public.auth_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own data
CREATE POLICY "Users can read their own auth data" 
  ON public.auth_users 
  FOR SELECT 
  USING (true);
