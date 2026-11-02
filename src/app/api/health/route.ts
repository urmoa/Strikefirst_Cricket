export function GET() {
  return Response.json({ status: "ok", mode: "local-draft", database: "not-configured" });
}
