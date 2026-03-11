import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.routes.matchmaking import search_ecosystem
from app.schemas.matchmaking import MatchRequest
from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()

def run_test(role_name):
    user = db.query(User).filter(User.role == role_name).first()
    if not user:
        print(f"Skipping {role_name}, not found.")
        return
        
    print(f"\n--- Testing Match for {role_name} ---")
    request = MatchRequest(query="AI and machine learning early stage")
    try:
        response = search_ecosystem(request=request, db=db, current_user=user)
        for count, m in enumerate(response.matches, 1):
            print(f"{count}. {m.name} | Role: {m.role} | Score: {m.score}")
    except Exception as e:
        print(f"Error: {e}")

run_test("Student")
run_test("Alumni")
run_test("Mentor")
run_test("Startup")
run_test("Investor")
