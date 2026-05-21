/**
 * Configure AxLiner Supabase Auth email templates.
 *
 * Required env:
 *   SUPABASE_ACCESS_TOKEN - Supabase Management API access token
 *
 * Optional env:
 *   SUPABASE_PROJECT_REF - defaults to AxLiner production project
 *
 * Run:
 *   node scripts/configure-email-templates.js
 */

const fs = require("fs")
const path = require("path")

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "iawkqvdtktnvxqgpupvt"
const MANAGEMENT_API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`
const templatesDir = path.join(__dirname, "..", "email-templates")

function readTemplate(name) {
  return fs.readFileSync(path.join(templatesDir, name), "utf8")
}

async function updateEmailTemplates() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN

  if (!accessToken) {
    console.error("Missing SUPABASE_ACCESS_TOKEN.")
    console.error("Create one at https://supabase.com/dashboard/account/tokens")
    process.exit(1)
  }

  const config = {
    MAILER_SUBJECTS_MAGIC_LINK: "Sign in to AxLiner",
    MAILER_TEMPLATES_MAGIC_LINK_CONTENT: readTemplate("magic-link.html"),
    MAILER_SUBJECTS_CONFIRMATION: "Verify your AxLiner email",
    MAILER_TEMPLATES_CONFIRMATION_CONTENT: readTemplate("confirmation.html"),
  }

  const response = await fetch(MANAGEMENT_API_URL, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Supabase Management API failed: ${response.status} ${response.statusText}\n${body}`)
  }

  console.log("AxLiner Supabase Auth email templates updated.")
  console.log("Make sure these redirect URLs are allowed in Supabase Auth:")
  console.log("- https://www.axliner.com/auth/confirm")
  console.log("- https://www.axliner.com/auth/callback")
  console.log("- http://localhost:3000/auth/confirm")
  console.log("- http://localhost:3000/auth/callback")
}

updateEmailTemplates().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
