#!/bin/bash

# IG Career Coach API - GitHub Deployment Script
# This script pushes all code to your GitHub repository

echo "🚀 Deploying IG Career Coach API to GitHub..."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Navigate to deployment package
cd "$(dirname "$0")"

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add remote if not exists
if ! git remote | grep -q origin; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/theignetwork/ig-career-coach.git
fi

# Stage all files
echo "📝 Staging files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit: IG Career Coach API with context-aware chat system

Features:
- Main chat endpoint with Anthropic Claude integration
- Conversation history endpoint
- Context-aware system prompts for 6 tools
- Supabase database integration
- Full error handling and CORS
- Production-ready serverless functions"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ SUCCESS! Code pushed to GitHub!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to: https://app.netlify.com/projects/ig-career-coach-api"
echo "2. Click 'Set up a new deploy'"
echo "3. Choose 'Import from Git'"
echo "4. Select your repository: theignetwork/ig-career-coach"
echo "5. Netlify will auto-detect settings and deploy!"
echo ""
echo "📝 Don't forget to add environment variables in Netlify:"
echo "   - ANTHROPIC_API_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_KEY"
echo ""
echo "🎉 You're almost there!"
