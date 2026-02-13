#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

// Temporary script to build only core components
// Excludes problematic frontend files until they can be properly fixed

console.log('🔧 Building Memory Weaver Core (excluding frontend)...');

// Create temporary tsconfig that excludes frontend
const tempConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules", 
    "dist", 
    "**/*.test.ts", 
    "**/*.test.tsx",
    "src/frontend/**/*",
    "src/**/*.tsx"
  ]
};

fs.writeFileSync('tsconfig.temp.json', JSON.stringify(tempConfig, null, 2));

exec('npx tsc --project tsconfig.temp.json', (error, stdout, stderr) => {
  fs.unlinkSync('tsconfig.temp.json');
  
  if (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.warn('⚠️ Build warnings:', stderr);
  }
  
  console.log('✅ Core build successful!');
  console.log(stdout);
  process.exit(0);
});