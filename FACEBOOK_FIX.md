# Facebook OAuth Fix - "Invalid Scopes: email" Error

## Problem
Getting error: "Invalid Scopes: email" when clicking "Continue with Facebook"

## Solution

### Step 1: Go to Facebook App Dashboard
1. Visit: https://developers.facebook.com/apps/
2. Select your app (ID: `824952160152754`)

---

### Step 2: Add Facebook Login Product (if not added)

1. In left sidebar, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** platform
4. Site URL: `https://axliner.com`
5. Click **Save** and **Continue**

---

### Step 3: Configure Facebook Login Settings

1. In left sidebar, go to **Facebook Login** → **Settings**

2. **Valid OAuth Redirect URIs** - Add these:
```
https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback
https://axliner.com/auth/callback
https://www.axliner.com/auth/callback
```

3. **Client OAuth Settings:**
   - ✅ **Client OAuth Login**: ON
   - ✅ **Web OAuth Login**: ON
   - ✅ **Enforce HTTPS**: ON
   - ✅ **Use Strict Mode for Redirect URIs**: ON

4. Click **Save Changes**

---

### Step 4: Configure App Settings

1. Go to **Settings** → **Basic** (left sidebar)

2. Fill in required fields:
   - **App Name**: `AxLiner`
   - **App Contact Email**: `axliner.excel@gmail.com`
   
3. **App Domains** - Add:
```
axliner.com
iawkqvdtktnvxqgpupvt.supabase.co
```

4. **Privacy Policy URL**: `https://axliner.com/privacy-policy`
5. **Terms of Service URL**: `https://axliner.com/terms-of-service`
6. **Site URL**: `https://axliner.com`

7. **App Icon**: Upload your logo (1024x1024 recommended)

8. Click **Save Changes**

---

### Step 5: Add Test Users (IMPORTANT!)

Since your app is in Development mode, you need to add test users:

1. Go to **Roles** → **Test Users** (left sidebar)
2. Click **Add Test Users**
3. Add yourself and any other testers
4. OR add yourself as a **Developer/Admin**:
   - Go to **Roles** → **Roles**
   - Click **Add Developers**
   - Add your Facebook account

**Alternative:** Add your account to **Roles** → **Roles** → **Administrators**

---

### Step 6: Configure Permissions (Business Verification)

**Option A: Use App in Development Mode (Recommended for Testing)**

1. Keep app in **Development** mode
2. Make sure you're added as **Admin**, **Developer**, or **Tester** (Step 5)
3. The `email` permission works automatically for test users

**Option B: Publish Your App (For Production)**

If you want any user to sign in:

1. Go to **Settings** → **Basic**
2. Scroll down to **App Mode**
3. Click the toggle to switch from **Development** to **Live**

**IMPORTANT:** Before publishing:
- You MUST have a Privacy Policy URL
- You MUST have Terms of Service URL
- App icon is uploaded
- All required fields are filled

For `email` permission, it's automatically approved for most apps. If not:

1. Go to **App Review** → **Permissions and Features**
2. Check if `email` and `public_profile` are approved (they usually are by default)
3. If not approved, click **Request** and follow the review process

---

### Step 7: Update Supabase Configuration

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Providers** → **Facebook**
4. Update credentials:
   - **Facebook Client ID**: `824952160152754`
   - **Facebook Client Secret**: (get from Facebook App → Settings → Basic → App Secret)
5. Click **Save**

---

### Step 8: Get Facebook App Secret

1. In Facebook App Dashboard, go to **Settings** → **Basic**
2. Find **App Secret**
3. Click **Show** (you'll need to enter your Facebook password)
4. Copy the secret
5. Paste it into Supabase Dashboard (Step 7)

---

## Quick Testing Steps

### For Development Mode:

1. Make sure you're added as Admin/Developer/Tester in Facebook App
2. Go to `https://axliner.com`
3. Click "Sign In"
4. Click "Continue with Facebook"
5. It should work now!

### If Still Not Working:

1. **Clear browser cache and cookies**
2. **Try incognito/private browsing mode**
3. **Check Facebook App is in correct mode**:
   - Development: Only works for test users/developers/admins
   - Live: Works for everyone

---

## Common Issues & Solutions

### Issue 1: "This content isn't available right now"
**Solution:** Make sure you're added as a test user, developer, or admin in the Facebook App (Step 5)

### Issue 2: "App Not Set Up"
**Solution:** 
- Complete Facebook Login setup (Step 3)
- Add valid OAuth redirect URIs

### Issue 3: "Invalid OAuth Redirect URI"
**Solution:** Double-check the redirect URIs in Facebook Login Settings match exactly:
```
https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback
```

### Issue 4: "Can't Load URL"
**Solution:**
- Add `axliner.com` to App Domains in Settings → Basic
- Add Site URL: `https://axliner.com`

### Issue 5: Still getting "Invalid Scopes: email"
**Solution:**
1. Switch app to **Live mode** (if you want public access)
2. OR make sure you're logged into Facebook with an account that's added as Admin/Developer/Tester

---

## Production Checklist

Before making your app public:

- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] App icon uploaded
- [ ] App Domains configured
- [ ] Valid OAuth Redirect URIs added
- [ ] App reviewed and approved (if required)
- [ ] Switch from Development to Live mode

---

## Facebook App Configuration Summary

**App ID:** `824952160152754`

**Valid OAuth Redirect URIs:**
```
https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback
https://axliner.com/auth/callback
https://www.axliner.com/auth/callback
```

**App Domains:**
```
axliner.com
iawkqvdtktnvxqgpupvt.supabase.co
```

**Required URLs:**
- Privacy Policy: `https://axliner.com/privacy-policy`
- Terms of Service: `https://axliner.com/terms-of-service`
- Site URL: `https://axliner.com`

---

## Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)
- [Supabase Facebook Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-facebook)

---

**Last Updated:** November 2025
