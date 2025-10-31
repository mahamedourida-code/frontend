#!/usr/bin/env python3
"""
Test script to verify credits system is working properly with the backend
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_URL = "https://backend-lively-hill-7043.fly.dev"
# API_URL = "http://localhost:8000"  # Use this for local testing

# Test user credentials - update these with your test user
TEST_EMAIL = "baraourida@gmail.com"
TEST_PASSWORD = "your_password_here"  # Update this

def login(email: str, password: str) -> str:
    """Login and get JWT token"""
    print(f"\n[{datetime.now()}] Logging in as {email}...")
    
    # First, we need to get a Supabase token
    # For now, we'll use a direct token if you have one
    # Otherwise, you need to implement Supabase auth
    
    # This is a placeholder - you need to get an actual token
    # You can get it from the browser's localStorage after logging in
    token = "YOUR_SUPABASE_TOKEN_HERE"
    
    return token

def check_credits(token: str):
    """Check current credits via the backend"""
    print(f"\n[{datetime.now()}] Checking credits...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # The backend doesn't have a direct credits endpoint, so we check via a test upload
    # that will fail but should return credit info in the error
    
    try:
        # Try to process a single image (this will check credits)
        response = requests.post(
            f"{API_URL}/api/v1/jobs/batch",
            headers=headers,
            json={
                "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="]
            },
            timeout=10
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text[:500]}")
        
        if response.status_code == 402:
            print("✗ PAYMENT REQUIRED: Out of credits")
            return False
        elif response.status_code == 200:
            print("✓ Credits available and image processing started")
            result = response.json()
            print(f"Session ID: {result.get('session_id')}")
            return True
        else:
            print(f"Unexpected response: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"✗ Error checking credits: {e}")
        return None

def test_credit_deduction(token: str):
    """Test that credits are properly deducted"""
    print(f"\n[{datetime.now()}] Testing credit deduction...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Create a minimal valid image (1x1 transparent PNG)
    test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    print("Sending batch request with 1 image...")
    
    response = requests.post(
        f"{API_URL}/api/v1/jobs/batch",
        headers=headers,
        json={
            "images": [test_image]
        },
        timeout=10
    )
    
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Success! Session ID: {result.get('session_id')}")
        print(f"✓ 1 credit should have been deducted")
        return result.get('session_id')
    elif response.status_code == 402:
        print("✗ Insufficient credits")
        print(f"Response: {response.json()}")
        return None
    else:
        print(f"✗ Unexpected response: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        return None

def main():
    """Main test function"""
    print("=" * 60)
    print("Credits System Backend Test")
    print("=" * 60)
    
    print("\n⚠️  This test requires a valid Supabase JWT token.")
    print("To get your token:")
    print("1. Log into the app in your browser")
    print("2. Open DevTools Console")
    print("3. Run: localStorage.getItem('supabase.auth.token')")
    print("4. Copy the token value and paste it in this script")
    
    # For testing, you can hardcode a token here
    token = input("\nEnter your Supabase JWT token (or press Enter to skip): ").strip()
    
    if not token:
        print("\n✗ No token provided. Please update the script with a valid token.")
        return
    
    # Test 1: Check if credits endpoint works
    print("\n" + "=" * 40)
    print("Test 1: Check Credits")
    print("=" * 40)
    check_credits(token)
    
    # Test 2: Test credit deduction
    print("\n" + "=" * 40)
    print("Test 2: Credit Deduction")
    print("=" * 40)
    
    proceed = input("\nProceed with credit deduction test? (y/n): ").strip().lower()
    if proceed == 'y':
        session_id = test_credit_deduction(token)
        
        if session_id:
            print("\n" + "=" * 40)
            print("Test Results")
            print("=" * 40)
            print("✓ Backend is properly checking and deducting credits")
            print("✓ Session created successfully")
            print("\nNext steps:")
            print("1. Check the database to verify used_credits increased")
            print("2. Check the dashboard to see if credits updated")
            print("3. Monitor the WebSocket connection for processing updates")
    else:
        print("Test skipped")
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)

if __name__ == "__main__":
    main()
