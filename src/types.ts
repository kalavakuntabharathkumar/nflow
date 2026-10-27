export type NintexActionType =
  | "Start"
  | "SetVariable"
  | "Condition"
  | "SendEmail"
  | "Approval"
  | "Wait"
  | "UpdateItem"
  | "CreateItem"
  | "HttpRequest"
  | "Log"
  | "Terminate";

export interface NintexAction {
  id: string;
  type: NintexActionType | string;
  name?: string;
  config?: Record<string, unknown>;
  next?: string[];
}

export interface NintexWorkflow {
  id: string;
  name: string;
  actions: NintexAction[];
}

export interface PowerAutomateAction {
  type: string;
  inputs: Record<string, unknown>;
  runAfter?: Record<string, string[]>;
}

export interface ConversionIssue {
  code: string;
  message: string;
  actionId?: string;
  severity: "warning" | "error";
}

export interface ConversionResult {
  flow: { name: string; definition: { actions: Record<string, PowerAutomateAction> } };
  issues: ConversionIssue[];
  convertedCount: number;
  unsupportedCount: number;
}
