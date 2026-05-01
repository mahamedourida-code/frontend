function cleanEnv(value?: string): string {
  return (value || "").replace(/^["']|["']$/g, "").trim()
}

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

function inferWebSocketUrl(apiUrl: string): string {
  if (apiUrl.startsWith("https://")) {
    return `wss://${apiUrl.slice("https://".length)}`
  }

  if (apiUrl.startsWith("http://")) {
    return `ws://${apiUrl.slice("http://".length)}`
  }

  return apiUrl
}

const browserOrigin = typeof window !== "undefined" ? window.location.origin : ""
const apiUrl = withoutTrailingSlash(cleanEnv(process.env.NEXT_PUBLIC_API_URL) || browserOrigin)
const wsUrl = withoutTrailingSlash(cleanEnv(process.env.NEXT_PUBLIC_WS_URL) || inferWebSocketUrl(apiUrl))

export const publicConfig = {
  apiUrl,
  wsUrl,
  facebookAppId: cleanEnv(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID),
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return publicConfig.apiUrl
    ? `${publicConfig.apiUrl}${normalizedPath}`.replace(/\s/g, "")
    : normalizedPath
}

export function buildDownloadUrl(fileId: string, sessionId?: string): string {
  const url = new URL(
    buildApiUrl(`/api/v1/download/${encodeURIComponent(fileId)}`),
    publicConfig.apiUrl || browserOrigin || "http://localhost"
  )
  if (sessionId) {
    url.searchParams.set("session_id", sessionId)
  }
  return url.toString()
}

export function buildOfficeViewerUrl(fileId: string, sessionId?: string): string {
  const downloadUrl = buildDownloadUrl(fileId, sessionId)
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(downloadUrl)}`
}

export function buildMessengerShareUrl(link: string, redirectUri: string): string | null {
  if (!publicConfig.facebookAppId) {
    return null
  }

  const params = new URLSearchParams({
    app_id: publicConfig.facebookAppId,
    link,
    redirect_uri: redirectUri,
  })

  return `https://www.facebook.com/dialog/send?${params.toString()}`
}
