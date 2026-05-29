from services.agent.storage.ai_database import init_ai_db
import os
import sys

# Add current dir to path
sys.path.append(os.getcwd())

print("Initializing AI Database...")
init_ai_db()
print("AI Database initialized.")
