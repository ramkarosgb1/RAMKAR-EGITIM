import { NextResponse } from "next/server";

// Disabled until the server can verify that the authenticated user owns the log.
// Previously any caller who knew a log ID could change its exit timestamp.
export async function POST() {
  return NextResponse.json(
    { error: "Oturum kayıt servisi güvenli yetkilendirme tamamlanana kadar kapalı." },
    { status: 503 }
  );
}
