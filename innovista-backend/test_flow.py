import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_flow():
    print("Testing Registration Flow...")
    email = "test99@example.com"
    password = "password123"
    
    # Register
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "role": "Startup"
    })
    print("Register:", res.status_code, res.text)
    
    if res.status_code != 200:
        return
        
    # Login
    res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    print("Login:", res.status_code, res.text)
    token = res.json().get("access_token")
    
    # Profile
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.put(f"{BASE_URL}/users/profile", json={
        "full_name": "Test Founder",
        "company_name": "Test Co",
        "domain": "AI",
        "stage": "Seed",
        "tags": "AI, ML",
        "bio": "Testing",
        "phone": "1234567890"
    }, headers=headers)
    print("Profile:", res.status_code, res.text)
    
    # Matchmaking
    res = requests.post(f"{BASE_URL}/matchmaking/search", json={
        "query": "Seeking AI investments"
    }, headers=headers)
    print("Matchmaking:", res.status_code, res.text)

if __name__ == "__main__":
    test_flow()
