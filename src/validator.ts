import { ConversionResult, NintexWorkflow } from "./types";

export interface ValidationReport {
  passed: boolean;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  errorCount: number;
  warningCount: number;
}

export function validateConversion(source: NintexWorkflow, result: ConversionResult): ValidationReport {
  const checks: ValidationReport["checks"] = [];
  const convertedNames = Object.keys(result.flow.definition.actions);
  const sourceSupportedCount = source.actions.length - result.unsupportedCount;

  checks.push({
    name: "action-count",
    passed: result.convertedCount === sourceSupportedCount,
    detail: `Converted ${result.convertedCount} of ${sourceSupportedCount} supported source actions.`
  });
  checks.push({
    name: "unique-output-names",
    passed: new Set(convertedNames).size === convertedNames.length,
    detail: `${convertedNames.length} output action names generated.`
  });
  checks.push({
    name: "no-unsupported-actions",
    passed: result.unsupportedCount === 0,
    detail: `${result.unsupportedCount} unsupported action(s) require manual mapping.`
  });
  checks.push({
    name: "no-error-issues",
    passed: !result.issues.some(issue => issue.severity === "error"),
    detail: `${result.issues.filter(issue => issue.severity === "error").length} conversion error(s).`
  });

  const errorCount = result.issues.filter(issue => issue.severity === "error").length;
  const warningCount = result.issues.filter(issue => issue.severity === "warning").length;
  return { passed: checks.every(check => check.passed), checks, errorCount, warningCount };
}
