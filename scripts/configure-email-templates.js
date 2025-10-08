/**
 * Supabase Email Template Configuration Script
 *
 * This script updates Supabase email templates to display OTP codes.
 * Run this with: node scripts/configure-email-templates.js
 *
 * Prerequisites:
 * 1. Get your Supabase Management API token from: https://supabase.com/dashboard/account/tokens
 * 2. Set SUPABASE_ACCESS_TOKEN environment variable
 */

const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'iawkqvdtktnvxqgpupvt';
const MANAGEMENT_API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

// Read email templates
const templatesDir = path.join(__dirname, '..', 'email-templates');
const magicLinkTemplate = fs.readFileSync(path.join(templatesDir, 'magic-link.html'), 'utf8');
const confirmationTemplate = fs.readFileSync(path.join(templatesDir, 'confirmation.html'), 'utf8');
const recoveryTemplate = fs.readFileSync(path.join(templatesDir, 'recovery.html'), 'utf8');
const inviteTemplate = fs.readFileSync(path.join(templatesDir, 'invite.html'), 'utf8');
const reauthenticationTemplate = fs.readFileSync(path.join(templatesDir, 'reauthentication.html'), 'utf8');

async function updateEmailTemplates() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable not set');
    console.log('\n📝 To get your access token:');
    console.log('1. Go to https://supabase.com/dashboard/account/tokens');
    console.log('2. Generate a new token');
    console.log('3. Run: SUPABASE_ACCESS_TOKEN=your_token node scripts/configure-email-templates.js');
    process.exit(1);
  }

  const config = {
    // Magic Link template (used for sign-in OTP)
    MAILER_SUBJECTS_MAGIC_LINK: 'Your Litt Up Sign-In Code 🔐',
    MAILER_TEMPLATES_MAGIC_LINK_CONTENT: magicLinkTemplate,

    // Confirmation template (used for sign-up)
    MAILER_SUBJECTS_CONFIRMATION: 'Verify Your Email - Welcome to Litt Up! ✨',
    MAILER_TEMPLATES_CONFIRMATION_CONTENT: confirmationTemplate,

    // Recovery template (used for password reset)
    MAILER_SUBJECTS_RECOVERY: 'Reset Your Password - Litt Up 🔑',
    MAILER_TEMPLATES_RECOVERY_CONTENT: recoveryTemplate,

    // Invite template (used for team invitations)
    MAILER_SUBJECTS_INVITE: 'You\'re Invited to Join Litt Up! 🎉',
    MAILER_TEMPLATES_INVITE_CONTENT: inviteTemplate,

    // Reauthentication template (used for sensitive actions)
    MAILER_SUBJECTS_REAUTHENTICATION: 'Verify Your Identity - Litt Up 🔐',
    MAILER_TEMPLATES_REAUTHENTICATION_CONTENT: reauthenticationTemplate,
  };

  try {
    console.log('🚀 Updating Supabase email templates...\n');

    const response = await fetch(MANAGEMENT_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${error}`);
    }

    const result = await response.json();

    console.log('✅ Email templates updated successfully!\n');
    console.log('📧 Templates configured:');
    console.log('   ✓ Magic Link (Sign-In OTP)');
    console.log('   ✓ Confirmation (Sign-Up)');
    console.log('   ✓ Recovery (Password Reset)');
    console.log('   ✓ Invite (Team Invitations)');
    console.log('   ✓ Reauthentication (Sensitive Actions)\n');
    console.log('🎉 All templates now display 6-digit OTP codes!\n');
    console.log('Next steps:');
    console.log('1. Test sign-up flow at http://localhost:3000/sign-up');
    console.log('2. Test sign-in flow at http://localhost:3000/sign-in');
    console.log('3. Test password reset at http://localhost:3000/forgot-password');

  } catch (error) {
    console.error('❌ Error updating templates:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('- Verify your access token is valid');
    console.log('- Check that you have admin access to the project');
    console.log('- Ensure the project reference is correct:', PROJECT_REF);
    process.exit(1);
  }
}

// Run the script
updateEmailTemplates();
