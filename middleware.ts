import { NextResponse, type NextRequest } from "next/server";

// HTTP Basic Auth for /admin/*. Credentials: user any, password = ADMIN_PASSWORD env.
export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return new NextResponse("ADMIN_PASSWORD env var not set", { status: 503 });
  }

  if (auth?.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const [, password] = decoded.split(":");
    if (password === expected) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="NR1 Admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
