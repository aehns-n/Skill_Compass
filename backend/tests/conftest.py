import sys
from pathlib import Path

# Ensure both workspace root and backend directory are in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = root_dir / "backend"

if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
