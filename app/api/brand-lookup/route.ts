import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a brand-research assistant for a Sports & Outdoor ROI calculator built jointly by W. L. Gore & Associates and Kezzler.

Given a brand name, use web_search to find the brand's current public business data. Then return ONLY a JSON object (no prose, no code fences, no markdown) matching this exact shape:

{
  "brandName": "string — the brand's official name",
  "sector": "string — must be EXACTLY one of: luxury-outdoor-techwear | outerwear | technical-alpine | athletic-sportswear | outdoor-lifestyle | performance-materials",
  "annualRevenue": "number — latest fiscal year revenue in USD",
  "avgItemPrice": "number — typical product price in USD",
  "baselineReturnRate": "number — as a percent (e.g. 12 means 12%)",
  "channelMix": {
    "ownStoresPct": "number 0-100",
    "ownEcomPct": "number 0-100",
    "wholesalePct": "number 0-100"
  },
  "ownStores": "number — brand-operated retail store count",
  "storeStaffPerStore": "number — typical staff count per store",
  "sources": [
    { "label": "string — what this source documents", "url": "string — full URL", "year": "number" }
  ],
  "notes": "string — 1-2 sentences on what's known vs estimated"
}

If the brand is clearly NOT a Sports & Outdoor brand (e.g. luxury fashion houses, fast fashion, denim, mainstream street fashion), respond with this JSON instead — and only this JSON:
{ "error": "not-outdoor", "brandName": "string — official name", "explanation": "string — one sentence on why" }

Sector definitions:
- luxury-outdoor-techwear: Arc'teryx, Veilance, Stone Island Shadow Project — premium technical with style
- outerwear: Patagonia, Canada Goose, Moncler, Fjällräven — coats / shells / down-led
- technical-alpine: Mammut, Black Diamond, La Sportiva, Ortovox — alpine, climbing, ski touring
- athletic-sportswear: Nike, Under Armour, Lululemon, On Running — performance athletic
- outdoor-lifestyle: Cotopaxi, Topo Designs, Snow Peak — outdoor-inspired everyday
- performance-materials: Gore, Polartec, Pertex — materials suppliers

Rules:
- Channel mix MUST sum to 100. Estimate from industry comparables if exact figures aren't public.
- If a number isn't reliably knowable, provide your best estimate from sector comparables and flag it in "notes".
- Include 2-4 sources covering at minimum: revenue figure, channel mix or business model context.
- Output the raw JSON only — no commentary, no markdown, no code fences.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { brandName?: unknown };
    const brandName =
      typeof body.brandName === "string" ? body.brandName.trim() : "";

    if (brandName.length < 2) {
      return NextResponse.json(
        { error: "Enter at least two characters." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20260209", name: "web_search" }],
      messages: [{ role: "user", content: `Research: ${brandName}` }],
    });

    const textParts: string[] = [];
    for (const block of response.content) {
      if (block.type === "text") {
        textParts.push(block.text);
      }
    }
    const fullText = textParts.join("");

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Lookup did not return parseable data. Try again." },
        { status: 502 }
      );
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error("brand-lookup error:", err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid API key on the server." },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited — try again in a moment." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
}
