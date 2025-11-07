# OAuth Setup Guide - GitHub & Facebook Authentication

This guide will walk you through setting up GitHub and Facebook OAuth authentication for your AxLiner application.

## Prerequisites

- A Supabase project (already configured)
- GitHub account
- Facebook account
- Access to your Supabase Dashboard

---

## 1. GitHub OAuth Setup

### Step 1: Create a GitHub OAuth App

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Or navigate: GitHub → Settings → Developer settings → OAuth Apps

2. **Click "New OAuth App"**

3. **Fill in the Application Details**
   - **Application name**: `AxLiner` (or your preferred name)
   - **Homepage URL**: `https://frontend-six-rho-53.vercel.app` (your production URL)
   - **Application description**: `AxLiner - Convert screenshots to Excel files` (optional)
   - **Authorization callback URL**: `https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback`
     - Replace `iawkqvdtktnvxqgpupvt` with your Supabase project reference ID
     - Format: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

4. **Click "Register application"**

5. **Save Your Credentials**
   - Copy the **Client ID**
   - Click "Generate a new client secret"
   - Copy the **Client Secret** (save it immediately, it won't be shown again)

### Step 2: Configure GitHub in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers**
   - Find **GitHub** in the list

3. **Enable GitHub Provider**
   - Toggle **Enable GitHub provider** to ON
   - Paste your **GitHub Client ID**
   - Paste your **GitHub Client Secret**
   - Click **Save**

### Step 3: Add Environment Variables

Add to your `.env.local` file (frontend):
```env
# GitHub OAuth is automatically handled by Supabase
# No additional frontend environment variables needed
```

---

## 2. Facebook OAuth Setup

### Step 1: Create a Facebook App

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com
   - Click **My Apps** in the top right
   - Click **Create App**

2. **Select App Type**
   - Choose **Consumer** (for user authentication)
   - Click **Next**

3. **Configure App Details**
   - **App name**: `AxLiner`
   - **App contact email**: Your email address
   - Click **Create App**

4. **Verify Your Identity**
   - Complete the security check (password or 2FA)

### Step 2: Set Up Facebook Login

1. **Add Facebook Login Product**
   - In your app dashboard, find **Facebook Login**
   - Click **Set Up**
   - Choose **Web** as your platform
   - Enter your site URL: `https://frontend-six-rho-53.vercel.app`
   - Click **Save** and **Continue**

2. **Configure OAuth Settings**
   - Go to **Facebook Login** → **Settings** in the left sidebar
   - Under **Valid OAuth Redirect URIs**, add:
     ```
     https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback
     ```
     - Replace `iawkqvdtktnvxqgpupvt` with your Supabase project reference ID
   - Click **Save Changes**

3. **Get Your App Credentials**
   - Go to **Settings** → **Basic** in the left sidebar
   - Copy your **App ID**
   - Click **Show** next to **App Secret** and copy it
   - Save these credentials securely

### Step 3: Configure Facebook Login Settings

1. **Make Your App Public** (Important!)
   - By default, Facebook apps are in Development mode
   - Go to **Settings** → **Basic**
   - Add a **Privacy Policy URL**: `https://frontend-six-rho-53.vercel.app/privacy-policy`
   - Add a **Terms of Service URL**: `https://frontend-six-rho-53.vercel.app/terms-of-service`
   - Switch the toggle at the top from **Development** to **Live**
   - Note: You may need to complete App Review for certain permissions

2. **Configure Advanced Settings** (Optional)
   - Go to **Settings** → **Advanced**
   - Under **Security**, verify **Require App Secret** is enabled
   - Under **Client OAuth Settings**, verify:
     - ✅ Client OAuth Login is ON
     - ✅ Web OAuth Login is ON
     - ✅ Enforce HTTPS is ON

### Step 4: Configure Facebook in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers**
   - Find **Facebook** in the list

3. **Enable Facebook Provider**
   - Toggle **Enable Facebook provider** to ON
   - Paste your **Facebook App ID** (in Client ID field)
   - Paste your **Facebook App Secret** (in Client Secret field)
   - Click **Save**

---

## 3. Update Environment Variables

### Frontend (.env.local)

```env
# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://iawkqvdtktnvxqgpupvt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API Configuration (already configured)
NEXT_PUBLIC_API_URL=https://backend-lively-hill-7043.fly.dev
NEXT_PUBLIC_WS_URL=wss://backend-lively-hill-7043.fly.dev

# OAuth Providers (handled automatically by Supabase)
# GitHub and Facebook OAuth credentials are stored in Supabase Dashboard
# No additional environment variables needed for OAuth providers
```

### Supabase Dashboard Environment Variables

These are configured in Supabase Dashboard → Authentication → Providers:

**GitHub:**
- Client ID: `your-github-client-id`
- Client Secret: `your-github-client-secret`

**Facebook:**
- Client ID: `your-facebook-app-id`
- Client Secret: `your-facebook-app-secret`

---

## 4. Testing OAuth Authentication

### Local Testing

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test Each Provider**
   - Navigate to your landing page
   - Click "Sign In"
   - Try each OAuth button:
     - ✅ Continue with Google
     - ✅ Continue with GitHub
     - ✅ Continue with Facebook

3. **Verify Redirect Flow**
   - Ensure you're redirected to the provider's login page
   - After authentication, verify you're redirected to `/dashboard/client`
   - Check that user session is created in Supabase

### Production Testing

1. **Deploy to Vercel**
   ```bash
   git push origin main
   ```

2. **Update OAuth Redirect URLs**
   - For GitHub: Update the callback URL to your production domain
   - For Facebook: Add your production domain to Valid OAuth Redirect URIs

3. **Test on Production**
   - Visit your production site
   - Test all three OAuth providers
   - Verify successful authentication

---

## 5. Troubleshooting

### Common Issues

#### GitHub OAuth Issues

**Error: "The redirect_uri MUST match the registered callback URL"**
- Solution: Verify the callback URL in GitHub OAuth settings matches exactly:
  ```
  https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
  ```

**Error: "Bad credentials"**
- Solution: Regenerate GitHub Client Secret and update in Supabase Dashboard

#### Facebook OAuth Issues

**Error: "Can't Load URL: The domain of this URL isn't included in the app's domains"**
- Solution: 
  1. Go to Facebook App → Settings → Basic
  2. Add your domain to **App Domains**: `frontend-six-rho-53.vercel.app`
  3. Add your site URL to **Site URL**

**Error: "App Not Set Up: This app is still in development mode"**
- Solution: Switch your Facebook app to Live mode (see Step 3 above)

**Error: "Invalid OAuth Redirect URI"**
- Solution: Add the Supabase callback URL to Facebook Login Settings → Valid OAuth Redirect URIs

#### General OAuth Issues

**Users can't sign in after deployment**
- Verify environment variables are set in Vercel
- Check Supabase Dashboard → Authentication → Users for error logs
- Ensure OAuth providers are enabled in Supabase Dashboard

**Redirect loop after authentication**
- Check that `redirectTo` URL is correct in `GoogleSignInModal.tsx`
- Verify `/auth/callback` route exists and is properly configured

---

## 6. Security Best Practices

1. **Never commit secrets to Git**
   - All OAuth secrets should be in Supabase Dashboard
   - Use `.env.local` for local development (already in .gitignore)

2. **Use HTTPS in production**
   - Both Vercel and Supabase use HTTPS by default
   - Never use HTTP for OAuth redirects

3. **Regularly rotate secrets**
   - Periodically regenerate OAuth client secrets
   - Update them in Supabase Dashboard

4. **Monitor failed login attempts**
   - Check Supabase Dashboard → Authentication → Logs
   - Set up alerts for suspicious activity

5. **Review OAuth scopes**
   - Only request necessary permissions
   - GitHub: email, profile (default)
   - Facebook: email, public_profile (default)

---

## 7. Additional Resources

### GitHub OAuth
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Supabase GitHub OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-github)

### Facebook OAuth
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [Supabase Facebook OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-facebook)

### Supabase Authentication
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth with Supabase](https://supabase.com/docs/guides/auth/social-login)

---

## Need Help?

If you encounter any issues not covered in this guide:

1. Check Supabase Dashboard logs: Authentication → Logs
2. Check browser console for error messages
3. Review Supabase documentation for your specific provider
4. Contact support: axliner.excel@gmail.com

---

**Last Updated**: November 2025
