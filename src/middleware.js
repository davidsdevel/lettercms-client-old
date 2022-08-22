import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/',
    "/([^/.]*)", 
    "/_blogs/:path*", 
    "/_recommendations/:path*"
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host') || 'davidsdevel.lettercms.vercel.app';

  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname.replace('.lettercms.vercel.app', '')
      : hostname.replace('.localhost:3002', '');


  const isPreview = req.cookies.get('__next_preview_data ') || req.cookies.get('__prerender_bypass ');

  if (isPreview) {
    url.pathname = `/_preview/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);  
  }

  url.pathname = `/_blogs/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(url);
  /*const userID = req.cookies.get('userID');
  
  if (!userID || url.pathname === '/search') {
    url.pathname = `/_blogs/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);
  } else {
    url.pathname = `/_recommendations/${userID}/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);
  }*/
}
