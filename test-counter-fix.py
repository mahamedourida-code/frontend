#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify the monthly counter fix is working correctly
"""

import requests
import json
import time

# Configuration
SUPABASE_URL = "https://iawkqvdtktnvxqgpupvt.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd2txdmR0a3RudnhxZ3B1cHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDUzNDksImV4cCI6MjA3MTkyMTM0OX0.G6BkN9dgq_46D__tQ-rjyxCV8c0pKDlAcDuJdmLTb_g"

# Test user ID (you should use a real user ID from your system)
TEST_USER_ID = "16e93c56-425a-4ba6-bede-90d386aa3b03"  # Replace with your test user ID

def test_increment_counter():
    """Test the increment_processed_count function"""
    
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    print("\n=== Testing Monthly Counter Fix ===\n")
    
    # Test 1: First increment (should initialize)
    print("Test 1: First increment (5 images)")
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/increment_processed_count",
        headers=headers,
        json={
            "p_user_id": TEST_USER_ID,
            "p_count": 5
        }
    )
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if result.get('success'):
        print(f"[OK] Success! Total: {result.get('total_processed')}, Month: {result.get('month_processed')}, Left: {result.get('images_left')}")
    else:
        print(f"[FAIL] Failed: {result.get('error')}")
    
    time.sleep(1)
    
    # Test 2: Second increment (should add to existing)
    print("\nTest 2: Second increment (10 images)")
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/increment_processed_count",
        headers=headers,
        json={
            "p_user_id": TEST_USER_ID,
            "p_count": 10
        }
    )
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if result.get('success'):
        print(f"[OK] Success! Total: {result.get('total_processed')}, Month: {result.get('month_processed')}, Left: {result.get('images_left')}")
    else:
        print(f"[FAIL] Failed: {result.get('error')}")
    
    # Test 3: Try to exceed limit
    print("\nTest 3: Try to exceed limit (100 images)")
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/increment_processed_count",
        headers=headers,
        json={
            "p_user_id": TEST_USER_ID,
            "p_count": 100
        }
    )
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if not result.get('success'):
        print(f"[OK] Correctly blocked! Images left: {result.get('images_left')}, Reset date: {result.get('reset_date')}")
    else:
        print(f"[FAIL] Should have been blocked but wasn't")
    
    # Fetch final user stats
    print("\nFetching final user stats...")
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/user_stats?user_id=eq.{TEST_USER_ID}",
        headers=headers
    )
    stats = response.json()
    if stats:
        print(f"User Stats: {json.dumps(stats[0], indent=2)}")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_increment_counter()
