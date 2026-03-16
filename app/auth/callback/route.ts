import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    // Supabase handles the token exchange automatically via the client-side listener.
    // This route just redirects back to the homepage after OAuth completes.
    return NextResponse.redirect(requestUrl.origin)
}
