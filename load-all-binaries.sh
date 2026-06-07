#!/bin/bash
# This script lists all binary files that need to be loaded
# These files exist as binaries but show as 20-byte placeholders until loaded

echo "Binary files in this project:"
echo "================================"
echo ""
echo "PUBLIC FOLDER IMAGES:"
find public -type f \( -name "*.png" -o -name "*.webp" -o -name "*.ico" -o -name "*.jpg" \) | sort
echo ""
echo "ARCHIVE FILES:"
ls -1 *.tar.gz 2>/dev/null
echo ""
echo "Total binary files: $(find public -type f \( -name "*.png" -o -name "*.webp" -o -name "*.ico" -o -name "*.jpg" \) | wc -l)"
