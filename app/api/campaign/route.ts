import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Needs the Node runtime (filesystem) and must never be cached.
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

const FILE = path.join(process.cwd(), ".data", "campaign.json");

async function read(): Promise<SharedState> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<SharedState>) };
  } catch {
    return EMPTY;
  }
}

async function write(state: SharedState): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(state), "utf8");
}

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(req: NextRequest) {
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
