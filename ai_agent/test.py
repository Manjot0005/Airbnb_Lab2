import os
from dotenv import load_dotenv

load_dotenv()

# Check if the key is loaded
print("OPENAI_API_KEY:", bool(os.getenv("OPENAI_API_KEY")))
print("TAVILY_API_KEY;" = bool(os.getenv("TAVILY_API_KEY")))
