#!/usr/bin/env python3
"""
Test script to verify credit system is working properly
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://backend-lively-hill-7043.fly.dev"
SUPABASE_URL = "https://iawkqvdtktnvxqgpupvt.supabase.co"

# Test user credentials (you'll need to provide these)
USER_EMAIL = "baraourida@gmail.com"  # Change to your test email
USER_PASSWORD = input("Enter password for {}: ".format(USER_EMAIL))

def get_auth_token():
    """Login and get authentication token"""
    print(f"\n1. Logging in as {USER_EMAIL}...")
    
    login_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd2txdmR0a3RudnhxZ3B1cHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMTY1NDksImV4cCI6MjA0Mzg5MjU0OX0.RAmD0v-3T9MbAEbCKYRPvsvjqB-_h8BvKpEjcHq_BiI",
        "Content-Type": "application/json"
    }
    
    payload = {
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    }
    
    response = requests.post(login_url, headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful!")
        return data.get("access_token")
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def check_credits(token):
    """Check user's current credits"""
    print(f"\n2. Checking current credits...")
    
    url = f"{BASE_URL}/api/v1/users/credits"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Credits retrieved:")
        print(f"   Total: {data.get('total_credits', 0)}")
        print(f"   Used: {data.get('used_credits', 0)}")
        print(f"   Available: {data.get('available_credits', 0)}")
        return data
    else:
        print(f"❌ Failed to get credits: {response.status_code}")
        print(response.text)
        return None

def test_image_processing(token):
    """Test processing an image (this will use credits)"""
    print(f"\n3. Testing image processing (this will use 1 credit)...")
    
    proceed = input("Do you want to proceed? This will use 1 credit (y/n): ")
    if proceed.lower() != 'y':
        print("Skipping image processing test")
        return
    
    url = f"{BASE_URL}/api/v1/jobs/batch"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Create a simple test image payload
    payload = {
        "images": [
            {
                "id": "test-" + str(datetime.now().timestamp()),
                "url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",  # Sample table image
                "name": "test-table.jpg"
            }
        ]
    }
    
    print(f"📤 Sending batch processing request...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Image processing started!")
        print(f"   Session ID: {data.get('session_id')}")
        return data
    elif response.status_code == 402:
        print(f"❌ Insufficient credits!")
        print(response.text)
        return None
    elif response.status_code == 500:
        print(f"❌ Server error (credit system error)!")
        print(response.text)
        return None
    else:
        print(f"❌ Failed to process image: {response.status_code}")
        print(response.text)
        return None

def main():
    print("=" * 60)
    print("OlmOCR Credit System Test")
    print("=" * 60)
    
    # Step 1: Login
    token = get_auth_token()
    if not token:
        print("\n❌ Cannot proceed without authentication")
        return
    
    # Step 2: Check initial credits
    initial_credits = check_credits(token)
    if not initial_credits:
        print("\n❌ Cannot proceed without credit information")
        return
    
    # Step 3: Test image processing
    result = test_image_processing(token)
    
    # Step 4: Check credits again
    if result:
        print(f"\n4. Checking credits after processing...")
        import time
        time.sleep(2)  # Wait a bit for processing
        
        final_credits = check_credits(token)
        if final_credits:
            used_before = initial_credits.get('used_credits', 0)
            used_after = final_credits.get('used_credits', 0)
            
            if used_after > used_before:
                print(f"\n✅ SUCCESS! Credits were deducted:")
                print(f"   Before: {initial_credits.get('available_credits', 0)} available")
                print(f"   After: {final_credits.get('available_credits', 0)} available")
                print(f"   Credits used: {used_after - used_before}")
            else:
                print(f"\n❌ PROBLEM: Credits were NOT deducted!")
                print(f"   This means the credit system is not enforcing limits")
                print(f"   Users are getting free processing!")
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
