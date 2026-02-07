#!/bin/bash

# Batch fix dark mode colors in auth pages

FILES=(
    "src/app/auth/login/page.tsx"
    "src/app/auth/signup/page.tsx"
)

echo "Fixing dark mode colors in auth pages..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Replace input backgrounds
        sed -i '' 's/bg-gray-50/bg-muted/g' "$file"
        
        # Replace divider backgrounds
        sed -i '' 's/bg-gray-200/bg-border/g' "$file"
        
        # Replace tab list background
        sed -i '' 's/bg-gray-100/bg-muted/g' "$file"
        
        echo "✓ Fixed $file"
    else
        echo "⚠ File not found: $file"
    fi
done

echo "✅ All auth pages updated for dark mode!"
