import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Password-protects every page and API route with HTTP Basic Auth.
// Set SITE_PASSWORD (and optionally SITE_USERNAME) in the environment.
// If SITE_PASSWORD is not set, all requests are blocked (fail closed).

function safeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ (bBytes[i % (bBytes.length || 1)] ?? 0);
  }
  return diff === 0;
}

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Thought Partner", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest) {
  const expectedPassword = process.env.SITE_PASSWORD;
  const expectedUsername = process.env.SITE_USERNAME ?? "admin";

  if (!expectedPassword) {
    return new NextResponse("This site is currently unavailable.", { status: 503 });
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length).trim());
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator === -1) {
    return unauthorized();
  }

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  const userOk = safeEqual(username, expectedUsername);
  const passOk = safeEqual(password, expectedPassword);
  if (!userOk || !passOk) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
