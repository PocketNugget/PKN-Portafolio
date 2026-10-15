const SITE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'";

const PLAYER_CSP =
  "default-src 'self'; script-src 'self' https://www.youtube.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.youtube.com; base-uri 'self'; form-action 'none'; frame-ancestors 'self'; object-src 'none'";

export function isPlayerAsset(pathname: string): boolean {
  return pathname.startsWith("/vendor/webdeck-player/");
}

export function headersFor(pathname = "/"): Record<string, string> {
  const player = isPlayerAsset(pathname);
  return {
    // data: is only there so 98.css can paint title-bar controls from SVG data URIs.
    "content-security-policy": player ? PLAYER_CSP : SITE_CSP,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy":
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
    "x-frame-options": player ? "SAMEORIGIN" : "DENY",
    "cross-origin-opener-policy": "same-origin",
  };
}

export const SECURITY_HEADERS: Record<string, string> = headersFor("/");

export const SECURITY_TXT = `Contact: mailto:goben.ca.pkn@hotmail.com
Expires: 2027-10-14T00:00:00.000Z
Preferred-Languages: en, es
`;

export function withSecurity(response: Response, pathname = "/"): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(headersFor(pathname))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
