import { ConversionIssue, ConversionResult, NintexAction, NintexWorkflow, PowerAutomateAction } from "./types";

type Mapper = (action: NintexAction) => PowerAutomateAction;

const mappers: Record<string, Mapper> = {
  Start: () => ({ type: "Compose", inputs: { description: "Workflow start marker" } }),
  SetVariable: action => ({
    type: "SetVariable",
    inputs: { name: action.config?.variable ?? "variableName", value: action.config?.value ?? "" }
  }),
  Condition: action => ({
    type: "If",
    inputs: {
      expression: action.config?.expression ?? "@equals(triggerBody()?['status'], 'Approved')",
      actions: {},
      else: { actions: {} }
    }
  }),
  SendEmail: action => ({
    type: "OpenApiConnection",
    inputs: {
      operationId: "SendEmailV2",
      to: action.config?.to ?? "replace-me@example.com",
      subject: action.config?.subject ?? action.name ?? "Workflow notification",
      body: action.config?.body ?? ""
    }
  }),
  Approval: action => ({
    type: "StartAndWaitForAnApproval",
    inputs: {
      approvalType: action.config?.approvalType ?? "ApproveReject",
      title: action.config?.title ?? action.name ?? "Approval required",
      assignedTo: action.config?.assignedTo ?? "replace-with-approver"
    }
  }),
  Wait: action => ({ type: "Delay", inputs: { interval: action.config?.interval ?? 1, unit: action.config?.unit ?? "Minute" } }),
  UpdateItem: action => ({ type: "OpenApiConnection", inputs: { operationId: "UpdateItem", ...action.config } }),
  CreateItem: action => ({ type: "OpenApiConnection", inputs: { operationId: "CreateItem", ...action.config } }),
  HttpRequest: action => ({ type: "Http", inputs: { method: action.config?.method ?? "GET", uri: action.config?.uri ?? "" } }),
  Log: action => ({ type: "Compose", inputs: { message: action.config?.message ?? action.name ?? "" } }),
  Terminate: action => ({ type: "Terminate", inputs: { runStatus: action.config?.runStatus ?? "Succeeded" } })
};

export function convertWorkflow(workflow: NintexWorkflow): ConversionResult {
  const actions: Record<string, PowerAutomateAction> = {};
  const issues: ConversionIssue[] = [];
  let convertedCount = 0;
  let unsupportedCount = 0;

  for (const action of workflow.actions) {
    const mapper = mappers[action.type];
    const safeName = makeActionName(action);
    if (!mapper) {
      unsupportedCount++;
      issues.push({
        code: "UNSUPPORTED_ACTION",
        message: `No converter registered for action type "${action.type}".`,
        actionId: action.id,
        severity: "error"
      });
      continue;
    }
    actions[safeName] = mapper(action);
    convertedCount++;
    if (action.type === "SendEmail" && !action.config?.to) {
      issues.push({
        code: "PLACEHOLDER_RECIPIENT",
        message: "Email recipient is a placeholder and must be configured before deployment.",
        actionId: action.id,
        severity: "warning"
      });
    }
  }

  // Connect sequential actions using runAfter as a safe baseline. Branching conditions
  // need human review and should be validated against the original workflow semantics.
  workflow.actions.forEach((action, index) => {
    const current = actions[makeActionName(action)];
    if (!current || index === 0) return;
    const previous = workflow.actions[index - 1];
    const previousName = makeActionName(previous);
    if (actions[previousName]) current.runAfter = { [previousName]: ["Succeeded"] };
  });

  return {
    flow: { name: workflow.name, definition: { actions } },
    issues,
    convertedCount,
    unsupportedCount
  };
}

function makeActionName(action: NintexAction): string {
  const base = (action.name || action.id).replace(/[^A-Za-z0-9_]/g, "_");
  return /^[A-Za-z_]/.test(base) ? base : `Action_${base}`;
}
