# Admin Setup & Test Credentials

## Creating Test User Accounts

Since the platform uses Supabase Auth, you need to create user accounts first. Here's how:

### Option 1: Create via Sign-Up Form (Recommended for Testing)

1. Go to `/auth/sign-up`
2. Sign up with email and password
3. Confirm your email (check your email inbox or Supabase dashboard for confirmation link)
4. Once confirmed, you'll have a user account

### Option 2: Create via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Users**
3. Click **Add user**
4. Enter email and password
5. The account will be created immediately

---

## Making a User Admin

After creating a user account, you need to set their `role` to `admin` in the user metadata:

### Via Supabase SQL (Recommended)

Run this SQL in the Supabase SQL Editor:

```sql
-- Replace 'user@example.com' with actual email
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'admin@example.com';
```

### Via Supabase Dashboard

1. Go to **Authentication → Users**
2. Find the user you want to make admin
3. Click on the user row
4. Scroll to **User Metadata**
5. Add or update the metadata:
```json
{
  "role": "admin"
}
```
6. Click **Update**

---

## Test Credentials

### Default Test Admin Account

After setup, use these credentials:

| Field | Value |
|-------|-------|
| **Email** | admin@birdies4good.test |
| **Password** | Test@123456 |
| **Role** | admin |

To create this account:

1. Sign up at `/auth/sign-up` with these credentials
2. Confirm the email
3. Run the SQL above with email: `admin@birdies4good.test`

---

## Test Regular User Account

| Field | Value |
|-------|-------|
| **Email** | player@birdies4good.test |
| **Password** | Test@123456 |
| **Role** | user |

---

## Accessing Admin Dashboard

Once logged in as an admin:

1. Navigate to `/admin`
2. You should see the admin dashboard with sections for:
   - **Users**: View and manage user accounts
   - **Draws**: Create draws, run simulations, execute draws
   - **Charities**: Manage charity partners
   - **Winners**: Approve/reject winner claims

---

## Testing Flows

### Test Admin Features

1. **Log in as admin** with admin credentials
2. Go to `/admin/draws`
3. Click "Run Simulation" for current month draw
4. See the prize pool breakdown:
   - 40% to 5-match winners
   - 35% to 4-match winners
   - 25% to 3-match winners
5. Click "Execute Draw" to complete the draw

### Test User Features

1. **Log in as regular user** with player credentials
2. Go to `/dashboard`
3. **Add a score** at `/dashboard/scores/new`
   - Enter score 1-45
   - Add 5 scores to test rolling average
   - Add 6th score to see oldest score roll out
4. **Select charity** at `/dashboard/charity`
   - Try setting contribution below 10% (should fail)
   - Set contribution to 10%+ (should succeed)
5. **View draws** at `/dashboard/draws`
   - See current/past draw details
   - Check if you're eligible to enter

### Test Subscriptions

1. Go to `/pricing`
2. Click "Subscribe" on any plan
3. Use Stripe test card: **4242 4242 4242 4242**
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
4. Subscription should be created in your account

---

## Database Verification

To verify users were created correctly:

```sql
-- Check all users
SELECT id, email, raw_user_meta_data FROM auth.users;

-- Check user role
SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users;

-- Check user profile
SELECT id, created_at, active_subscription_id FROM public.profiles;
```

---

## Troubleshooting

**Q: I can't access the admin dashboard**
- Make sure your user has `role: admin` in metadata
- Log out and log back in (metadata changes take effect after re-login)
- Check middleware.ts is protecting routes correctly

**Q: Score entry isn't working**
- Make sure you're logged in
- Scores must be 1-45
- Check console for errors

**Q: Draw simulation shows no data**
- Ensure test data was seeded (scripts/002_seed_test_data.sql)
- Check that charity data exists

**Q: Charity selection requires 10% minimum**
- This is by design - minimum contribution is 10%
- Use slider to set 10% or higher

---

## Reset Everything

To start fresh, delete test users and recreate:

```sql
-- Delete all test users
DELETE FROM auth.users WHERE email LIKE '%@birdies4good.test%';

-- Then recreate via sign-up form or Supabase dashboard
```
