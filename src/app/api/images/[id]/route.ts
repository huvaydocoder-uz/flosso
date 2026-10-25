import { getImage } from "@/lib/repo";

export async function GET(_: Request, { params }: RouteContext<"/api/images/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const img = await getImage(id).catch(() => null);
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.bytes), {
    headers: { "content-type": img.mime, "cache-control": "public, max-age=31536000, immutable" },
  });
}
