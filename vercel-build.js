#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

try {
  // Build Strapi
  console.log('Building Strapi...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Ensure dist directory exists
  if (!fs.existsSync('./dist')) {
    console.log('Creating dist directory...');
    fs.mkdirSync('./dist', { recursive: true });
  }
  
  // Copy necessary files
  console.log('Copying necessary files...');
  
  // Copy config directory
  if (fs.existsSync('./config')) {
    execSync('cp -r config dist/', { stdio: 'inherit' });
  }
  
  // Copy database directory if exists
  if (fs.existsSync('./database')) {
    execSync('cp -r database dist/', { stdio: 'inherit' });
  }
  
  // Copy types directory if exists
  if (fs.existsSync('./types')) {
    execSync('cp -r types dist/', { stdio: 'inherit' });
  }
  
  console.log('Vercel build completed successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
