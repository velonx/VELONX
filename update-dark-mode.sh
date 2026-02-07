#!/bin/bash

# Script to update all page files with dark mode theme-aware classes
# This replaces hardcoded colors with CSS custom property based classes

echo "🎨 Starting dark mode conversion for all pages..."

# List of files to update
FILES=(
  "src/app/about/page.tsx"
  "src/app/api-docs/page.tsx"
  "src/app/apply-mentor/page.tsx"
  "src/app/blog/page.tsx"
  "src/app/career/page.tsx"
  "src/app/community-guidelines/page.tsx"
  "src/app/contact/page.tsx"
  "src/app/events/page.tsx"
  "src/app/leaderboard/page.tsx"
  "src/app/mentors/page.tsx"
  "src/app/notifications/page.tsx"
  "src/app/privacy/page.tsx"
  "src/app/projects/page.tsx"
  "src/app/resources/page.tsx"
  "src/app/settings/page.tsx"
  "src/app/terms/page.tsx"
  "src/app/auth/login/page.tsx"
  "src/app/auth/signup/page.tsx"
  "src/app/dashboard/student/page.tsx"
  "src/app/dashboard/admin/page.tsx"
  "src/app/submit-project/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace background colors
    sed -i '' 's/className="\([^"]*\)bg-white\([^"]*\)"/className="\1bg-background\2"/g' "$file"
    sed -i '' 's/className="\([^"]*\)bg-white /className="\1bg-card /g' "$file"
    
    # Replace borders
    sed -i '' 's/border-gray-100/border-border/g' "$file"
    sed -i '' 's/border-gray-200/border-border/g' "$file"
    sed -i '' 's/border-gray-300/border-border/g' "$file"
    
    # Replace text colors
    sed -i '' 's/text-gray-900/text-foreground/g' "$file"
    sed -i '' 's/text-gray-800/text-foreground/g' "$file"
    sed -i '' 's/text-gray-700/text-foreground/g' "$file"
    sed -i '' 's/text-gray-600/text-muted-foreground/g' "$file"
    sed -i '' 's/text-gray-500/text-muted-foreground/g' "$file"
    sed -i '' 's/text-gray-400/text-muted-foreground/g' "$file"
    
    # Replace hover backgrounds
    sed -i '' 's/hover:bg-gray-50/hover:bg-muted/g' "$file"
    sed -i '' 's/hover:bg-gray-100/hover:bg-muted/g' "$file"
    
    echo "✅ Completed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "🎉 Dark mode conversion complete!"
echo "📦 Backups saved with .bak extension"
echo ""
echo "To restore from backup if needed:"
echo "  for f in src/app/**/*.bak; do mv \"\$f\" \"\${f%.bak}\"; done"
