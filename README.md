# Nintex-to-Power Automate Workflow Conversion Engine

A portfolio-ready **demonstration implementation** of a workflow conversion pipeline. It parses a JSON representation of a Nintex-like workflow, maps known action types to Power Automate-style action objects, reports unsupported actions, and runs structural validation.

## Important scope note

This is a runnable learning/portfolio scaffold, **not an official Nintex exporter or production-ready Power Automate deployment tool**. Real migrations require a supported source export, tenant-specific connector schemas, expression translation, approval of branch semantics, credential setup, and validation in a Power Platform environment. The example conversion maps common patterns and flags gaps instead of pretending all proprietary behavior can be translated automatically.

## Requirements

- Node.js 20+
- npm
- Python 3.10+ (only for the optional independent JSON check)

## Run

```bash
npm install
npm test
npm run build
node dist/src/cli.js examples/leave-request.nintex.json output/leave-request.power-automate.json
python scripts/validate_sample.py output/leave-request.power-automate.json
```

## Pipeline

1. `parser.ts` validates the JSON shape, action IDs, and references.
2. `converter.ts` maps supported action types and emits issues for unsupported ones.
3. `validator.ts` checks counts, output names, unsupported actions, and conversion errors.
4. `cli.ts` writes the converted flow definition to disk.
5. Jest tests cover valid and invalid input, mapping, warnings, and unsupported actions.

## Azure / Power Automate integration

No Azure tenant is required for the sample. Before real deployment, add an authenticated integration layer using an approved Azure AD / Microsoft Entra app registration and documented Power Platform APIs. Do not store client secrets in source control; use environment variables or a secret store.
