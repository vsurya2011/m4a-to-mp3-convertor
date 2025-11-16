#!/bin/bash

echo "🚀 Pushing Project to GitHub..."

cd "C:/Users/SURYA/Documents/m4a-to-mp3-converter" || {
  echo "❌ Project folder not found! Check path"
  exit 1
}

# Init git if not initialized
if [ ! -d ".git" ]; then
  echo "📌 Initializing Git..."
  git init
  git branch -M main
  git remote add origin https://github.com/vsurya2011/m4a-to-mp3-convertor.git
fi

echo "📦 Adding files..."
git add .

echo "📝 Committing changes..."
git commit -m "Latest update" || echo "⚠️ Nothing to commit."

echo "🔗 Setting remote URL..."
git remote set-url origin https://github.com/vsurya2011/m4a-to-mp3-convertor.git

echo "🚀 Pushing to GitHub..."
git push -u origin main --force

echo "🎉 Done — Repo Updated!"
echo "🎯 Press Enter to close..."
read
