#!/usr/bin/env python3
"""Get framework IDs for GitHub Actions matrix."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))
from common import get_frameworks

def main():
    frameworks = get_frameworks()
    framework_ids = [fw['id'] for fw in frameworks]
    print(','.join(framework_ids))

if __name__ == '__main__':
    main()