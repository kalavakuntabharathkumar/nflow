import fs from "node:fs";
import path from "node:path";
import { parseWorkflow } from "./parser";
import { convertWorkflow } from "./converter";
import { validateConversion } from "./validator";

const inputPath = process.argv[2] ?? "examples/leave-request.nintex.json";
const outputPath = process.argv[3] ?? "output/leave-request.power-automate.json";

try {
  const source = parseWorkflow(fs.readFileSync(inputPath, "utf8"));
  const result = convertWorkflow(source);
  const validation = validateConversion(source, result);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result.flow, null, 2));
  console.log(JSON.stringify({ validation, issues: result.issues, outputPath }, null, 2));
  if (!validation.passed) process.exitCode = 2;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
