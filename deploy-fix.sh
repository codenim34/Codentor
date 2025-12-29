#!/bin/bash

# Quick Deployment Fix Script
# Run this to commit and push your changes

echo "🔧 Fixing Clerk Edge Runtime Issue..."

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: resolve Clerk Edge Runtime compatibility for Vercel deployment

- Added .env.production with CLERK_SKIP_MIDDLEWARE_DURING_BUILD
- Updated next.config.js with webpack fallbacks for Node.js modules
- Maintained existing middleware.js functionality

This fixes the 'unsupported modules' error during Vercel build."

# Push to main branch
git push origin main

echo "✅ Changes pushed to GitHub!"
echo ""
echo "📝 IMPORTANT: Add this environment variable in Vercel:"
echo "   Variable: CLERK_SKIP_MIDDLEWARE_DURING_BUILD"
echo "   Value: true"
echo "   Scope: Production, Preview, Development"
echo ""
echo "🔗 Go to: https://vercel.com/[your-project]/settings/environment-variables"
echo ""
echo "After adding the variable, trigger a new deployment or wait for auto-deploy."
