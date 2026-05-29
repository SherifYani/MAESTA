"""
Test Multi-Tenant Chat System
"""
import sys
sys.path.insert(0, '.')

from models import database

print("=" * 60)
print("TEST: Multi-Tenant Chat System")
print("=" * 60)

# Step 1: Create a test company
print("\n[1] Creating test company...")
company_id = database.create_company(
    name="test-company-demo",
    slug="test-demo",
    description="Demo company for testing",
    business_type="Tech company",
    platform_type="website",
    language="ar",
)
print(f"    OK - Company created: {company_id}")

# Step 2: Create API key for the company
print("\n[2] Creating API key for company...")
key_result = database.create_api_key(
    name="Test Key",
    rate_limit=60,
    company_id=company_id,
)
api_key = key_result['key']
print(f"    OK - API Key: {api_key[:16]}...")

# Step 3: Verify API key has company_id
print("\n[3] Verifying API key company binding...")
key_info = database.verify_api_key(api_key)
if key_info and key_info.get('company_id') == company_id:
    print(f"    OK - API key bound to company: {key_info['company_id']}")
else:
    print(f"    FAIL - API key NOT bound to company!")
    sys.exit(1)

# Step 4: Verify company profile loads
print("\n[4] Verifying company profile...")
from services.agent.agents.company_prompt import get_company_profile
profile = get_company_profile(company_id)
print(f"    OK - Company name: {profile['company_name']}")
print(f"    OK - Business type: {profile['business_type']}")
print(f"    OK - Language: {profile['language']}")

# Step 5: Test the chat API
print("\n[5] Testing chat API...")
import requests
try:
    response = requests.post(
        "http://localhost:5000/api/v1/chat",
        headers={"X-API-Key": api_key},
        json={
            "question": "hello, who are you?",
            "use_rag": True,
        },
        timeout=120,
    )
    if response.status_code == 200:
        data = response.json()
        print(f"    OK - Response received!")
        print(f"    OK - Answer: {data.get('answer', 'N/A')[:100]}...")
        print(f"    OK - Source type: {data.get('source_type', 'N/A')}")
    else:
        print(f"    FAIL - HTTP {response.status_code}: {response.text[:200]}")
except requests.exceptions.ConnectionError:
    print("    WARN - Server not running. Start it with: python main.py")
except Exception as e:
    print(f"    FAIL - Error: {e}")

# Step 6: List all companies
print("\n[6] Listing all companies...")
companies = database.get_all_companies()
for c in companies:
    print(f"    - {c['name']} (slug: {c['slug']}, active: {c['is_active']})")

print("\n" + "=" * 60)
print("TEST COMPLETE!")
print("=" * 60)
