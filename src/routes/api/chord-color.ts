import { createFileRoute } from "@tanstack/react-router";
import { chordColorLookup } from "@/lib/music/theory";

/**
 * GET /api/chord-color?q=Am7
 * JSON color mapping for a chord symbol — for apps, tools, and Grok lookups.
 */
export const Route = createFileRoute("/api/chord-color")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q") ?? url.searchParams.get("chord") ?? "";
        if (!q.trim()) {
          return Response.json(
            {
              ok: false,
              error: "Missing chord query.",
              hint: "Use ?q=Am7 or ?chord=F%23maj7",
              examples: ["C", "Am", "G7", "F#maj7", "Bb", "Dsus4", "E dim", "E°7", "Cø", "Am7b5"],
            },
            { status: 400 },
          );
        }
        const result = chordColorLookup(q);
        return Response.json(result, {
          status: result.ok ? 200 : 422,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
