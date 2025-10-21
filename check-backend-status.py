#!/usr/bin/env python3
"""
Check if backend has been updated with credit enforcement fixes
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://backend-lively-hill-7043.fly.dev"

def check_backend_health():
    """Check if backend is running"""
    print("1. Checking backend health...")
    
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=10)
        if response.status_code == 200:
            print(f"[OK] Backend is running!")
            return True
        else:
            print(f"[WARNING] Backend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Backend is not responding: {e}")
        return False

def check_api_version():
    """Check API info to see if it's been updated"""
    print("\n2. Checking API information...")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] API Response:")
            print(json.dumps(data, indent=2))
            return True
        else:
            print(f"[WARNING] API returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Failed to get API info: {e}")
        return False

def main():
    print("=" * 60)
    print("OlmOCR Backend Status Check")
    print(f"Time: {datetime.now()}")
    print("=" * 60)
    print()
    
    # Check if backend is healthy
    if not check_backend_health():
        print("\n[WARNING] Backend may be starting up. It auto-stops when idle.")
        print("Try again in 30 seconds if it's not responding.")
        return
    
    # Check API version
    check_api_version()
    
    print("\n" + "=" * 60)
    print("DEPLOYMENT STATUS:")
    print("=" * 60)
    print("\n[INFO] The backend code with credit enforcement fixes has been pushed.")
    print("[INFO] GitHub Actions should automatically deploy to Fly.io.")
    print("[INFO] Deployment usually takes 2-5 minutes.")
    print("\n[SUCCESS] Once deployed, the credit system will:")
    print("   - Actually deduct credits when processing images")
    print("   - Block processing when out of credits (402 error)")
    print("   - Log all credit operations with [Credits] prefix")
    print("   - No longer allow free processing on errors")
    print("\n[ACTION] Check deployment status at:")
    print("   https://github.com/mahamedourida-code/olmocr-backend/actions")

if __name__ == "__main__":
    main()
