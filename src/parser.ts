import { NintexAction, NintexWorkflow } from "./types";

const KNOWN_TYPES = new Set([
  "Start", "SetVariable", "Condition", "SendEmail", "Approval", "Wait",
  "UpdateItem", "CreateItem", "HttpRequest", "Log", "Terminate"
]);

/**
 * Parse and normalize a JSON export of a Nintex-like workflow.
 * This sample intentionally accepts JSON rather than proprietary export files.
 */
export function parseWorkflow(input: string): NintexWorkflow {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error("Workflow input is not valid JSON.");
  }

  if (!isRecord(parsed)) throw new Error("Workflow must be a JSON object.");
  if (typeof parsed.id !== "string" || typeof parsed.name !== "string") {
    throw new Error("Workflow requires string id and name fields.");
  }
  if (!Array.isArray(parsed.actions)) throw new Error("Workflow actions must be an array.");

  const seen = new Set<string>();
  const actions: NintexAction[] = parsed.actions.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Action at index ${index} must be an object.`);
    if (typeof raw.id !== "string" || !raw.id.trim()) {
      throw new Error(`Action at index ${index} requires a non-empty id.`);
    }
    if (seen.has(raw.id)) throw new Error(`Duplicate action id: ${raw.id}`);
    seen.add(raw.id);
    if (typeof raw.type !== "string" || !raw.type.trim()) {
      throw new Error(`Action ${raw.id} requires a type.`);
    }
    if (!KNOWN_TYPES.has(raw.type)) {
      // Keep unknown types so conversion can report them instead of losing data.
    }
    const next = Array.isArray(raw.next)
      ? raw.next.filter((item): item is string => typeof item === "string")
      : [];
    const config = isRecord(raw.config) ? raw.config : {};
    return {
      id: raw.id,
      type: raw.type,
      ...(typeof raw.name === "string" ? { name: raw.name } : {}),
      config,
      next
    };
  });

  const ids = new Set(actions.map(action => action.id));
  for (const action of actions) {
    for (const target of action.next ?? []) {
      if (!ids.has(target)) throw new Error(`Action ${action.id} points to missing action ${target}.`);
    }
  }
  return { id: parsed.id, name: parsed.name, actions };
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
