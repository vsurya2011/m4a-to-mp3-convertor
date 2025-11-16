#!/bin/bash
PROJECT="/c/Users/SURYA/Documents/m4a-to-mp3-converter"

cd "$PROJECT" || { echo "❌ Path error!"; read; exit; }

echo "📦 Adding everything..."
git add -A

echo "📝 Auto commit..."
git commit -m "🚀 Auto update" 2>/dev/null || echo "⚠ No changes to commit"

echo "🌍 Setting remote..."
git remote set-url origin https://github.com/vsurya2011/M4A-to-MP3-convertor.git

echo "🚀 Pushing to GitHub..."
git push origin main

echo "🎉 Done! Render auto deploy triggered."
read -p "Press Enter to close..."
