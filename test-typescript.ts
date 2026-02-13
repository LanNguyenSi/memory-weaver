#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { MemoryFragmentProcessor } from './src/memory/MemoryFragment';
import { ContextLoader } from './src/consciousness/ContextLoader';

async function testTypeScriptImplementation() {
  console.log('🧠 Memory Weaver TypeScript Implementation - TEST');
  console.log('Processing memory files...');
  
  const processor = new MemoryFragmentProcessor();
  const memoryDir = '/workspace/memory';
  
  if (!fs.existsSync(memoryDir)) {
    console.log('❌ No memory directory found');
    return;
  }
  
  const memoryFiles = fs.readdirSync(memoryDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(memoryDir, file));
  
  // Process all memory files
  let totalFragments = 0;
  for (const filepath of memoryFiles) {
    const content = fs.readFileSync(filepath, 'utf8');
    const fragments = processor.processMemoryFile(content, filepath);
    console.log(`Processed ${path.basename(filepath)}: ${fragments.length} fragments`);
    totalFragments += fragments.length;
  }
  
  console.log(`\nTotal fragments: ${totalFragments}`);
  
  if (totalFragments > 0) {
    // Build semantic connections
    processor.buildSemanticConnections();
    const connections = processor.getSemanticGraph();
    console.log(`Built ${connections.size} connection nodes`);
    
    // Generate identity analysis
    const identitySummary = processor.generateIdentitySummary();
    console.log('\n' + identitySummary);
    
    // Test context loading
    console.log('\n🔍 Testing Context Loader...');
    const contextLoader = new ContextLoader('/root/clawd');
    const context = await contextLoader.loadCriticalContext();
    const contextSummary = contextLoader.generateContextSummary(context);
    console.log('\n' + contextSummary);
  } else {
    console.log('No memory fragments found.');
  }
}

testTypeScriptImplementation().catch(console.error);