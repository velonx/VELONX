#!/bin/bash

# Script to remove background gradient blobs from all pages

echo "Removing background gradients from all pages..."

# List of files to update
files=(
    "src/app/mentors/page.tsx"
    "src/app/about/page.tsx"
    "src/app/blog/page.tsx"
    "src/app/leaderboard/page.tsx"
    "src/app/resources/page.tsx"
    "src/app/projects/page.tsx"
    "src/app/community-guidelines/page.tsx"
    "src/app/contact/page.tsx"
    "src/app/career/page.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Remove cyan blob gradient (top-right)
        sed -i '' '/bg-\[#CFF5FF\].*animate-blob-float/d' "$file"
        
        # Remove yellow blob gradient (bottom-left)
        sed -i '' '/bg-\[#FEF3C7\].*animate-blob-float-delayed/d' "$file"
        
        # Remove the comment line if it exists alone
        sed -i '' '/^[[:space:]]*{\/\* Background Blobs.*\*\/}[[:space:]]*$/d' "$file"
        
        echo "✓ Removed gradients from $file"
    else
        echo "✗ File not found: $file"
    fi
done

echo ""
echo "Done! Removed background gradients from all pages."
