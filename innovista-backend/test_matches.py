from app.core.database import SessionLocal
from app.api.routes.matchmaking import search_ecosystem
from app.schemas.matchmaking import MatchRequest
from app.models.user import User

def test_matchmaking():
    db = SessionLocal()
    try:
        # Get a student user
        student = db.query(User).filter(User.role == "Student").first()
        if not student:
            print("No student found!")
            return
            
        print(f"Testing with Student: {student.email}")
        
        request = MatchRequest(query="tech")
        
        # Call the endpoint function directly
        response = search_ecosystem(request=request, db=db, current_user=student)
        
        roles = set([m.role for m in response.matches])
        print(f"Student matched with roles: {roles}")
        
        if roles != {"Mentor"} and len(roles) > 0:
            print("ERROR: Student should only match with Mentor!")
        else:
            print("SUCCESS: Student -> Mentor logic works.")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_matchmaking()
