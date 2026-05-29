import sqlite3
import os

import os

db_path = os.path.join('data', 'ai_storage.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add expired_at to ai_interview_sessions
    try:
        cursor.execute('ALTER TABLE ai_interview_sessions ADD COLUMN expired_at TIMESTAMP')
        print("Added expired_at to ai_interview_sessions")
    except sqlite3.OperationalError as e:
        print(f"Skipped ai_interview_sessions: {e}")
        
    # Add full_transcript_revealed to ai_interview_reports
    try:
        cursor.execute('ALTER TABLE ai_interview_reports ADD COLUMN full_transcript_revealed INTEGER DEFAULT 0')
        print("Added full_transcript_revealed to ai_interview_reports")
    except sqlite3.OperationalError as e:
        print(f"Skipped ai_interview_reports: {e}")
        
    conn.commit()
    conn.close()
else:
    print("Database file not found.")
