export async function GET() {
  return Response.json({
    status: "ok",
    service: "capnong-fe",
    timestamp: new Date().toISOString(),
  });
}
