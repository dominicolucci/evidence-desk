import { listResearch } from "../../../lib/research";

/** GET /api/research — summaries of every research run with coverage. */
export async function GET() {
  return Response.json({ runs: listResearch() });
}
