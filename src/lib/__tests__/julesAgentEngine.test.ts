import {
  JULES_PORTED_TOOLS,
  JULES_KNOWLEDGEBASE,
  applyGitMergeDiff,
  queryKnowledgebase,
  JulesAgentSessionManager
} from '../julesAgentEngine';

describe('JulesAgentEngine', () => {
  describe('Ported Tools Registry', () => {
    it('should export standard set of Jules tools', () => {
      expect(JULES_PORTED_TOOLS.length).toBeGreaterThanOrEqual(10);
      const names = JULES_PORTED_TOOLS.map((t) => t.name);
      expect(names).toContain('run_in_bash_session');
      expect(names).toContain('read_file');
      expect(names).toContain('write_file');
      expect(names).toContain('replace_with_git_merge_diff');
      expect(names).toContain('set_plan');
      expect(names).toContain('submit');
    });

    it('each tool should have valid schema definitions', () => {
      JULES_PORTED_TOOLS.forEach((tool) => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.parameters).toBeDefined();
        expect(tool.parameters.type).toBe('OBJECT');
      });
    });
  });

  describe('Git Merge Diff Engine', () => {
    it('successfully applies a valid merge diff block', () => {
      const original = 'const value = 42;\nfunction getAnswer() { return value; }';
      const diff = `<<<<<<< SEARCH
function getAnswer() { return value; }
=======
function getAnswer() { return value * 2; }
>>>>>>> REPLACE`;

      const result = applyGitMergeDiff(original, diff);
      expect(result.success).toBe(true);
      expect(result.result).toBe('const value = 42;\nfunction getAnswer() { return value * 2; }');
    });

    it('returns error when conflict markers are missing', () => {
      const original = 'test code';
      const invalidDiff = 'just some random diff text';
      const result = applyGitMergeDiff(original, invalidDiff);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Malformed merge diff/);
    });

    it('returns error when search block is not present in original', () => {
      const original = 'const x = 1;';
      const diff = `<<<<<<< SEARCH
const y = 2;
=======
const y = 3;
>>>>>>> REPLACE`;

      const result = applyGitMergeDiff(original, diff);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Search block not found/);
    });
  });

  describe('Knowledgebase Search', () => {
    it('returns all knowledge entries on empty query', () => {
      const all = queryKnowledgebase('');
      expect(all.length).toEqual(JULES_KNOWLEDGEBASE.length);
    });

    it('filters knowledge entries by search query keywords', () => {
      const results = queryKnowledgebase('merge diff');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].topic).toMatch(/Merge Diff/i);
    });

    it('filters by tag', () => {
      const results = queryKnowledgebase('testing');
      expect(results.some((r) => r.tags.includes('testing'))).toBe(true);
    });
  });

  describe('Session Memory Store', () => {
    it('initializes with default system memory', () => {
      const manager = new JulesAgentSessionManager();
      const memories = manager.getMemories();
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].key).toBe('architecture');
    });

    it('records new memory entries dynamically', () => {
      const manager = new JulesAgentSessionManager();
      const newEntry = manager.recordMemory('frontend-rule', 'Always verify with playwright screenshot', 'verification');
      expect(newEntry.id).toBeDefined();
      expect(manager.getMemories().map((m) => m.key)).toContain('frontend-rule');
    });

    it('clears memories when requested', () => {
      const manager = new JulesAgentSessionManager();
      manager.clearMemories();
      expect(manager.getMemories()).toHaveLength(0);
    });
  });
});
