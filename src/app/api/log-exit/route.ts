import { NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const textData = await request.text();
    if (!textData) {
      return NextResponse.json({ error: "Boş veri" }, { status: 400 });
    }
    const { logId, action = "exit" } = JSON.parse(textData);

    if (!logId) {
      return NextResponse.json(
        { error: "Log ID gerekli" },
        { status: 400 }
      );
    }

    // Çıkış zamanını kaydet veya iptal et
    await updateDoc(doc(db, "sistem_giris_loglari", logId), {
      cikisZamani: action === "exit" ? new Date().toISOString() : null
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Çıkış logu API hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}
