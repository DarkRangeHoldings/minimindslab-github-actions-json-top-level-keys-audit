import { appendFileSync } from 'node:fs';

const input = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

const fail = (message) => {
  throw new Error(message);
};

if (typeof input !== 'string') fail('INPUT_PAYLOAD must be provided');
if (typeof outputPath !== 'string' || outputPath.length === 0) fail('GITHUB_OUTPUT must be provided');

let parsed;
try {
  parsed = JSON.parse(input);
} catch {
  fail('INPUT_PAYLOAD must be valid JSON');
}

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) fail('payload must be an object');

const hasOwn = Object.prototype.hasOwnProperty;
if (!hasOwn.call(parsed, 'value') || !hasOwn.call(parsed, 'required')) fail('payload must contain value and required');

const value = parsed.value;
const required = parsed.required;

if (value === null || typeof value !== 'object' || Array.isArray(value)) fail('value must be a plain object');
if (required === null || !Array.isArray(required)) fail('required must be an array');

const seen = Object.create(null);
for (let i = 0; i < required.length; i += 1) {
  const k = required[i];
  if (typeof k !== 'string' || k.length === 0) fail('required entries must be non-empty strings');
  if (seen[k]) fail('required entries must be unique');
  seen[k] = true;
}

const requiredSorted = required.slice().sort();
const present = [];
const missing = [];

for (let i = 0; i < requiredSorted.length; i += 1) {
  const k = requiredSorted[i];
  if (Object.prototype.hasOwnProperty.call(value, k)) present.push(k);
  else missing.push(k);
}

const result = {
  missing,
  ok: missing.length === 0,
  present
};

appendFileSync(outputPath, `result=${JSON.stringify(result)}\n`);