import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Needs the Node runtime (filesystem fallback) and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SharedState {
  discovered: string[];
  party: string | null;
  trail: string[];
  updatedAt: number;
}

const EMPTY: SharedState = {
  discovered: [],
  party: null,
  trail: [],
  updatedAt: 0,
};

/* --- storage backends --------------------------------------------- */
// Use a hosted Redis/KV store (Vercel KV or Upstash, via their REST API)
// when configured; otherwise fall back to a local JSON file. No SDK needed.
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "veilborn:campaign";
const useKv = Boolean(KV_URL && KV_TOKEN);

const FILE = path.join(process.cwd(), ".data", "campaign.json");

async function kvRead(): Promise<SharedState> {
  try {
    const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return EMPTY;
    const { result } = (await res.json()) as { result: string | null };
    return result ? { ...EMPTY, ...JSON.parse(result) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

async function kvWrite(state: SharedState): Promise<void> {
  await fetch(`${KV_URL}/set/${KV_KEY}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: JSON.stringify(state),
  });
}

async function fileRead(): Promise<SharedState> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<SharedState>) };
  } catch {
    return EMPTY;
  }
}

async function fileWrite(state: SharedState): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(state), "utf8");
}

const read = (): Promise<SharedState> => (useKv ? kvRead() : fileRead());
const write = (s: SharedState): Promise<void> => (useKv ? kvWrite(s) : fileWrite(s));

/* --- handlers ----------------------------------------------------- */
const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(req: NextRequest) {
  // If a DM_TOKEN is configured, writes require a matching token.
  const required = process.env.DM_TOKEN;
  if (required && req.headers.get("x-dm-token") !== required) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Partial<SharedState> | null;
  if (!body) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const state: SharedState = {
    discovered: strings(body.discovered),
    party: typeof body.party === "string" ? body.party : null,
    trail: strings(body.trail),
    updatedAt: Date.now(),
  };
  await write(state);
  return NextResponse.json(state);
}
