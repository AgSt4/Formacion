import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Keep edge middleware minimal in production. Full auth and role validation happen in server components/layouts.
  return NextResponse.next({ request });
}
