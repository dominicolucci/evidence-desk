import { availableTickers, getResearchRun, normalizeTicker } from "../../../../lib/research";

/**
 * GET /api/research/:ticker
 *
 * Returns a ResearchRun, or 404 with the tickers that do have coverage.
 * The UI talks only to this endpoint, so swapping fixtures for a real
 * research pipeline is a change behind this route and nowhere else.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await context.params;
  const run = getResearchRun(ticker);

  if (!run) {
    return Response.json(
      {
        error: "not_found",
        ticker: normalizeTicker(ticker),
        message: `No research run available for ${normalizeTicker(ticker)}.`,
        available: availableTickers(),
      },
      { status: 404 },
    );
  }

  return Response.json(run);
}
