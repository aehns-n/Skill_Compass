"""
SkillCompass — backend application package.

Bootstraps the project root onto sys.path so that the root-level `ai.prompts`
package (imported by the question generator) resolves no matter which working
directory the server, tests, or dashboard are launched from.
"""

import os
import sys

_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)
