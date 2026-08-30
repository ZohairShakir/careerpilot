import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { products, readDownloadToken } from "../../../lib/downloads";
import { bestEffort, supabaseRequest } from "../../../lib/supabase";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") || "";
    const data = readDownloadToken(token);
    if (!data) return NextResponse.json({ error: "This download link is invalid or has expired." }, { status: 401 });
    const product = products[data.product];
    const file = await readFile(path.join(process.cwd(), "products", product.filename));
    await bestEffort(() => supabaseRequest("rpc/record_bundle_download", { method: "POST", body: JSON.stringify({ payment_id: data.paymentId }) }));
    return new NextResponse(file, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${product.downloadName}"`, "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "The file could not be downloaded." }, { status: 500 }); }
}
