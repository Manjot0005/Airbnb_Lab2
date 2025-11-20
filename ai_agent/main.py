# ai_agent/main.py - WITH LANGSMITH TRACING
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import requests
import json
from openai import OpenAI
from langsmith import traceable, Client
from langsmith.run_helpers import trace
from dotenv import load_dotenv

# Load .env from the project root
load_dotenv()

# Verify required environment variables
required_vars = ["OPENAI_API_KEY", "LANGCHAIN_API_KEY", "LANGCHAIN_PROJECT"]
for key in required_vars:
    val = os.getenv(key)
    if not val:
        raise ValueError(f"{key} is missing in .env")
    os.environ[key] = val  # ensures downstream libs see it

# Enable tracing
os.environ["LANGCHAIN_TRACING_V2"] = "True"

# Initialize FastAPI app
app = FastAPI(title="AI Concierge Agent", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API keys from environment
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY", "")

print("OPENAI_API_KEY:", bool(OPENAI_API_KEY))
print("LANGCHAIN_API_KEY:", bool(LANGCHAIN_API_KEY))
print("LANGCHAIN_PROJECT:", os.getenv("LANGCHAIN_PROJECT"))
print("LANGCHAIN_TRACING_V2:", os.environ["LANGCHAIN_TRACING_V2"])

# Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
langsmith_client = Client(api_key=LANGCHAIN_API_KEY) if LANGCHAIN_API_KEY else None

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class BookingContext(BaseModel):
    location: str
    checkIn: str
    checkOut: str
    guests: int
    propertyName: Optional[str] = None

class TravelerPreferences(BaseModel):
    budget: str
    interests: List[str]
    mobilityNeeds: Optional[str] = None
    dietaryFilters: List[str] = []
    partyType: str
    hasKids: bool = False
    additionalNotes: Optional[str] = None

class AgentRequest(BaseModel):
    booking: BookingContext
    preferences: TravelerPreferences
    freeTextQuery: Optional[str] = None

class ActivityCard(BaseModel):
    title: str
    address: str
    description: str
    priceTier: str
    duration: str
    tags: List[str]
    wheelchairAccessible: bool
    childFriendly: bool
    timeSlot: str

class RestaurantRec(BaseModel):
    name: str
    address: str
    cuisine: str
    dietaryOptions: List[str]
    priceTier: str
    rating: Optional[float] = None
    wheelchairAccessible: bool

class DayPlan(BaseModel):
    date: str
    dayNumber: int
    morning: List[ActivityCard]
    afternoon: List[ActivityCard]
    evening: List[ActivityCard]
    restaurants: List[RestaurantRec]

class PackingItem(BaseModel):
    item: str
    reason: str
    category: str

class AgentResponse(BaseModel):
    tripSummary: Dict[str, Any]
    dailyPlans: List[DayPlan]
    packingChecklist: List[PackingItem]
    weatherForecast: Dict[str, Any]
    localTips: List[str]

# ============================================================================
# HELPER FUNCTIONS WITH LANGSMITH TRACING
# ============================================================================

@traceable(name="tavily_search", tags=["search", "tavily"])
def tavily_search(query: str) -> List[Dict]:
    """Search using Tavily API with LangSmith tracing"""
    if not TAVILY_API_KEY:
        return []
    
    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": query,
            "max_results": 5
        }
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            # Log metadata to LangSmith
            if langsmith_client:
                langsmith_client.create_feedback(
                    run_id=None,
                    key="search_results_count",
                    score=len(results)
                )
            return results
        return []
    except Exception as e:
        print(f"Tavily search error: {e}")
        return []

@traceable(name="get_weather_info", tags=["weather", "data"])
def get_weather_info(location: str, date: str) -> Dict[str, Any]:
    """Get weather information with tracing"""
    results = tavily_search(f"weather forecast {location} {date}")
    
    weather_data = {
        "location": location,
        "date": date,
        "condition": "partly cloudy",
        "temperature": "70°F",
        "summary": "Pleasant weather expected"
    }
    
    if results and len(results) > 0:
        content = results[0].get('content', '')
        weather_data['summary'] = content[:200] if content else "Weather information unavailable"
    
    return weather_data

@traceable(name="search_activities", tags=["activities", "search"])
def search_activities(location: str, interests: List[str], budget: str) -> List[Dict]:
    """Search for activities with tracing"""
    interests_str = ", ".join(interests) if interests else "top attractions"
    query = f"{interests_str} activities and things to do in {location}"
    return tavily_search(query)

@traceable(name="search_restaurants", tags=["restaurants", "search"])
def search_restaurants(location: str, dietary_filters: List[str], budget: str) -> List[Dict]:
    """Search for restaurants with tracing"""
    dietary_str = ", ".join(dietary_filters) if dietary_filters else "restaurants"
    query = f"best {dietary_str} restaurants in {location}"
    return tavily_search(query)

@traceable(name="calculate_trip_duration", tags=["utils"])
def calculate_trip_duration(check_in: str, check_out: str) -> int:
    """Calculate trip duration"""
    try:
        start = datetime.fromisoformat(check_in.replace('Z', '+00:00'))
        end = datetime.fromisoformat(check_out.replace('Z', '+00:00'))
        return (end - start).days
    except:
        return 3  # Default

@traceable(name="generate_packing_list", tags=["packing"])
def generate_packing_list(weather: Dict, preferences: TravelerPreferences) -> List[PackingItem]:
    """Generate packing checklist"""
    items = [
        PackingItem(item="Passport/ID", reason="Required for travel", category="documents"),
        PackingItem(item="Phone charger", reason="Essential electronics", category="electronics"),
        PackingItem(item="Wallet/Credit cards", reason="For payments", category="documents"),
    ]
    
    # Weather-based items
    if 'rain' in weather.get('summary', '').lower():
        items.append(PackingItem(
            item="Umbrella/Rain jacket",
            reason="Rainy weather expected",
            category="clothing"
        ))
    
    # Activity-based items
    if 'beach' in preferences.interests or 'water' in preferences.interests:
        items.append(PackingItem(
            item="Swimsuit",
            reason="Beach/water activities",
            category="clothing"
        ))
    
    if preferences.hasKids:
        items.append(PackingItem(
            item="Kids entertainment",
            reason="Traveling with children",
            category="accessories"
        ))
    
    return items

def create_activity_card(data: Dict, time_slot: str, preferences: TravelerPreferences) -> ActivityCard:
    """Create activity card from search result"""
    price_map = {"low": "$", "medium": "$$", "high": "$$$"}
    
    return ActivityCard(
        title=data.get('title', 'Activity'),
        address=f"{preferences.booking.location if hasattr(preferences, 'booking') else 'Location'}",
        description=data.get('content', 'Great activity to explore')[:150],
        priceTier=price_map.get(preferences.budget, "$$"),
        duration="2-3 hours",
        tags=preferences.interests[:3],
        wheelchairAccessible=preferences.mobilityNeeds == "wheelchair",
        childFriendly=preferences.hasKids,
        timeSlot=time_slot
    )

def create_restaurant_rec(data: Dict, dietary: List[str], budget: str) -> RestaurantRec:
    """Create restaurant recommendation"""
    price_map = {"low": "$", "medium": "$$", "high": "$$$"}
    
    return RestaurantRec(
        name=data.get('title', 'Restaurant'),
        address="In the area",
        cuisine="Local cuisine",
        dietaryOptions=dietary if dietary else ["all"],
        priceTier=price_map.get(budget, "$$"),
        rating=4.5,
        wheelchairAccessible=True
    )

# ============================================================================
# MAIN GENERATION FUNCTION WITH TRACING
# ============================================================================

@traceable(
    name="generate_travel_plan",
    tags=["travel-plan", "main-workflow"],
    metadata={"version": "1.0.0"}
)
async def generate_travel_plan(request: AgentRequest) -> AgentResponse:
    """Generate comprehensive travel plan with full LangSmith tracing"""
    
    booking = request.booking
    preferences = request.preferences
    
    # Calculate trip duration
    duration = calculate_trip_duration(booking.checkIn, booking.checkOut)
    
    # Generate dates
    start_date = datetime.fromisoformat(booking.checkIn.replace('Z', '+00:00'))
    dates = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(duration)]
    
    # Get weather
    weather = get_weather_info(booking.location, booking.checkIn)
    
    # Search for activities and restaurants
    activities = search_activities(booking.location, preferences.interests, preferences.budget)
    restaurants = search_restaurants(booking.location, preferences.dietaryFilters, preferences.budget)
    
    # Generate daily plans
    daily_plans = []
    activity_idx = 0
    restaurant_idx = 0
    
    for day_num, date in enumerate(dates, 1):
        morning = []
        afternoon = []
        evening = []
        day_restaurants = []
        
        # Distribute activities
        if activity_idx < len(activities):
            morning.append(create_activity_card(activities[activity_idx], "morning", preferences))
            activity_idx += 1
        
        if activity_idx < len(activities):
            afternoon.append(create_activity_card(activities[activity_idx], "afternoon", preferences))
            activity_idx += 1
        
        if activity_idx < len(activities):
            evening.append(create_activity_card(activities[activity_idx], "evening", preferences))
            activity_idx += 1
        
        # Add restaurants
        for _ in range(min(2, len(restaurants) - restaurant_idx)):
            if restaurant_idx < len(restaurants):
                day_restaurants.append(create_restaurant_rec(
                    restaurants[restaurant_idx],
                    preferences.dietaryFilters,
                    preferences.budget
                ))
                restaurant_idx += 1
        
        daily_plans.append(DayPlan(
            date=date,
            dayNumber=day_num,
            morning=morning,
            afternoon=afternoon,
            evening=evening,
            restaurants=day_restaurants
        ))
    
    # Generate packing list
    packing = generate_packing_list(weather, preferences)
    
    # Local tips
    tips = [
        f"Best time to visit {booking.location} attractions is early morning",
        "Consider using public transportation for easy navigation",
        f"Don't miss trying the local {preferences.interests[0] if preferences.interests else 'cuisine'}!",
        "Download offline maps before you go",
        "Keep emergency contacts handy"
    ]
    
    # Trip summary
    summary = {
        "location": booking.location,
        "duration": f"{duration} days",
        "guests": booking.guests,
        "budget": preferences.budget,
        "interests": preferences.interests,
        "partyType": preferences.partyType
    }
    
    return AgentResponse(
        tripSummary=summary,
        dailyPlans=daily_plans,
        packingChecklist=packing,
        weatherForecast=weather,
        localTips=tips
    )

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "running",
        "service": "AI Concierge Agent with LangSmith",
        "version": "1.0.0",
        "langsmith_enabled": bool(LANGCHAIN_API_KEY)
    }

@app.post("/api/concierge/plan", response_model=AgentResponse)
async def create_travel_plan(request: AgentRequest):
    """Generate travel plan with tracing"""
    try:
        # Use LangSmith's trace context for the entire request
        with trace(
            name="create_travel_plan_endpoint",
            inputs={
                "location": request.booking.location,
                "guests": request.booking.guests,
                "interests": request.preferences.interests
            },
            tags=["api", "travel-plan"]
        ):
            plan = await generate_travel_plan(request)
            return plan
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/concierge/chat")
@traceable(name="chat_with_agent", tags=["chat", "openai"])
async def chat_with_agent(query: Dict[str, Any]):
    """Chat with AI agent with tracing"""
    try:
        message = query.get('message', '')
        context = query.get('context', {})
        
        if not openai_client:
            return {
                "response": "I'm ready to help! Ask me about activities, restaurants, or travel tips.",
                "context": context
            }
        
        # Use OpenAI for chat
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are a helpful travel assistant. Context: {json.dumps(context)}"},
                {"role": "user", "content": message}
            ],
            max_tokens=300
        )
        
        return {
            "response": response.choices[0].message.content,
            "context": context
        }
    except Exception as e:
        print(f"Chat error: {e}")
        return {
            "response": "I'm here to help with your travel plans! What would you like to know?",
            "context": context
        }

@app.get("/api/concierge/weather/{location}")
@traceable(name="weather_endpoint", tags=["api", "weather"])
async def get_weather(location: str, date: str = None):
    """Get weather with tracing"""
    if not date:
        date = datetime.now().strftime('%Y-%m-%d')
    return get_weather_info(location, date)

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Concierge Agent with LangSmith...")
    print("📍 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print(f"🔍 LangSmith Tracing: {'Enabled' if LANGCHAIN_API_KEY else 'Disabled'}")
    uvicorn.run(app, host="0.0.0.0", port=8000)