// Unsent: The Micro-Confession Sprint — make.fun entry
// Writes the two-part micro-confession to /output/entry.txt:
// a To: line naming who it was meant for, and the unsent message itself,
// one line exactly as it was typed, with no explanation after it.
// Gate: entry.txt must be UTF-8 text of 1 to 260 characters, not only
// whitespace; the message itself is at most 200 characters.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The confession, in its two parts: who it was meant for, and the line
// that stayed in drafts. The addressee is part of the confession —
// swap her for anyone else and the camera, the movers and the three
// years of silence stop making sense.
const TO_LINE = "To: my sister";
const LINE =
  "I was the one who broke your camera the summer before college. I let you blame the movers for three years because saying sorry felt smaller than the lie.";

interface GateReport {
  totalCodePoints: number;
  messageCodePoints: number;
  valid: boolean;
  reason: string;
}

function buildEntry(): string {
  return `${TO_LINE}\n${LINE}`;
}

function validateEntry(text: string): GateReport {
  const totalCodePoints = [...text].length;
  const messageCodePoints = [...LINE].length;
  if (totalCodePoints < 1 || totalCodePoints > 260) {
    return { totalCodePoints, messageCodePoints, valid: false, reason: "total length outside 1-260" };
  }
  if (text.trim().length === 0) {
    return { totalCodePoints, messageCodePoints, valid: false, reason: "only whitespace" };
  }
  if (messageCodePoints > 200) {
    return { totalCodePoints, messageCodePoints, valid: false, reason: "message over 200 code points" };
  }
  return { totalCodePoints, messageCodePoints, valid: true, reason: "ok" };
}

function verifyWritten(target: string, expected: string): string {
  const written = readFileSync(target, "utf8");
  if (written !== expected) throw new Error("written entry does not match");
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const report = validateEntry(entry);
  if (!report.valid) throw new Error(`gate fails: ${report.reason}`);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, entry, "utf8");
  const sha256 = verifyWritten(target, entry);
  console.log(`gate passes: ${report.totalCodePoints} code points, sha256 ${sha256}`);
  console.log(`verified: ${JSON.stringify(LINE)}`);
}

main();
