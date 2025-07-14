#!/usr/bin/env node

/**
 * Setup Validation Script
 * Checks if all required environment variables are configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking project setup...');
console.log('');

const errors = [];
const warnings = [];

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  errors.push('❌ .env.local file not found');
  console.log('📝 Please copy .env.example to .env.local and fill in your values');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Required environment variables
const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXTAUTH_SECRET', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY'];

// Check required variables
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.startsWith('your_') || value.includes('...')) {
    errors.push(`❌ ${varName} is not configured properly`);
  } else {
    console.log(`✅ ${varName} is configured`);
  }
});

// Check optional but recommended variables
const optionalVars = [
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_POSTHOG_KEY'
];

optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.startsWith('your_') || value.includes('...')) {
    warnings.push(`⚠️  ${varName} is not configured (optional)`);
  } else {
    console.log(`✅ ${varName} is configured`);
  }
});

// Check package.json dependencies
console.log('');
console.log('📦 Checking dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'next',
    'react', 
    'tailwindcss',
    '@supabase/supabase-js',
    'typescript'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} is installed`);
    } else {
      errors.push(`❌ ${dep} is missing from dependencies`);
    }
  });
} catch (e) {
  errors.push('❌ Could not read package.json');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  warnings.push('⚠️  node_modules not found - run `npm install`');
}

// Summary
console.log('');
console.log('📋 Setup Summary:');
console.log('');

if (errors.length === 0) {
  console.log('🎉 All required configuration is complete!');
  
  if (warnings.length > 0) {
    console.log('');
    console.log('📝 Optional improvements:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  console.log('');
  console.log('🚀 You can now run:');
  console.log('   npm run dev     # Start development server');
  console.log('   npm run build   # Build for production');
  console.log('   npm run lint    # Check code quality');
  
} else {
  console.log('❌ Setup incomplete. Please fix the following:');
  console.log('');
  errors.forEach(error => console.log(`   ${error}`));
  
  console.log('');
  console.log('📖 For help, check:');
  console.log('   - .env.example file for configuration examples');
  console.log('   - docs/DEVELOPMENT.md for detailed setup guide');
  console.log('   - README.md for getting started instructions');
  
  process.exit(1);
}
