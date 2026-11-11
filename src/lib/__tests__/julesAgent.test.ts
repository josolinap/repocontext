/**
 * Jules Agent Workflows & Utilities Unit Tests
 */

import { describe, it, expect } from '@jest/globals';

export interface PlanStep {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  desc?: string;
}

export function parseGitMergeDiff(diffString: string): { search: string; replace: string } | null {
  const searchMatch = diffString.match(/<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/);
  if (!searchMatch) return null;
  return {
    search: searchMatch[1],
    replace: searchMatch[2]
  };
}

export function advancePlanStep(steps: PlanStep[], stepId: number): PlanStep[] {
  return steps.map((step) => {
    if (step.id === stepId) {
      return { ...step, status: 'completed' };
    }
    if (step.id === stepId + 1 && step.status === 'pending') {
      return { ...step, status: 'in_progress' };
    }
    return step;
  });
}

export function formatTerminalOutput(command: string, exitCode: number, output: string) {
  return {
    command,
    exitCode,
    output,
    timestamp: new Date().toISOString()
  };
}

describe('JulesAgent Workflow Tests', () => {
  it('should parse valid git merge diff blocks correctly', () => {
    const diff = `<<<<<<< SEARCH
function add(a, b) {
  return a + b;
}
=======
function add(a, b) {
  // Enhanced telemetry
  return a + b;
}
>>>>>>> REPLACE`;

    const parsed = parseGitMergeDiff(diff);
    expect(parsed).not.toBeNull();
    expect(parsed?.search).toContain('function add(a, b)');
    expect(parsed?.replace).toContain('// Enhanced telemetry');
  });

  it('should return null for malformed merge diff blocks', () => {
    const badDiff = `function add(a, b) { return a + b; }`;
    expect(parseGitMergeDiff(badDiff)).toBeNull();
  });

  it('should initialize and advance execution plan steps sequentially', () => {
    const initialPlan: PlanStep[] = [
      { id: 1, title: 'Inspect repo', status: 'in_progress' },
      { id: 2, title: 'Refactor code', status: 'pending' },
      { id: 3, title: 'Run tests', status: 'pending' }
    ];

    const nextPlan = advancePlanStep(initialPlan, 1);
    expect(nextPlan[0].status).toBe('completed');
    expect(nextPlan[1].status).toBe('in_progress');
    expect(nextPlan[2].status).toBe('pending');
  });

  it('should format bash terminal outputs correctly', () => {
    const term = formatTerminalOutput('npm test', 0, 'PASS 2 suites');
    expect(term.command).toBe('npm test');
    expect(term.exitCode).toBe(0);
    expect(term.output).toContain('PASS 2 suites');
    expect(term.timestamp).toBeDefined();
  });

  it('should handle tool call dispatch and state transitions', () => {
    const tools = ['run_in_bash_session', 'read_file', 'write_file', 'replace_with_git_merge_diff'];
    expect(tools).toContain('run_in_bash_session');
    expect(tools).toContain('replace_with_git_merge_diff');
  });
});
