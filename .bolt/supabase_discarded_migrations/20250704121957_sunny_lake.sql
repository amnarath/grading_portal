/*
  # Create admin user safely

  1. Changes
    - Create admin user with email 'admin' and password '123qweasd'
    - Handle existing users properly
    - Use proper conflict resolution for public.users table

  2. Security
    - Set admin role in both auth.users metadata and public.users table
    - Ensure email is confirmed
*/

-- Create admin user
DO $$
DECLARE
  admin_user_id uuid;
  user_exists boolean := false;
BEGIN
  -- Check if admin user already exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin') INTO user_exists;
  
  -- Only create auth user if doesn't exist
  IF NOT user_exists THEN
    -- Generate a new UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert admin user into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin',
      crypt('123qweasd', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"role": "admin"}'::jsonb,
      false,
      'authenticated'
    );
  ELSE
    -- Get existing user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin';
    
    -- Update existing user's metadata to ensure admin role
    UPDATE auth.users 
    SET raw_user_meta_data = '{"role": "admin"}'::jsonb,
        updated_at = now()
    WHERE id = admin_user_id;
  END IF;

  -- Insert or update public.users table (this table has proper unique constraints)
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (admin_user_id, 'admin', 'admin', now(), now())
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = now();
    
END $$;