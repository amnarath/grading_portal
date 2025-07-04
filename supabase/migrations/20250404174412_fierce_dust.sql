/*
  # Fix user management and verification function
  
  1. Changes
    - Update is_admin function without dropping
    - Update RLS policies for users table
    - Fix get_users_with_verification function
    
  2. Security
    - Maintain proper access control
    - Keep security context
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_and_admin_all" ON users;
DROP POLICY IF EXISTS "users_insert_admin_only" ON users;
DROP POLICY IF EXISTS "users_update_admin_only" ON users;

-- Drop existing verification function
DROP FUNCTION IF EXISTS get_users_with_verification();

-- Update admin check function without dropping it
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.id = auth.uid()
    AND (au.raw_user_meta_data->>'role')::text = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies for users table
CREATE POLICY "users_view_own_and_admin_all" ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR is_admin()
  );

CREATE POLICY "users_insert_admin_only" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "users_update_admin_only" ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create get_users_with_verification function with new return type
CREATE FUNCTION get_users_with_verification()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  created_at timestamptz,
  email_confirmed_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.role,
    u.created_at,
    au.email_confirmed_at
  FROM users u
  LEFT JOIN auth.users au ON au.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_users_with_verification() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;