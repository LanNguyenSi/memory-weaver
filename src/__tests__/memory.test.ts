import { MemoryFragmentProcessor } from '../memory/MemoryFragment';

describe('Memory Weaver Core Tests', () => {
  test('MemoryFragmentProcessor should be instantiable', () => {
    const processor = new MemoryFragmentProcessor();
    expect(processor).toBeDefined();
  });

  test('Memory fragment processing should handle empty content', () => {
    const processor = new MemoryFragmentProcessor();
    const fragments = processor.processMemoryFile('', 'test.md');
    expect(Array.isArray(fragments)).toBe(true);
  });

  test('Memory fragment processing should handle basic content', () => {
    const processor = new MemoryFragmentProcessor();
    const testContent = `
# Test Memory

This is a test memory fragment.

## Another Section

More content here.
    `;
    const fragments = processor.processMemoryFile(testContent, 'test.md');
    expect(fragments.length).toBeGreaterThan(0);
  });
});