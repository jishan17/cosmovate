
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");

  // Only allow local application redirects.
  const next =
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\")
      ? requestedNext
      : "/admin/set-password";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/admin/login?error=invitation_failed`
  );
}
