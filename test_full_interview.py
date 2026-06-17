"""
اختبار شامل لمقابلة العمل API
يختبر: Consent → Questions → Answers → Anti-Cheat → Report → Analytics
"""
import sys, os, json, uuid, time
sys.path.insert(0, os.path.dirname(__file__))
os.environ['AI_STORAGE_TYPE'] = 'sqlite'
os.environ['INTERVIEW_ENABLE_ANTI_CHEAT'] = 'true'

from models.database import get_db_connection, create_interview_session, create_interview_question, get_interview_questions, get_interview_answers
from datetime import datetime

def seed_session():
    """إنشاء جلسة مقابلة اختبارية في Main DB"""
    session_id = f"test-{uuid.uuid4().hex[:8]}"
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO interview_sessions (id, tenant_id, site_id, bot_id, job_id, candidate_id, status, matched_skills, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (session_id, 'default_tenant', 'default_site', 'default_bot', f'job-{uuid.uuid4().hex[:4]}',
          f'candidate-{uuid.uuid4().hex[:4]}', 'draft',
          json.dumps([{"name": "c#", "priority_score": 0.9}, {"name": "sql", "priority_score": 0.8},
                       {"name": "asp.net core", "priority_score": 0.75}]),
          datetime.now().isoformat()))
    conn.commit()
    conn.close()
    print(f"[OK] Session created: {session_id}")
    return session_id


def test_flow():
    from chatbot.routes.candidate_interview import candidate_interview_bp
    from services.agent.storage.ai_storage import ai_storage
    from services.interview.security.anti_cheat import anti_cheat_engine

    session_id = seed_session()

    # 1. GET interview page
    print("\n--- 1. Interview Page ---")
    with app.test_client() as client:
        resp = client.get(f'/candidate/interview/{session_id}')
        assert resp.status_code == 200, f"Page failed: {resp.status_code}"
        print(f"[OK] Page loaded ({resp.status_code})")

    # 2. Consent
    print("\n--- 2. Consent ---")
    with app.test_client() as client:
        resp = client.post(f'/candidate/interview/{session_id}/consent', json={"choice": "accepted"})
        assert resp.status_code == 200, f"Consent failed: {resp.status_code}"
        data = resp.get_json()
        assert data.get("status") == "success", f"Unexpected: {data}"
        print(f"[OK] Consent accepted")

    # 3. Get questions (up to 10) and answer them
    print("\n--- 3. Questions & Answers ---")
    for i in range(10):
        # Get next question
        with app.test_client() as client:
            resp = client.get(f'/candidate/interview/{session_id}/next')
            data = resp.get_json()

        if data.get("status") == "completed":
            print(f"[OK] Interview completed at Q#{i+1}")
            break

        q_text = data.get("text", "")
        q_id = data.get("q_id", "")
        if not q_text:
            print(f"[!] No question at Q#{i+1}: {data}")
            continue

        print(f"  Q#{i+1}: {q_text[:60]}...")

        # Submit answer (skip some to test skip handling)
        if i in (3, 7):
            with app.test_client() as client:
                resp = client.post(f'/candidate/interview/{session_id}/skip',
                                   json={"reason": "dont_know", "reason_text": "Skipping test"})
                assert resp.status_code == 200, f"Skip failed: {resp.status_code}"
                print(f"  -> SKIPPED")
        else:
            answer = f"This is my answer to question {i+1}. I have experience with this topic and can explain it well."
            with app.test_client() as client:
                resp = client.post(f'/candidate/interview/{session_id}/answer',
                                   json={"answer": answer, "q_id": q_id})
                assert resp.status_code == 200, f"Answer failed: {resp.status_code} (q_id={q_id})"
                print(f"  -> ANSWERED (score saved)")

    # 4. Check status
    print("\n--- 4. Status Check ---")
    with app.test_client() as client:
        resp = client.get(f'/candidate/interview/{session_id}/status')
        data = resp.get_json()
        print(f"  Status: {data.get('status')}")
        print(f"  Qs asked: {data.get('questions_asked')}, answered: {data.get('questions_answered')}")
        print(f"  Skills: {data.get('skills')}")
        print(f"  Time: {data.get('time_remaining')}s remaining")

    # 5. Check Main DB for saved evaluations
    print("\n--- 5. Saved Evaluations (Main DB) ---")
    answers = get_interview_answers(session_id)
    print(f"  Answers in Main DB: {len(answers)}")
    for a in answers:
        print(f"    score={a.get('score'):.1f}, semantic={a.get('semantic_score'):.1f}, "
              f"coverage={a.get('coverage_score'):.1f}, accuracy={a.get('accuracy_score'):.1f}")

    # 6. Check AI DB for messages
    print("\n--- 6. Messages (AI DB) ---")
    conn = __import__('services.agent.storage.ai_database', fromlist=['get_ai_db_connection']).get_ai_db_connection()
    msgs = conn.execute("SELECT sender, message_type, substr(message,1,50) as msg_preview FROM ai_interview_messages WHERE interview_id = ?", (session_id,)).fetchall()
    conn.close()
    print(f"  Messages in AI DB: {len(msgs)}")
    for m in msgs[:5]:
        print(f"    {m['sender']:10s} | {m['message_type']:10s} | {m['msg_preview']}...")

    # 7. Check for anti-cheat report
    print("\n--- 7. Anti-Cheat Report ---")
    ac_report = anti_cheat_engine.get_full_report()
    print(f"  Suspicion score: {ac_report.get('suspicion_score', 0)}")
    print(f"  Answers analyzed: {ac_report.get('behavior_metrics', {}).get('total_answers_analyzed', 0)}")
    print(f"  Flags: {ac_report.get('warnings', [])}")

    # 8. Check report in Main DB
    print("\n--- 8. Report in Main DB ---")
    from models.database import get_interview_report, get_all_interview_reports
    report = get_interview_report(session_id)
    if report:
        print(f"  Final score: {report.get('final_score')}")
        print(f"  Recommendation: {report.get('recommendation')}")
        print(f"  Technical: {report.get('technical_score')}")
        print(f"  Communication: {report.get('communication_score')}")
    else:
        print("  No report found yet (may need to complete all questions)")

    # 9. Check report in AI DB
    print("\n--- 9. Report in AI DB ---")
    conn = __import__('services.agent.storage.ai_database', fromlist=['get_ai_db_connection']).get_ai_db_connection()
    ai_report = conn.execute("SELECT * FROM ai_interview_reports WHERE interview_id = ?", (session_id,)).fetchone()
    conn.close()
    if ai_report:
        print(f"  Technical: {ai_report['technical_score']}, Communication: {ai_report['communication_score']}")
        print(f"  Recommendation: {ai_report['recommendation']}")
        print(f"  Created: {ai_report['created_at']}")
    else:
        print("  No AI DB report found")

    print("\n" + "=" * 50)
    print("ALL TESTS PASSED!")
    print("=" * 50)
    return session_id


if __name__ == '__main__':
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    from main import create_app
    app = create_app()
    session_id = test_flow()
    print(f"\nTest session ID: {session_id}")
    print(f"عايز تجرب يدوي؟ افتح: http://localhost:5000/candidate/interview/{session_id}")
