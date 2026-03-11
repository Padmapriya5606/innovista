import requests

# 1. Register
res = requests.post("http://localhost:8000/api/auth/register", json={
    "email": "test456@example.com", 
    "password": "password123", 
    "role": "Startup"
})
print("Register:", res.status_code, res.json())

# 2. Login
res2 = requests.post("http://localhost:8000/api/auth/login", data={
    "username": "test456@example.com", 
    "password": "password123"
}, headers={'Content-Type': 'application/x-www-form-urlencoded'})
print("Login:", res2.status_code, res2.json())

# 3. Profile update
if res2.status_code == 200:
    token = res2.json().get("access_token")
    res3 = requests.put("http://localhost:8000/api/users/profile", json={
        "full_name": "Test Founder",
        "company_name": "TestCo",
        "domain": "AI",
        "stage": "Seed",
        "tags": "AI, Tech",
        "bio": "Testing",
        "phone": "1234567890"
    }, headers={"Authorization": f"Bearer {token}"})
    print("Profile Update:", res3.status_code, res3.json())
