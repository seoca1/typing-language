#!/bin/bash

# Wrapper script to run generate_characters.py with venv

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate virtual environment
source "$SCRIPT_DIR/venv/bin/activate"

# Run Python script with all arguments
python3 "$SCRIPT_DIR/generate_characters.py" "$@"

# Deactivate venv
deactivate
