"""
رفع ملفات hf-space-qwen3 على Hugging Face Spaces تلقائيًا
الاستخدام: python upload_to_hf.py --token YOUR_HF_TOKEN
"""
import argparse
import os
from pathlib import Path

from huggingface_hub import HfApi, create_repo

# ─── Config ─────────────────────────────────────────────────────────────────
REPO_ID    = "aboamin27/maesta-qwen3-1-7b-api"
REPO_TYPE  = "space"
SPACE_SDK  = "docker"
SPACE_FILES = Path(__file__).parent / "hf-space-qwen3"

FILES_TO_UPLOAD = [
    "app.py",
    "requirements.txt",
    "Dockerfile",
    "README.md",
]

# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Upload MAESTA Qwen3 Space to HF")
    parser.add_argument("--token", required=True, help="Hugging Face Access Token (write)")
    args = parser.parse_args()

    api = HfApi(token=args.token)

    # 1. Create the Space (ignore error if already exists)
    print(f"[1/3] Creating Space: {REPO_ID} ...")
    try:
        create_repo(
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            space_sdk=SPACE_SDK,
            token=args.token,
            exist_ok=True,
            private=False,
        )
        print("      Space created (or already exists) [OK]")
    except Exception as e:
        print(f"      Warning: {e}")

    # 2. Upload each file
    print(f"[2/3] Uploading files from: {SPACE_FILES}")
    for fname in FILES_TO_UPLOAD:
        local_path = SPACE_FILES / fname
        if not local_path.exists():
            print(f"      SKIP (not found): {fname}")
            continue

        print(f"      Uploading: {fname} ...", end=" ")
        api.upload_file(
            path_or_fileobj=str(local_path),
            path_in_repo=fname,
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            token=args.token,
            commit_message=f"feat: add {fname}",
        )
        print("[OK]")

    # 3. Done
    print()
    print("[3/3] Done! Space URL:")
    print(f"      https://huggingface.co/spaces/{REPO_ID}")
    print()
    print("Next steps:")
    print("  1. Go to Space Settings -> Secrets and Variables")
    print("  2. Add Secret:   LLM_API_TOKEN = <your-strong-token>")
    print("  3. Add Variables: MODEL_REPO, MODEL_FILE, N_CTX, N_THREADS, MAX_TOKENS_DEFAULT")
    print("  4. Wait 5-10 min for Docker build to complete")
    print()
    print("After build succeeds, update .env:")
    print("  FINETUNED_MODEL_API_KEY=<your-strong-token>")
    print("  UTILITY_MODEL_API_KEY=<your-strong-token>")

if __name__ == "__main__":
    main()
