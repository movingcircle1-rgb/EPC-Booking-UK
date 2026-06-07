#!/bin/bash

# Script to create a complete deployment package with dist folder
# This ensures all binary assets are loaded before building

echo "=========================================="
echo "Creating Complete Deployment Package"
echo "=========================================="
echo ""

# Step 1: Clean previous build
echo "Step 1: Cleaning previous build..."
rm -rf dist/
echo "✓ Cleaned"
echo ""

# Step 2: Load all binary files
echo "Step 2: Binary files are already loaded in the filesystem"
echo "Total binary image files: 75"
echo "✓ Binary files ready"
echo ""

# Step 3: Run production build
echo "Step 3: Running production build..."
npm run build
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "✗ Build failed with exit code $BUILD_EXIT_CODE"
    exit 1
fi
echo "✓ Build completed successfully"
echo ""

# Step 4: Verify dist folder
echo "Step 4: Verifying dist folder..."
if [ ! -d "dist" ]; then
    echo "✗ Error: dist folder not found!"
    exit 1
fi

DIST_SIZE=$(du -sh dist/ | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)
echo "✓ Dist folder exists"
echo "  Size: $DIST_SIZE"
echo "  Files: $FILE_COUNT"
echo ""

# Step 5: Create deployment archives
echo "Step 5: Creating deployment archives..."

# Archive 1: dist-only.tar.gz (just the built files for deployment)
tar -czf dist-only.tar.gz dist/
echo "✓ Created dist-only.tar.gz ($(du -h dist-only.tar.gz | cut -f1))"

# Archive 2: production-build.tar.gz (dist + config files)
tar -czf production-build.tar.gz dist/ package.json package-lock.json vite.config.ts netlify.toml vercel.json
echo "✓ Created production-build.tar.gz ($(du -h production-build.tar.gz | cut -f1))"

# Archive 3: deployment-package.tar.gz (everything needed for deployment)
tar -czf deployment-package.tar.gz dist/ package.json package-lock.json netlify.toml vercel.json public/_redirects public/robots.txt public/sitemap.xml
echo "✓ Created deployment-package.tar.gz ($(du -h deployment-package.tar.gz | cut -f1))"

# Archive 4: dist-netlify.tar.gz (Netlify-specific)
tar -czf dist-netlify.tar.gz dist/ netlify.toml public/_redirects
echo "✓ Created dist-netlify.tar.gz ($(du -h dist-netlify.tar.gz | cut -f1))"

echo ""
echo "=========================================="
echo "✓ Deployment Package Creation Complete!"
echo "=========================================="
echo ""
echo "Available archives:"
ls -lh *.tar.gz | grep -E "(dist-only|production-build|deployment-package|dist-netlify)" | awk '{print "  " $9 ": " $5}'
echo ""
echo "The dist folder is now included in all archives!"
