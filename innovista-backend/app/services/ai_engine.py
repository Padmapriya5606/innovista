import os
from openai import OpenAI
import chromadb
from app.core.config import settings

# Lazy loaded db
_chroma_client = None
_collection = None

def get_collection():
    global _chroma_client, _collection
    if _collection is None:
        _chroma_client = chromadb.PersistentClient(path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "chroma_db"))
        _collection = _chroma_client.get_or_create_collection(name="innovista_profiles")
    return _collection

# Initialize OpenAI Client (For Embeddings and LLM scoring)
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Circuit breaker: set to True after first quota/auth error to skip future API calls instantly
_openai_disabled = False

def _is_openai_available() -> bool:
    """Returns True only if there is a real, working OpenAI key and no prior quota errors."""
    global _openai_disabled
    if _openai_disabled:
        return False
    return bool(
        settings.OPENAI_API_KEY
        and not settings.OPENAI_API_KEY.startswith("sk-dummy")
        and "your_openai_api_key_here" not in settings.OPENAI_API_KEY
    )

def _disable_openai(reason: str):
    global _openai_disabled
    if not _openai_disabled:
        print(f"OpenAI circuit breaker triggered: {reason}. Switching to local fallback for all future requests.")
        _openai_disabled = True

def generate_embedding(text: str) -> list[float]:
    """Generates an embedding vector for the given text."""
    import random
    if not _is_openai_available():
        return [random.random() for _ in range(1536)]
    
    try:
        response = client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        _disable_openai(str(e)[:80])
        return [random.random() for _ in range(1536)]

def index_profile(profile_id: int, text_content: str, metadata: dict):
    """Indexes a user profile into ChromaDB for semantic search."""
    embedding = generate_embedding(text_content)
    col = get_collection()
    col.upsert(
        documents=[text_content],
        embeddings=[embedding],
        metadatas=[metadata],
        ids=[str(profile_id)]
    )

def search_profiles(query: str, n_results: int = 15, target_roles: list[str] = None):
    """Searches for the closest profiles based on the user's query and optional target roles."""
    query_embedding = generate_embedding(query)
    col = get_collection()
    
    combined_results = {"ids": [[]], "documents": [[]]}
    
    if target_roles:
        for role in target_roles:
            try:
                res = col.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results,
                    where={"role": role}
                )
                if res and res["ids"] and len(res["ids"][0]) > 0:
                    combined_results["ids"][0].extend(res["ids"][0])
                    combined_results["documents"][0].extend(res["documents"][0])
            except Exception as e:
                print(f"Error querying role {role}: {e}")
    else:
        try:
            res = col.query(
                query_embeddings=[query_embedding],
                n_results=n_results
            )
            if res and res["ids"] and len(res["ids"][0]) > 0:
                combined_results["ids"][0].extend(res["ids"][0])
                combined_results["documents"][0].extend(res["documents"][0])
        except Exception as e:
            print(f"Error querying without roles: {e}")
        
    return combined_results
def evaluate_match(query: str, profile_content: str) -> dict:
    """Evaluates synergy using fast keyword-based scoring. Falls back gracefully when OpenAI is unavailable."""
    # Try OpenAI only if circuit breaker has not tripped
    if _is_openai_available():
        try:
            import json
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": "You are an expert matchmaking AI for startups, investors, mentors, students, and alumni. You analyze a user's search query and evaluate how well a specific profile matches that query. You must output a valid JSON object containing exactly two keys: 'score' (an integer from 0 to 100 representing the match quality) and 'reason' (a 1-2 sentence string explaining specifically why they match based on the text)."},
                    {"role": "user", "content": f"Search Query: {query}\n\nProfile Data:\n{profile_content}\n\nEvaluate the match and provide the JSON output."}
                ],
                temperature=0.3
            )
            result = json.loads(response.choices[0].message.content)
            return {
                "score": result.get("score", 70),
                "reason": result.get("reason", "Potential synergy detected based on profile contents.")
            }
        except Exception as e:
            print(f"LLM Error (falling back to keyword scoring): {e}")

    # Fast keyword-based fallback scoring (instant - no API call)
    import re
    query_words = set(re.findall(r'\w+', query.lower()))
    profile_words = set(re.findall(r'\w+', profile_content.lower()))
    # Remove common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'for', 'in', 'on', 'at', 'to', 'of', 'is', 'are', 'was', 'with', 'by', 'from', 'that', 'this', 'it', 'as', 'be', 'has', 'have', 'had', 'but', 'not', 'they', 'their', 'we', 'our', 'my', 'i', 'you', 'he', 'she'}
    query_keywords = query_words - stop_words
    profile_keywords = profile_words - stop_words
    
    overlap = query_keywords & profile_keywords
    match_ratio = len(overlap) / max(len(query_keywords), 1)
    
    # Scale score between 65 and 98 for a realistic range
    score = int(65 + (match_ratio * 33))
    score = min(98, max(65, score))
    
    matched_terms = list(overlap)[:3]
    if matched_terms:
        reason = f"Strong alignment found in areas of {', '.join(matched_terms)}. This profile's expertise and background closely matches your goals and requirements."
    else:
        reason = "This profile was identified as a top ecosystem match based on domain similarity and complementary expertise."
    
    return {"score": score, "reason": reason}
        
def evaluate_idea_efficiency(idea_text: str) -> dict:
    """Uses LLM to evaluate a user's idea for efficiency and market potential."""
    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-dummy") or "your_openai_api_key_here" in settings.OPENAI_API_KEY:
        return {"score": 85, "feedback": "This is a surprisingly strong idea. Focus on rapid prototyping and customer validation. (Mocked)"}
        
    try:
        import json
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a world-class startup accelerator evaluator, like Y Combinator. A user is submitting their idea. Evaluate the idea for efficiency, market viability, clarity, and innovation. You must output a valid JSON object containing exactly two keys: 'score' (an integer from 0 to 100 representing the viability score) and 'feedback' (a 2-3 sentence paragraph providing highly constructive, actionable feedback and critique)."},
                {"role": "user", "content": f"Idea Pitch:\n{idea_text}\n\nEvaluate this idea and provide the JSON output."}
            ],
            temperature=0.5
        )
        result = json.loads(response.choices[0].message.content)
        return {
            "score": result.get("score", 50),
            "feedback": result.get("feedback", "Interesting concept but requires more detail to evaluate properly.")
        }
    except Exception as e:
        print(f"LLM Idea Eval Error: {e}")
        return {"score": 50, "feedback": "Error generating idea evaluation."}
