#!/usr/bin/env python3
"""Independent JSON-shape check for generated Power Automate-style output."""
import json
import sys
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "output/leave-request.power-automate.json")
if not path.exists():
    print(f"Missing output file: {path}")
    raise SystemExit(1)

data = json.loads(path.read_text(encoding="utf-8"))
assert isinstance(data.get("name"), str), "flow name must be a string"
actions = data.get("definition", {}).get("actions")
assert isinstance(actions, dict), "definition.actions must be an object"
for name, action in actions.items():
    assert isinstance(name, str) and name, "action names must be non-empty"
    assert isinstance(action.get("type"), str), f"{name}: type must be a string"
    assert isinstance(action.get("inputs"), dict), f"{name}: inputs must be an object"
print(f"OK: {len(actions)} actions validated in {path}")
