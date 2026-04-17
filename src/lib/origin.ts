import { NextRequest } from "next/server";

export function getOrigin(request: NextRequest): string {
  // 1. Check x-forwarded-host (set by Cloud Run / reverse proxies)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // 2. Check host header
  const host = request.headers.get("host");
  if (host && !host.startsWith("0.0.0.0") && !host.startsWith("localhost")) {
    const proto = host.includes("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }

  // 3. Check origin header
  const origin = request.headers.get("origin");
  if (origin && !origin.includes("0.0.0.0")) {
    return origin;
  }

  // 4. Fallback to nextUrl
  return request.nextUrl.origin;
}
