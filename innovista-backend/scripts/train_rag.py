import pandas as pd
import sys
import os
import time
import chromadb

# Add the project root to the python path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.profile import Profile
from app.core.config import settings

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "dataset")

def process_dataframe(df, role, db, documents, embeddings, metadatas, ids, hashed_password):
    count = 0
    # Clean up nan values
    df = df.fillna("")
    for index, row in df.iterrows():
        email = ""
        full_name = ""
        domain = ""
        stage = ""
        tags = ""
        bio = ""
        company_name = ""
        
        if role == "Mentor":
            full_name = str(row.get('name', ''))
            email = str(row.get('email', f"{full_name.lower().replace(' ', '.')}@example.com"))
            domain = str(row.get('domain_expertise', ''))
            stage = str(row.get('stage_preference', ''))
            company_name = str(row.get('organization', ''))
            bio = str(row.get('bio', ''))
            tags = domain
        elif role == "Investor":
            full_name = str(row.get('name', ''))
            email = str(row.get('email', f"{full_name.lower().replace(' ', '.')}@investor.com"))
            company_name = str(row.get('fund_name', ''))
            bio = str(row.get('investment_thesis', ''))
            domain = str(row.get('preferred_domains', ''))
            stage = str(row.get('preferred_stage', ''))
            tags = domain
        elif role == "Student":
            full_name = str(row.get('name', ''))
            email = str(row.get('email', f"{full_name.lower().replace(' ', '.')}@student.edu"))
            domain = str(row.get('department', ''))
            bio = str(row.get('project_idea', ''))
            tags = str(row.get('skills', '')) + " " + str(row.get('interests', ''))
            stage = "Idea"
        elif role == "Startup":
            full_name = str(row.get('startup_name', ''))
            company_name = full_name
            original_email = str(row.get('email', ''))
            email = original_email if pd.notna(original_email) and original_email else f"{full_name.lower().replace(' ', '.')}@startup.com"
            domain = str(row.get('domain', ''))
            stage = str(row.get('stage', ''))
            bio = str(row.get('description', ''))
            tags = domain
        elif role == "Alumni":
            full_name = str(row.get('name', ''))
            email = str(row.get('email', f"{full_name.lower().replace(' ', '.')}@alumni.edu"))
            domain = str(row.get('domain', ''))
            company_name = str(row.get('organization', ''))
            bio = str(row.get('career_journey', ''))
            tags = domain
        
        if not email or not full_name:
            continue
            
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            continue
            
        user = User(
            email=email,
            password_hash=hashed_password,
            role=role
        )
        db.add(user)
        db.flush()
        
        profile = Profile(
            user_id=user.id,
            full_name=full_name,
            company_name=company_name,
            domain=domain,
            stage=stage,
            tags=tags,
            bio=bio
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        text_content = f"{profile.bio} {profile.tags} {profile.domain} {profile.stage}"
        metadata = {
            "role": user.role,
            "domain": profile.domain,
            "stage": profile.stage
        }
        
        documents.append(text_content)
        import random
        embeddings.append([random.random() for _ in range(1536)]) # Dummy embedding for fast testing
        metadatas.append(metadata)
        ids.append(str(profile.id))
        count += 1
        
    return count

def train_rag():
    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    chroma_client = chromadb.PersistentClient(path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "chroma_db"))
    try:
        chroma_client.delete_collection(name="innovista_profiles")
    except Exception:
        pass
    collection = chroma_client.create_collection(name="innovista_profiles")
    
    # Pre-computed hash for 'password123'
    hashed_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQmO"
    
    start_time = time.time()
    
    documents = []
    embeddings = []
    metadatas = []
    ids = []
    
    total_profiles = 0
    
    files_to_process = [
        ("2_mentors_500.xlsx", "Mentor"),
        ("3_investors_500.xlsx", "Investor"),
        ("4_startups_500.xlsx", "Startup"),
        ("5_alumni_500.xlsx", "Alumni"),
        ("1_students_500.xlsx", "Student")
    ]
    
    for filename, role in files_to_process:
        filepath = os.path.join(DATASET_DIR, filename)
        if os.path.exists(filepath):
            print(f"Processing {filename} as {role}...")
            try:
                df = pd.read_excel(filepath)
                count = process_dataframe(df, role, db, documents, embeddings, metadatas, ids, hashed_password)
                total_profiles += count
                print(f"Added {count} {role}s")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
        else:
            print(f"Warning: {filepath} not found.")
            
    if ids:
        print("Bulk inserting vectors into ChromaDB...")
        # Chromadb has a max batch size, split into chunks of 1000
        batch_size = 1000
        for i in range(0, len(ids), batch_size):
            collection.add(
                documents=documents[i:i+batch_size],
                embeddings=embeddings[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size],
                ids=ids[i:i+batch_size]
            )
            
    elapsed = time.time() - start_time
    print(f"Successfully seeded {total_profiles} new profiles into the database and ChromaDB in {elapsed:.2f} seconds.")
    db.close()

if __name__ == "__main__":
    if settings.OPENAI_API_KEY == "sk-dummy-key-for-local-dev-replace-me" or "your_openai_api_key" in settings.OPENAI_API_KEY:
         print("WARNING: You are using the dummy OpenAI API Key.")
         print("We are bulk-inserting dummy vectors of 0.0s for testing.")
    
    train_rag()
