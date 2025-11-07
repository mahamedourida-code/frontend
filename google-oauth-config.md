# Google OAuth Configuration for axliner.com

## Google Cloud Console Settings

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/apis/credentials
- Select your project or create a new one

### 2. OAuth Consent Screen Configuration

**Go to: APIs & Services → OAuth consent screen**

**User Type:**
- Select: **External**
- Click **Create**

**App Information:**
- **App name**: `AxLiner`
- **User support email**: `axliner.excel@gmail.com`
- **App logo**: (Optional - upload your logo)

**App Domain:**
- **Application home page**: `https://axliner.com`
- **Application privacy policy link**: `https://axliner.com/privacy-policy`
- **Application terms of service link**: `https://axliner.com/terms-of-service`

**Authorized domains:**
```
axliner.com
iawkqvdtktnvxqgpupvt.supabase.co
```

**Developer contact information:**
- Email: `axliner.excel@gmail.com`

**Scopes:**
- Add these scopes:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
  - `openid`

Click **Save and Continue**

---

### 3. Create OAuth 2.0 Client ID

**Go to: APIs & Services → Credentials**

Click **+ CREATE CREDENTIALS** → **OAuth client ID**

**Application type:**
- Select: **Web application**

**Name:**
```
AxLiner Web Client
```

**Authorized JavaScript origins:**
```
https://axliner.com
https://www.axliner.com
https://iawkqvdtktnvxqgpupvt.supabase.co
```

**Authorized redirect URIs:**
```
https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback
https://axliner.com/auth/callback
https://www.axliner.com/auth/callback
```

Click **Create**

---

### 4. Copy Your Credentials

After creation, you'll see:
- **Client ID**: (example: `123456789-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`)
- **Client Secret**: (example: `GOCSPX-xxxxxxxxxxxxxxxxxxxx`)

**IMPORTANT:** Save these credentials securely!

---

### 5. Configure in Supabase Dashboard

1. Go to: https://app.supabase.com
2. Select your project
3. Navigate to: **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Toggle **Enable Google provider** to ON
6. Enter your credentials:
   - **Client ID**: (paste your Google Client ID from step 4)
   - **Client Secret**: (paste your Google Client Secret from step 4)
7. Click **Save**

---

### 6. Update Environment Variables

**Vercel Environment Variables:**

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add/Update:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Local Environment (.env.local):**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

---

### 7. Testing Checklist

**Development Testing:**
- [ ] Start local server: `npm run dev`
- [ ] Click "Sign In" on landing page
- [ ] Click "Continue with Google"
- [ ] Verify redirect to Google login
- [ ] After login, verify redirect to `/dashboard/client`
- [ ] Check user session in Supabase Dashboard → Authentication → Users

**Production Testing:**
- [ ] Deploy to Vercel: `git push origin main`
- [ ] Visit: `https://axliner.com`
- [ ] Test Google sign-in flow
- [ ] Verify successful authentication

---

### 8. Domain Verification (Optional but Recommended)

**In Google Cloud Console:**
1. Go to: **APIs & Services** → **Domain verification**
2. Click **Add domain**
3. Enter: `axliner.com`
4. Follow verification steps:
   - Add TXT record to your DNS
   - Wait for verification (can take up to 24 hours)

**DNS TXT Record:**
```
Name: @ (or root)
Type: TXT
Value: google-site-verification=XXXXXXXXXXXXX (provided by Google)
TTL: 3600
```

---

## Summary of URLs

### For Google Console

**Authorized JavaScript Origins:**
```
https://axliner.com
https://www.axliner.com
https://iawkqvdtktnvxqgpupvt.supabase.co
```

**Authorized Redirect URIs:**
```
https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback
https://axliner.com/auth/callback
https://www.axliner.com/auth/callback
```

### For Supabase Dashboard

**Provider:** Google

**Client ID:**
```
your-google-client-id-here.apps.googleusercontent.com
```

**Client Secret:**
```
your-google-client-secret-here
```

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Verify the redirect URI in Google Console exactly matches:
```
https://iawkqvdtktnvxqgpupvt.supabase.co/auth/v1/callback
```

### Error: "Access blocked: This app's request is invalid"
**Solution:** 
1. Complete OAuth consent screen configuration
2. Add `axliner.com` to Authorized domains
3. Publish your OAuth consent screen (change from Testing to Production)

### Error: "Origin not allowed"
**Solution:** Add `https://axliner.com` to Authorized JavaScript origins

### Users stuck in "Testing" mode (max 100 test users)
**Solution:**
1. Go to OAuth consent screen
2. Click **PUBLISH APP**
3. Submit for verification if needed
4. Or add users to test users list in the meantime

---

## Important Notes

1. **HTTPS Required:** OAuth only works over HTTPS in production
2. **WWW vs Non-WWW:** Add both `axliner.com` and `www.axliner.com` to be safe
3. **Propagation Time:** Changes to OAuth settings may take a few minutes to propagate
4. **Supabase Callback:** Always use Supabase callback URL, not your own domain callback
5. **Publishing Status:** Keep app in "Testing" mode during development, publish when ready for production

---

**Last Updated:** November 2025
