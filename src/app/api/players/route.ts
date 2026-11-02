import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ players: [] }, { headers });
  if (query.length > 60) return Response.json({ error: "invalid_query" }, { status: 400, headers });

  try {
    const players = await prisma.player.findMany({
      where: { displayName: { contains: query, mode: "insensitive" } },
      select: { id: true, displayName: true },
      orderBy: [{ displayName: "asc" }, { id: "asc" }],
      take: 12,
    });
    return Response.json({ players }, { headers });
  } catch {
    return Response.json({ error: "search_unavailable" }, { status: 503, headers });
  }
}
