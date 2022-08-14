import { NextResponse } from "next/server";

export const config = {
  matcher: [
    "/",
    "/([^/.]*)",
    "/:path*"
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get("host") || "demo.vercel.pub";

  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.lettercms-client.vercel.app`, "")
      : hostname.replace(`.localhost:3002`, "");

  url.pathname = `/_blogs/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(url);
}
