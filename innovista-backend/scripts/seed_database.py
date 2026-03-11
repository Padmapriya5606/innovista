import csv
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

def seed_db_fast(csv_file_path: str):
    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Initialize Local Vector Store directly to bypass slow HTTP errors if API key is invalid
    chroma_client = chromadb.Client()
    try:
        chroma_client.delete_collection(name="innovista_profiles")
    except Exception:
        pass
    collection = chroma_client.create_collection(name="innovista_profiles")
    
    # Pre-computed hash for 'password123'
    hashed_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQmO"
    
    print(f"Reading dataset from {csv_file_path}...")
    start_time = time.time()
    
    try:
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            count = 0
            
            # Batch these for faster chromadb insertion
            documents = []
            embeddings = []
            metadatas = []
            ids = []
            
            for row in reader:
                # 1. Create User
                email = f"{row['Full Name'].lower().replace(' ', '.')}@example.com"
                
                existing_user = db.query(User).filter(User.email == email).first()
                if existing_user:
                    print(f"User {email} already exists, skipping...")
                    continue
                
                user = User(
                    email=email,
                    password_hash=hashed_password,
                    role=row['Role']
                )
                db.add(user)
                db.flush()
                
                # 2. Create Profile
                profile = Profile(
                    user_id=user.id,
                    full_name=row['Full Name'],
                    company_name=row['Company'],
                    domain=row['Domain'],
                    stage=row['Stage'],
                    tags=row['Tags'],
                    bio=row['Bio / Thesis']
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)
                
                # 3. Prepare for ChromaDB Bulk Insert
                text_content = f"{profile.bio} {profile.tags} {profile.domain} {profile.stage}"
                metadata = {
                    "role": user.role,
                    "domain": profile.domain,
                    "stage": profile.stage
                }
                
                documents.append(text_content)
                embeddings.append([0.0] * 1536) # Dummy embedding for fast seeding testing
                metadatas.append(metadata)
                ids.append(str(profile.id))
                
                count += 1
                if count % 100 == 0:
                    print(f"Processed {count}/900 profiles...")
                
            # Perform Bulk Insert
            if ids:
                print("Bulk inserting vectors into ChromaDB...")
                collection.add(
                    documents=documents,
                    embeddings=embeddings,
                    metadatas=metadatas,
                    ids=ids
                )
                
            elapsed = time.time() - start_time
            print(f"Successfully seeded {count} new profiles into the database and ChromaDB in {elapsed:.2f} seconds.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Fast Seed the database from a CSV file.")
    parser.add_argument("file_path", help="Path to the CSV file")
    args = parser.parse_args()
    
    if settings.OPENAI_API_KEY == "sk-dummy-key-for-local-dev-replace-me" or "your_openai_api_key" in settings.OPENAI_API_KEY:
         print("WARNING: You are using the dummy OpenAI API Key.")
         print("We are bulk-inserting dummy vectors of 0.0s for testing.")
    
    seed_db_fast(args.file_path)
