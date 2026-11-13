import { NextResponse } from "next/server";

// Disabled until a server-verified administrator session, recipient authorization,
// rate limits and a transactional mail provider are configured.
// The previous endpoint could be invoked anonymously and exposed national IDs in email.
export async function POST() {
  return NextResponse.json(
    { error: "Bildirim servisi güvenli yetkilendirme tamamlanana kadar kapalı." },
    { status: 503 }
  );
}
