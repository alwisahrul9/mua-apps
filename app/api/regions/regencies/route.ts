import { NextResponse } from "next/server"
import { getRegencies } from "@/lib/indonesia-regions"

export async function GET(request: Request) {
  const provinceCode = new URL(request.url).searchParams.get("province") ?? ""

  if (!/^\d{2}$/.test(provinceCode)) {
    return NextResponse.json(
      { message: "Kode provinsi tidak valid." },
      { status: 400 },
    )
  }

  try {
    return NextResponse.json({ data: await getRegencies(provinceCode) })
  } catch {
    return NextResponse.json(
      { message: "Data kota/kabupaten belum dapat dimuat." },
      { status: 502 },
    )
  }
}
