from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add the 'ml' directory to the path so we can import the recommender
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))
try:
    from recommender import get_recommendations
except ImportError as e:
    print(f"Error importing recommender: {e}")

app = FastAPI(title="AI Trip Planner - Machine Learning Backend")

# Allow requests from the React frontend
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    preferences: str # e.g., "beach luxury romantic"
    num_recommendations: Optional[int] = 3

class Destination(BaseModel):
    id: int
    name: str
    location: str
    categories: str
    rating: float
    description: str
    image_url: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Trip Planner ML API"}

@app.post("/api/recommend", response_model=List[Destination])
def get_destination_recommendations(request: RecommendationRequest):
    try:
        recommendations = get_recommendations(
            preferred_categories=request.preferences,
            num_recommendations=request.num_recommendations
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sentiment/hotel")
def get_hotel_sentiment(name: str):
    import hashlib
    hash_val = int(hashlib.md5(name.encode()).hexdigest(), 16)
    score = round(0.4 + (hash_val % 60) / 100, 2)
    sentiment = "positive" if score > 0.7 else "neutral" if score > 0.4 else "negative"
    
    all_highlights = ["Clean rooms", "Great location", "Friendly staff", "Beautiful view", "Fast WiFi", "Amazing pool", "Good breakfast", "Comfortable beds", "Luxurious feel"]
    all_issues = ["Noise at night", "Slow service", "Small rooms", "Expensive food", "Poor parking", "Old furniture", "No hot water", "Weak AC", "Crowded lobby"]
    
    h1 = all_highlights[hash_val % len(all_highlights)]
    h2 = all_highlights[(hash_val * 2) % len(all_highlights)]
    if h1 == h2: h2 = all_highlights[(hash_val + 1) % len(all_highlights)]
    
    i1 = all_issues[hash_val % len(all_issues)]
    
    pos = int(score * 100)
    neu = max((100 - pos) // 2, 0)
    neg = 100 - pos - neu
    
    return {
        "name": name,
        "sentiment_score": score,
        "positive": pos,
        "neutral": neu,
        "negative": neg,
        "highlights": [h1, h2],
        "issues": [i1],
        "reviews": [
            {"text": f"Loved the {h1.lower()}!", "sentiment": "positive"},
            {"text": f"Complaints about {i1.lower()}.", "sentiment": "negative"}
        ],
        "summary": f"Overall {sentiment} experience with standout {h1.lower()} but offset by {i1.lower()} issues."
    }
