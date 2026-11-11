/**
 * Jules Autonomous Software Engineering Agent Engine & Tool Registry
 * Ported system definitions, tool interfaces, memory store, and patch executor.
 */

export interface AgentToolDeclaration {
  name: string;
  category: 'workspace' | 'planning' | 'verification' | 'collaboration' | 'knowledge';
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, {
      type: string;
      description: string;
      items?: { type: string };
    }>;
    required?: string[];
  };
}

export interface PlanStepItem {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  desc?: string;
}

export interface MemoryRecord {
  id: string;
  key: string;
  content: string;
  category: string;
  timestamp: string;
}

export interface KnowledgeEntry {
  topic: string;
  snippet: string;
  tags: string[];
}

export const JULES_PORTED_TOOLS: AgentToolDeclaration[] = [
  {
    name: 'run_in_bash_session',
    category: 'workspace',
    description: 'Runs commands in a persistent workspace bash session.',
    parameters: {
      type: 'OBJECT',
      properties: {
        command: { type: 'STRING', description: 'The bash command to run in sandbox.' }
      },
      required: ['command']
    }
  },
  {
    name: 'read_file',
    category: 'workspace',
    description: 'Reads contents of specified repository file.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filepath: { type: 'STRING', description: 'Relative path of file to read.' }
      },
      required: ['filepath']
    }
  },
  {
    name: 'write_file',
    category: 'workspace',
    description: 'Creates new file or overwrites existing file with given content.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filepath: { type: 'STRING', description: 'Relative path of file.' },
        content: { type: 'STRING', description: 'The content to write.' }
      },
      required: ['filepath', 'content']
    }
  },
  {
    name: 'replace_with_git_merge_diff',
    category: 'workspace',
    description: 'Applies targeted search-and-replace using exact git merge diff format.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filepath: { type: 'STRING', description: 'Target file path.' },
        merge_diff: { type: 'STRING', description: 'Diff block containing <<<<<<< SEARCH, =======, and >>>>>>> REPLACE' }
      },
      required: ['filepath', 'merge_diff']
    }
  },
  {
    name: 'list_files',
    category: 'workspace',
    description: 'Lists all files and directories recursively or at given path.',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: { type: 'STRING', description: 'Directory path to list from.' }
      }
    }
  },
  {
    name: 'set_plan',
    category: 'planning',
    description: 'Sets or updates the structured execution plan.',
    parameters: {
      type: 'OBJECT',
      properties: {
        plan: { type: 'STRING', description: 'Markdown numbered plan steps.' }
      },
      required: ['plan']
    }
  },
  {
    name: 'request_plan_review',
    category: 'planning',
    description: 'Submits proposed plan to safety and verification reviewer before activation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        plan: { type: 'STRING', description: 'The plan proposed for review.' }
      },
      required: ['plan']
    }
  },
  {
    name: 'plan_step_complete',
    category: 'planning',
    description: 'Marks active plan step as complete after verified outcome.',
    parameters: {
      type: 'OBJECT',
      properties: {
        message: { type: 'STRING', description: 'Succinct message of actions completed.' }
      },
      required: ['message']
    }
  },
  {
    name: 'pre_commit_instructions',
    category: 'verification',
    description: 'Fetches required pre-commit checks and validation gates.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  },
  {
    name: 'request_code_review',
    category: 'verification',
    description: 'Submits workspace changes for automated code review against standards.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  },
  {
    name: 'knowledgebase_lookup',
    category: 'knowledge',
    description: 'Retrieves tips, framework patterns, and environment troubleshooting data.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Free-text lookup query.' }
      },
      required: ['query']
    }
  },
  {
    name: 'initiate_memory_recording',
    category: 'knowledge',
    description: 'Records critical context and guidelines for future execution loops.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  },
  {
    name: 'request_user_input',
    category: 'collaboration',
    description: 'Prompts user for guidance or answers when encountering ambiguity.',
    parameters: {
      type: 'OBJECT',
      properties: {
        message: { type: 'STRING', description: 'Question or prompt for user.' }
      },
      required: ['message']
    }
  },
  {
    name: 'submit',
    category: 'collaboration',
    description: 'Finalizes and commits workspace changes after verification passes.',
    parameters: {
      type: 'OBJECT',
      properties: {
        branch_name: { type: 'STRING', description: 'Target branch name.' },
        title: { type: 'STRING', description: 'Submission title.' },
        commit_message: { type: 'STRING', description: 'Commit log message.' },
        description: { type: 'STRING', description: 'Detailed PR summary.' }
      },
      required: ['branch_name', 'title', 'commit_message', 'description']
    }
  }
];

export const JULES_KNOWLEDGEBASE: KnowledgeEntry[] = [
  {
    topic: 'Git Merge Diff Syntax',
    snippet: 'Merge diffs require exact markers: <<<<<<< SEARCH, =======, and >>>>>>> REPLACE. Search block must match original source verbatim.',
    tags: ['git', 'merge-diff', 'refactor']
  },
  {
    topic: 'Test Execution Best Practices',
    snippet: 'Run tests with isolated sessions. Never commit without running all relevant automated test suites and confirming 100% pass.',
    tags: ['testing', 'jest', 'vitest']
  },
  {
    topic: 'Pre-Commit Instructions',
    snippet: 'Ensure proper testing, verification, review, and reflection are done before calling submit.',
    tags: ['pre-commit', 'verification', 'standards']
  },
  {
    topic: 'Autonomy and Safety Boundaries',
    snippet: 'Never execute destructive operations without confirmation. Prompt user when ambiguous instructions are received.',
    tags: ['safety', 'autonomy', 'guardrails']
  }
];

/**
 * Applies a git merge diff string to existing file content.
 */
export function applyGitMergeDiff(original: string, diffText: string): { success: boolean; result?: string; error?: string } {
  const searchMarker = '<<<<<<< SEARCH';
  const dividerMarker = '=======';
  const replaceMarker = '>>>>>>> REPLACE';

  const searchIndex = diffText.indexOf(searchMarker);
  const dividerIndex = diffText.indexOf(dividerMarker);
  const replaceIndex = diffText.indexOf(replaceMarker);

  if (searchIndex === -1 || dividerIndex === -1 || replaceIndex === -1) {
    return { success: false, error: 'Malformed merge diff: missing conflict markers.' };
  }

  const searchBlock = diffText.substring(searchIndex + searchMarker.length, dividerIndex).replace(/^\r?\n/, '').replace(/\r?\n$/, '');
  const replaceBlock = diffText.substring(dividerIndex + dividerMarker.length, replaceIndex).replace(/^\r?\n/, '').replace(/\r?\n$/, '');

  if (!original.includes(searchBlock)) {
    return { success: false, error: 'Search block not found in target file.' };
  }

  const updated = original.replace(searchBlock, replaceBlock);
  return { success: true, result: updated };
}

/**
 * Searches the Jules Knowledgebase
 */
export function queryKnowledgebase(query: string): KnowledgeEntry[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return JULES_KNOWLEDGEBASE;
  return JULES_KNOWLEDGEBASE.filter(
    (entry) =>
      entry.topic.toLowerCase().includes(lower) ||
      entry.snippet.toLowerCase().includes(lower) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}

/**
 * Memory Store for Agent Sessions
 */
export class JulesAgentSessionManager {
  private memories: MemoryRecord[] = [];

  constructor() {
    this.memories.push({
      id: 'mem-1',
      key: 'architecture',
      content: 'Repository Context Generator uses React + TypeScript + Vite + MUI + Jest',
      category: 'system',
      timestamp: new Date().toISOString()
    });
  }

  getMemories(): MemoryRecord[] {
    return [...this.memories];
  }

  recordMemory(key: string, content: string, category: string = 'general'): MemoryRecord {
    const record: MemoryRecord = {
      id: `mem-${Date.now()}`,
      key,
      content,
      category,
      timestamp: new Date().toISOString()
    };
    this.memories.push(record);
    return record;
  }

  clearMemories(): void {
    this.memories = [];
  }
}
