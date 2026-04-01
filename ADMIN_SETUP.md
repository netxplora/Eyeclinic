# Admin Setup Guide

Welcome to Satome Eye Clinic Admin Dashboard! Follow these steps to set up your first administrator account.

## 🚀 Quick Start

### Step 1: Create Your First Admin Account

1. **Navigate to the setup page:**
   - Visit: `https://your-domain.com/admin/setup` (or `http://localhost:8080/admin/setup` locally)

2. **Fill in the form:**
   - **Full Name**: Your full name (e.g., "Dr. Satome")
   - **Email**: Your administrator email (e.g., "admin@satomeeyeclinic.com")
   - **Password**: Create a strong password (minimum 8 characters)

3. **Click "Create Administrator Account"**

4. **Assign Admin Role Manually (IMPORTANT)**: 
Because Edge Functions are not deployed in your remote Supabase instance, you must assign the admin role manually in your Supabase Dashboard:
   - Go to your Supabase project dashboard at [supabase.com](https://supabase.com).
   - Navigate to the **SQL Editor** on the left menu.
   - Paste and Run the following SQL block (replace the email with the one you just used):
   ```sql
   -- 1. Confirm your email address automatically
   UPDATE auth.users
   SET email_confirmed_at = now()
   WHERE email = 'your-email@example.com';

   -- 2. Assign the 'admin' role to your account
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```

### Step 2: Login to Admin Dashboard

1. Visit: `https://your-domain.com/admin/login` (or `/admin/login` locally)
2. Enter your email and password
3. Click "Sign In"

---

## 🔒 Security Features

- **One-Time Setup**: The setup function only works once. After the first admin is created, it cannot be used again.
- **Strong Passwords**: Passwords must be at least 8 characters long
- **Role-Based Access**: Three role types are supported:
  - **Admin**: Full access to all features including staff management
  - **Doctor**: Access to patient records and medical notes
  - **Receptionist**: Access to bookings and basic patient information

---

## 👥 Adding Additional Staff

Once logged in as an admin:

1. Navigate to **Staff Management** from the dashboard
2. Click "Create Staff Account"
3. Fill in the staff member's details:
   - Full Name
   - Email Address
   - Password (must meet security requirements)
   - Role (admin, doctor, or receptionist)
4. Click "Create Staff Account"

---

## 📋 Admin Dashboard Features

### Available Now:
- ✅ **Dashboard Overview**: View today's appointments, pending bookings, and key metrics
- ✅ **Booking Management**: View, filter, and manage all patient bookings
- ✅ **Patient Records**: Access patient information and visit history
- ✅ **Analytics**: View appointment statistics and popular services
- ✅ **Staff Management** (Admin only): Create and manage staff accounts
- ✅ **Realtime Updates**: Live notifications for new bookings

### Coming Soon:
- 🔜 **Password Reset**: Change password functionality
- 🔜 **Email Notifications**: Configure notification preferences
- 🔜 **Export Reports**: Download CSV/PDF reports
- 🔜 **Revenue Tracking**: Payment and billing management
- 🔜 **Advanced Analytics**: Detailed performance metrics and trends

---

## 🛠️ Technical Details

### Edge Functions
The setup uses a secure edge function (`setup-first-admin`) that:
- Validates input data
- Creates a user account via Supabase Auth
- Assigns the admin role
- Only works once (prevents multiple admin creation via this endpoint)

### Database Structure
- **user_roles**: Stores role assignments (admin, doctor, receptionist)
- **profiles**: User profile information
- **bookings**: Patient appointment bookings
- **patients**: Patient records and medical notes
- **visit_history**: Patient visit logs

---

## 🆘 Troubleshooting

### "Setup already completed" Error
- This means an admin account already exists
- Use the login page instead: `/admin/login`
- Contact existing admin to create additional staff accounts

### Can't Login After Setup
- Verify your email and password are correct
- Check that email confirmation is enabled in your auth settings
- Try resetting your password (coming soon)

### Forgot Admin Password
- Currently, password reset must be done via Supabase dashboard
- In Settings → Authentication → Users, find the user and reset password
- Password reset feature coming soon to the admin dashboard

---

## 📧 Support

For technical support or questions:
- Email: info@satomeeyeclinic.com
- Phone: +234 805 907 0153

---

## 🔐 Security Best Practices

1. **Use Strong Passwords**: 
   - Minimum 8 characters
   - Include uppercase, lowercase, numbers, and special characters

2. **Limit Admin Access**: 
   - Only create admin accounts for trusted personnel
   - Use doctor/receptionist roles for staff who don't need full access

3. **Regular Audits**: 
   - Review staff accounts periodically
   - Remove inactive accounts

4. **Secure Your Environment**:
   - Always use HTTPS
   - Keep your browser updated
   - Don't share login credentials
   - Log out after each session

---

## 📝 Next Steps

After setting up your admin account:

1. ✅ Create additional staff accounts (if needed)
2. ✅ Explore the booking management system
3. ✅ Set up patient records
4. ✅ Configure notification preferences (coming soon)
5. ✅ Review analytics and reports

---

**Last Updated**: March 2026  
**Version**: 1.1.0

