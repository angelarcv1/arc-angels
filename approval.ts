/**
 * ARS ANGEL - Approval Manager
 * Commit 5: Human-in-the-loop approval workflow
 * 10/02/2026
 */

import {
  ApprovalMode,
  ApprovalThreshold,
  ApprovalRequest,
  Task,
  AgentEvent,
  AgentEventHandler,
} from './types';

export class ApprovalManager {
  private mode: ApprovalMode;
  private threshold?: ApprovalThreshold;
  private pending: Map<string, ApprovalRequest> = new Map();
  private eventHandler?: AgentEventHandler;

  constructor(mode: ApprovalMode, threshold?: ApprovalThreshold) {
    this.mode = mode;
    this.threshold = threshold;
  }

  setEventHandler(handler: AgentEventHandler): void {
    this.eventHandler = handler;
  }

  async requestApproval(task: Task, services: string[]): Promise<boolean> {
    if (this.mode === 'auto') return true;

    if (this.mode === 'threshold' && this.threshold) {
      const trusted = services.every((s) => this.threshold!.trustedServices.includes(s));
      if (trusted) return true;
    }

    // Need manual approval
    const request: ApprovalRequest = {
      taskId: task.id,
      action: task.payload.action,
      services,
      expiresAt: Date.now() + 300000,
    };

    this.pending.set(task.id, request);
    this.emit({ type: 'approval_required', request });

    return this.waitForApproval(task.id);
  }

  approve(taskId: string): void {
    this.pending.delete(taskId);
  }

  reject(taskId: string): void {
    this.pending.delete(taskId);
  }

  private async waitForApproval(taskId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (!this.pending.has(taskId)) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(check);
        this.pending.delete(taskId);
        resolve(false);
      }, 300000);
    });
  }

  private emit(event: AgentEvent): void {
    this.eventHandler?.(event);
  }
}
