import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("dental_oauth_state")?.value;

  const loginUrl = new URL("/admin/login", request.nextUrl.origin);

  // Validate CSRF state token
  if (!code || !state || !storedState || state !== storedState) {
    loginUrl.searchParams.set("error", "oauth_state_mismatch");
    return NextResponse.redirect(loginUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    loginUrl.searchParams.set("google", "demo_fallback");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      loginUrl.searchParams.set("error", "oauth_exchange_failed");
      return NextResponse.redirect(loginUrl);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google UserInfo endpoint
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let email = "mariam.a@example.com";
    let name = "Mariam Ahmed";

    if (userinfoResponse.ok) {
      const userInfo = await userinfoResponse.json();
      if (userInfo.email) email = userInfo.email;
      if (userInfo.name) name = userInfo.name;
    }

    loginUrl.searchParams.set("google_email", email);
    loginUrl.searchParams.set("google_name", name);
    loginUrl.searchParams.set("google_connected", "true");

    const response = NextResponse.redirect(loginUrl);

    // Store access token in HttpOnly SameSite=Lax cookie for Calendar synchronization
    response.cookies.set("dental_google_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: tokenData.expires_in || 3600,
      secure: process.env.NODE_ENV === "production",
    });

    // Clear the one-time state cookie
    response.cookies.delete("dental_oauth_state");

    return response;
  } catch (err) {
    console.error("Google OAuth token exchange error:", err);
    loginUrl.searchParams.set("error", "oauth_unexpected_error");
    return NextResponse.redirect(loginUrl);
  }
}
