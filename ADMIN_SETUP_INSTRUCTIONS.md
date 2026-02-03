# Admin Setup Instructions

## Problem
The error "permission denied for table users" occurs because RLS policies cannot directly query `auth.users` table - it requires `service_role` permissions.

## Solution
We've created an `is_admin` flag in the `profiles` table and a security definer function to check admin status.

## Steps to Fix

### 1. Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor in order:

1. **script 016**: `scripts/016_fix_admin_permissions_properly.sql`
   - Adds `is_admin` column to profiles
   - Creates `is_admin()` function
   - Updates all RLS policies

2. **script 017**: `scripts/017_set_admin_user.sql`
   - Sets admin flag for leonardo@oliport.com.br
   - Verifies admin was set correctly

### 2. Verify Admin Status

Run this query in Supabase SQL Editor:

```sql
SELECT 
  p.id,
  p.full_name,
  p.is_admin,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'leonardo@oliport.com.br';
```

You should see `is_admin: true` for your admin user.

### 3. Test Admin Functions

Try adding a product from `/admin/dashboard/products` - it should now work without permission errors.

## How It Works

- The `is_admin()` function uses `SECURITY DEFINER` which allows it to check the profiles table
- RLS policies call this function instead of directly querying `auth.users`
- Admin users have full access to products and service_providers tables
- Regular users can only view active items or manage their own items

## Adding More Admins

To add another admin user:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'new-admin@example.com'
);
```

## Troubleshooting

If you still get permission errors:

1. Make sure the user has a profile in the `profiles` table
2. Verify `is_admin` is set to `true`
3. Check that the user is logged in
4. Clear browser cache and re-login
