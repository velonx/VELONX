#!/bin/bash

# Batch fix dark mode colors in dashboard pages

FILES=(
    "src/app/dashboard/student/page.tsx"
    "src/app/dashboard/admin/page.tsx"
)

echo "Fixing dark mode colors in dashboard pages..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Replace common backgrounds
        sed -i '' 's/bg-white/bg-card/g' "$file"
        sed -i '' 's/bg-gray-50/bg-muted/g' "$file"
        sed -i '' 's/bg-gray-100/bg-accent/g' "$file"
        sed -i '' 's/bg-gray-200/bg-border/g' "$file"
        
        # Replace text colors
        sed -i '' 's/text-gray-900/text-foreground/g' "$file"
        sed -i '' 's/text-gray-700/text-foreground/g' "$file"
        sed -i '' 's/text-gray-600/text-muted-foreground/g' "$file"
        sed -i '' 's/text-gray-500/text-muted-foreground/g' "$file"
        sed -i '' 's/text-gray-400/text-muted-foreground/g' "$file"
        
        # Replace hover states
        sed -i '' 's/hover:bg-gray-50/hover:bg-muted/g' "$file"
        sed -i '' 's/hover:bg-gray-100/hover:bg-accent/g' "$file"
        
        # Replace borders
        sed -i '' 's/border-gray-200/border-border/g' "$file"
        sed -i '' 's/border-gray-300/border-border/g' "$file"
        
        echo "✓ Fixed $file"
    else
        echo "⚠ File not found: $file"
    fi
done

echo "✅ All dashboard pages updated for dark mode!"
