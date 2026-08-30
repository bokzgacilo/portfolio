"use client";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ParseResult =
  | { ok: true; value: JsonValue; pretty: string; minified: string; stats: JsonStats }
  | { ok: false; message: string; position: number | null; line: number | null; column: number | null };

export type JsonStats = {
  objects: number;
  arrays: number;
  keys: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  depth: number;
};

const EMPTY_STATS: JsonStats = {
  objects: 0,
  arrays: 0,
  keys: 0,
  strings: 0,
  numbers: 0,
  booleans: 0,
  nulls: 0,
  depth: 0,
};

function positionFromError(error: unknown) {
  if (!(error instanceof SyntaxError)) return null;
  const match = error.message.match(/position\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function lineColumnFromPosition(input: string, position: number) {
  const before = input.slice(0, position);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

function walk(value: JsonValue, depth = 1): JsonStats {
  if (value === null) {
    return { ...EMPTY_STATS, nulls: 1, depth };
  }

  if (Array.isArray(value)) {
    return value.reduce<JsonStats>(
      (stats, item) => mergeStats(stats, walk(item, depth + 1)),
      { ...EMPTY_STATS, arrays: 1, depth }
    );
  }

  if (typeof value === "object") {
    return Object.values(value).reduce<JsonStats>(
      (stats, item) => mergeStats(stats, walk(item, depth + 1)),
      { ...EMPTY_STATS, objects: 1, keys: Object.keys(value).length, depth }
    );
  }

  if (typeof value === "string") {
    return { ...EMPTY_STATS, strings: 1, depth };
  }

  if (typeof value === "number") {
    return { ...EMPTY_STATS, numbers: 1, depth };
  }

  return { ...EMPTY_STATS, booleans: 1, depth };
}

function mergeStats(left: JsonStats, right: JsonStats): JsonStats {
  return {
    objects: left.objects + right.objects,
    arrays: left.arrays + right.arrays,
    keys: left.keys + right.keys,
    strings: left.strings + right.strings,
    numbers: left.numbers + right.numbers,
    booleans: left.booleans + right.booleans,
    nulls: left.nulls + right.nulls,
    depth: Math.max(left.depth, right.depth),
  };
}

export function parseJson(input: string): ParseResult {
  try {
    const value = JSON.parse(input) as JsonValue;
    return {
      ok: true,
      value,
      pretty: JSON.stringify(value, null, 2),
      minified: JSON.stringify(value),
      stats: walk(value),
    };
  } catch (error) {
    const position = positionFromError(error);
    const location = position === null ? { line: null, column: null } : lineColumnFromPosition(input, position);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Invalid JSON.",
      position,
      ...location,
    };
  }
}

export function valueKind(value: JsonValue) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export function previewValue(value: JsonValue) {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === null) return "null";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  return `Object(${Object.keys(value).length})`;
}
