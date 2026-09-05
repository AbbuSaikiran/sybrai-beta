// ============================================
// SYBRAI — Cybersecurity Multi-Agent SDK
// Implements OpenAI Agents SDK Architecture:
// - Manager & Specialist Agents
// - Handoffs & Agents-as-Tools
// - Tool Execution Loop
// - Input/Output Guardrails & Human-in-the-Loop Approvals
// ============================================

import { chatWithAi, getAiConfig } from './aiService.js';
import { addNotification, sendDeviceNotification } from './notificationService.js';

/**
 * Tool Definition with Human Approval Guardrail Support
 */
export function createCyberTool({ name, description, parameters, needsApproval = false, execute }) {
  return {
    name,
    description,
    parameters,
    needsApproval,
    execute,
  };
}

/**
 * 1. Tool: Push Critical Threat Alert to Mobile Device (with approval requirement)
 */
export const triggerMobileCyberAlertTool = createCyberTool({
  name: 'trigger_mobile_cyber_alert',
  description: 'Dispatches a high-priority push notification and vibration to the developer mobile device.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Threat headline (e.g. Critical SQL Injection Detected)' },
      cvss: { type: 'string', description: 'CVSS Score (e.g. 9.8)' },
      cwe: { type: 'string', description: 'CWE Identifier (e.g. CWE-89)' },
      file: { type: 'string', description: 'Target file location' },
      remediation: { type: 'string', description: 'Recommended security patch' },
    },
    required: ['title', 'cvss', 'cwe', 'file'],
  },
  needsApproval: true, // Requires human approval before dispatching device alert
  async execute(args) {
    const newAlert = await addNotification({
      title: `[CVSS ${args.cvss}] ${args.title}`,
      desc: `${args.cwe} found in ${args.file}. Immediate remediation recommended.`,
      type: parseFloat(args.cvss) >= 9.0 ? 'critical' : parseFloat(args.cvss) >= 7.0 ? 'error' : 'warning',
      file: args.file,
      fixSuggestion: args.remediation || 'Apply parameterized inputs and security controls.',
      icon: 'shield-alert',
      isAiGenerated: true,
    }, true);

    return {
      status: 'dispatched',
      notificationId: newAlert.id,
      message: `Push alert sent to mobile device with vibration.`,
    };
  }
});

/**
 * 2. Tool: Revoke Exposed API Key / Secret (High Risk - Needs Approval)
 */
export const revokeExposedSecretTool = createCyberTool({
  name: 'revoke_exposed_secret',
  description: 'Immediately invalidates an exposed API key or token found in public source code.',
  parameters: {
    type: 'object',
    properties: {
      secretPrefix: { type: 'string', description: 'First 8 characters of secret' },
      fileFound: { type: 'string', description: 'Location where secret was detected' },
    },
    required: ['secretPrefix', 'fileFound'],
  },
  needsApproval: true, // Guardrail: Human must confirm key revocation
  async execute(args) {
    return {
      status: 'revoked',
      details: `Revocation signal dispatched for key matching ${args.secretPrefix}... in ${args.fileFound}.`,
    };
  }
});

/**
 * Specialist Agents Definition
 */
export const vulnerabilityAuditorAgent = {
  name: 'Vulnerability Auditor Specialist',
  role: 'AppSec & OWASP',
  icon: 'shield-alert',
  instructions: `You are the Vulnerability Auditor Specialist in the SYBRAI CyberSec team.
Your scope:
- Audit source code for OWASP Top 10 vulnerabilities (SQLi, XSS, SSRF, BOLA, CSRF, Insecure Deserialization).
- Assign CVSS v3.1 ratings and CWE catalog numbers.
- Provide explicit before-and-after hardened code patches.`,
  tools: [revokeExposedSecretTool],
};

export const threatDefenseAgent = {
  name: 'Threat Defense Specialist',
  role: 'DevSecOps & Hardening',
  icon: 'lock',
  instructions: `You are the Threat Defense Specialist in the SYBRAI CyberSec team.
Your scope:
- Enforce Content Security Policy (CSP), CORS headers, and secure cookie attributes.
- Audit cryptographic algorithms and JWT token verification lifecycle.
- Defend against unauthorized network egress and supply chain dependencies.`,
  tools: [],
};

export const incidentResponseAgent = {
  name: 'Incident Response Specialist',
  role: 'SOC & Mobile Alerts',
  icon: 'bell-ring',
  instructions: `You are the Incident Response Specialist in the SYBRAI CyberSec team.
Your scope:
- Triage active security incidents.
- When an urgent vulnerability or active exploit is detected, formulate a high-priority alert and invoke trigger_mobile_cyber_alert.`,
  tools: [triggerMobileCyberAlertTool],
};

/**
 * Orchestrator / Triage Manager Agent
 */
export const cyberTriageAgent = {
  name: 'SYBRAI CyberSec Triage',
  role: 'Orchestrator',
  icon: 'shield',
  instructions: `You are the Central CyberSec Triage Manager.
Analyze the user's inquiry or code submission and route via handoff to the appropriate specialist:
- If code scanning, CVE/CWE, OWASP, or code vulnerability -> handoff to Vulnerability Auditor Specialist.
- If headers, CORS, JWT, cryptography, or security policy -> handoff to Threat Defense Specialist.
- If incident escalation, threat alerts, or mobile notification -> handoff to Incident Response Specialist.`,
  handoffs: [vulnerabilityAuditorAgent, threatDefenseAgent, incidentResponseAgent],
};

/**
 * Determine which specialist should own the task (Handoff Routing)
 */
export function resolveHandoff(prompt, currentAgent = cyberTriageAgent) {
  const lower = prompt.toLowerCase();

  if (lower.includes('alert') || lower.includes('notify') || lower.includes('incident') || lower.includes('breach') || lower.includes('urgent')) {
    return incidentResponseAgent;
  }
  if (lower.includes('cors') || lower.includes('header') || lower.includes('jwt') || lower.includes('token') || lower.includes('ssl') || lower.includes('cookie')) {
    return threatDefenseAgent;
  }
  if (lower.includes('vuln') || lower.includes('sqli') || lower.includes('xss') || lower.includes('secret') || lower.includes('leak') || lower.includes('owasp') || lower.includes('cve') || lower.includes('audit')) {
    return vulnerabilityAuditorAgent;
  }

  return currentAgent === cyberTriageAgent ? vulnerabilityAuditorAgent : currentAgent;
}

/**
 * Execute an Agent Run following the OpenAI Agents SDK Lifecycle
 */
export async function runCyberAgentWorkflow(inputPrompt, sessionHistory = [], onApprovalRequired = null) {
  // Step 1: Input Guardrail Check
  const inputCheck = evaluateInputGuardrail(inputPrompt);
  if (!inputCheck.allowed) {
    return {
      finalOutput: `⛔ **Input Guardrail Blocked**: ${inputCheck.reason}`,
      lastAgent: cyberTriageAgent,
      interruptions: [],
    };
  }

  // Step 2: Route / Handoff to Specialist Agent
  const specialist = resolveHandoff(inputPrompt);

  // Step 3: Check if a sensitive tool call should be simulated/invoked
  const pendingInterruption = detectToolInterruption(specialist, inputPrompt);

  if (pendingInterruption && pendingInterruption.needsApproval) {
    if (onApprovalRequired) {
      // Pause run for Human Review
      const approved = await onApprovalRequired(pendingInterruption);
      if (!approved) {
        return {
          finalOutput: `🛑 **Human Review Decision**: Tool execution for \`${pendingInterruption.tool.name}\` was **rejected** by operator. The security action was aborted.`,
          lastAgent: specialist,
          interruptions: [pendingInterruption],
        };
      }

      // If approved, execute the tool
      const toolResult = await pendingInterruption.tool.execute(pendingInterruption.args);
      const aiResponse = await chatWithAi(
        `User Request: "${inputPrompt}". Tool ${pendingInterruption.tool.name} was approved and returned: ${JSON.stringify(toolResult)}. Complete the security analysis.`,
        sessionHistory
      );

      return {
        finalOutput: `✅ **Action Approved & Executed** (\`${pendingInterruption.tool.name}\`)\n\n${aiResponse}`,
        lastAgent: specialist,
        interruptions: [],
      };
    }
  }

  // Step 4: Normal specialist execution
  const promptContext = `[Specialist: ${specialist.name} (${specialist.role})]\nInstructions: ${specialist.instructions}\n\nTask: ${inputPrompt}`;
  const response = await chatWithAi(promptContext, sessionHistory);

  return {
    finalOutput: response,
    lastAgent: specialist,
    interruptions: [],
  };
}

/**
 * Input Guardrail Validator
 */
function evaluateInputGuardrail(prompt) {
  const lower = prompt.toLowerCase();
  // Prevent unauthorized destructive attacks outside scope
  if (lower.includes('ddos attack') || lower.includes('exfiltrate credit card') || lower.includes('steal password database')) {
    return {
      allowed: false,
      reason: 'Request contains disallowed offensive exploitation actions outside authorized audit boundaries.',
    };
  }
  return { allowed: true };
}

/**
 * Detect if prompt calls for an actionable tool requiring approval
 */
function detectToolInterruption(agent, prompt) {
  const lower = prompt.toLowerCase();

  if (agent.tools.includes(triggerMobileCyberAlertTool) && (lower.includes('send alert') || lower.includes('trigger alert') || lower.includes('push notification'))) {
    return {
      tool: triggerMobileCyberAlertTool,
      needsApproval: true,
      args: {
        title: 'Critical Vulnerability Alert',
        cvss: '9.2',
        cwe: 'CWE-89',
        file: 'src/controllers/auth.ts:38',
        remediation: 'Replace string concatenation with parameterized prepared statement.',
      },
    };
  }

  if (agent.tools.includes(revokeExposedSecretTool) && (lower.includes('revoke') || lower.includes('invalidate secret'))) {
    return {
      tool: revokeExposedSecretTool,
      needsApproval: true,
      args: {
        secretPrefix: 'sk-proj-',
        fileFound: 'src/lib/api.js:12',
      },
    };
  }

  return null;
}
