#!/usr/bin/env python3
"""
Convert JPEG images (with .png extension) to actual PNG with transparent background.

This script:
1. Reads images (even if they're JPEG with .png extension)
2. Removes white/light backgrounds
3. Saves as proper PNG with transparency
"""

import os
import sys
from PIL import Image
import numpy as np

def remove_white_background(image_path, output_path=None, threshold=240):
    """
    Remove white background from image and save as PNG with transparency.
    
    Args:
        image_path: Path to input image
        output_path: Path to output PNG (default: same as input, with .png extension)
        threshold: White threshold (0-255, higher = more aggressive)
    """
    if output_path is None:
        # Change extension to .png
        base = os.path.splitext(image_path)[0]
        output_path = base + '.png'
    
    # Open image (handles both JPEG and PNG)
    img = Image.open(image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Convert to numpy array
    data = np.array(img)
    
    # Get RGB channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Create mask: white pixels (R, G, B all > threshold)
    white_mask = (r > threshold) & (g > threshold) & (b > threshold)
    
    # Set alpha to 0 for white pixels (make transparent)
    data[:,:,3] = np.where(white_mask, 0, 255)
    
    # Create new image from modified data
    result = Image.fromarray(data, mode='RGBA')
    
    # Save as PNG
    result.save(output_path, 'PNG', optimize=True)
    
    print(f"✓ Converted: {os.path.basename(image_path)} → {os.path.basename(output_path)}")
    print(f"  Original format: {Image.open(image_path).format}")
    print(f"  New format: PNG (RGBA)")
    print(f"  Size: {result.size}")
    
    # Delete original if it's JPEG/JPG and different from output
    if output_path != image_path and os.path.exists(image_path):
        ext = os.path.splitext(image_path)[1].lower()
        if ext in ['.jpg', '.jpeg']:
            os.remove(image_path)
            print(f"  ✓ Deleted original JPEG: {os.path.basename(image_path)}")
    
    return result

def batch_convert(directory, patterns=['*.png', '*.jpg', '*.jpeg'], threshold=240):
    """
    Convert all images in directory matching patterns.
    
    Args:
        directory: Directory containing images
        patterns: File patterns (e.g., ['*.png', '*.jpg', '*.jpeg'])
        threshold: White removal threshold
    """
    import glob
    
    # Support multiple patterns
    if isinstance(patterns, str):
        patterns = [patterns]
    
    files = []
    for pattern in patterns:
        files.extend(glob.glob(os.path.join(directory, pattern)))
    
    if not files:
        print(f"No files found matching {patterns} in {directory}")
        return
    
    print(f"Found {len(files)} files to convert\n")
    
    for i, filepath in enumerate(sorted(files), 1):
        print(f"[{i}/{len(files)}] Processing {os.path.basename(filepath)}...")
        try:
            remove_white_background(filepath, threshold=threshold)
            print()
        except Exception as e:
            print(f"✗ Error: {e}\n")
            continue
    
    print(f"✓ Completed: {len(files)} files converted to PNG with transparency")

def verify_images(directory, patterns=['*.png']):
    """
    Verify that all images are proper PNG with transparency.
    """
    import glob
    
    # Support multiple patterns
    if isinstance(patterns, str):
        patterns = [patterns]
    
    files = []
    for pattern in patterns:
        files.extend(glob.glob(os.path.join(directory, pattern)))
    
    print("\n" + "="*60)
    print("VERIFICATION REPORT")
    print("="*60 + "\n")
    
    all_valid = True
    
    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        img = Image.open(filepath)
        
        is_png = img.format == 'PNG'
        has_alpha = img.mode == 'RGBA'
        
        status = "✓" if (is_png and has_alpha) else "✗"
        
        print(f"{status} {filename}")
        print(f"   Format: {img.format}")
        print(f"   Mode: {img.mode}")
        print(f"   Size: {img.size}")
        
        if not (is_png and has_alpha):
            all_valid = False
            print(f"   ⚠️  Issue: Not a proper PNG with transparency")
        
        print()
    
    print("="*60)
    if all_valid:
        print("✓ All images are valid PNG with transparency!")
    else:
        print("✗ Some images need fixing")
    print("="*60)

if __name__ == '__main__':
    # Default: Emily's directory
    emily_dir = os.path.join(
        os.path.dirname(__file__),
        '..',
        'prototype',
        'public',
        'characters',
        'en',
        'emily'
    )
    
    emily_dir = os.path.abspath(emily_dir)
    
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = emily_dir
    
    if not os.path.exists(directory):
        print(f"Error: Directory not found: {directory}")
        sys.exit(1)
    
    print("="*60)
    print("PNG CONVERSION TOOL")
    print("="*60)
    print(f"Directory: {directory}\n")
    
    # Convert all image files (PNG, JPG, JPEG)
    batch_convert(directory, ['*.png', '*.jpg', '*.jpeg'], threshold=240)
    
    # Verify results (only PNG should remain)
    verify_images(directory, ['*.png'])
