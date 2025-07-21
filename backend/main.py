from dotenv import load_dotenv
import os

load_dotenv()


from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
import os
from supabase import create_client, Client
import openai

app = FastAPI(title="Transcript Insight API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://biz-sherpa-assignment.vercel.app"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# OpenAI client  
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models
class TranscriptCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100)
    attendees: str = Field(..., min_length=1, max_length=500)
    date: date 
    transcript: str = Field(..., min_length=10)
    custom_prompt: Optional[str] = None

class LinkedInIcebreakerCreate(BaseModel):
    prospect_name: str = Field(..., min_length=1, max_length=100)
    company_name: str = Field(..., min_length=1, max_length=100)
    linkedin_bio: str = Field(..., min_length=10)
    pitch_deck: str = Field(..., min_length=10)
    role_level: str = Field(default="Mid-level", max_length=50)
    custom_prompt: Optional[str] = None

class TranscriptResponse(BaseModel):
    id: int
    company_name: str
    attendees: str
    date: date 
    transcript: str
    insight: str
    created_at: datetime
    content_type: str = "transcript"

class LinkedInIcebreakerResponse(BaseModel):
    id: int
    prospect_name: str
    company_name: str
    linkedin_bio: str
    pitch_deck: str
    role_level: str
    icebreaker_analysis: str
    created_at: datetime
    content_type: str = "linkedin_icebreaker"

class InsightResponse(BaseModel):
    insight: str

# Default analysis prompt
DEFAULT_TRANSCRIPT_PROMPT = """Review this transcript and provide analysis in the following format:

**What I Did Well:**
- List specific strengths and positive behaviors observed
- Include why these were effective

**Areas for Improvement:**
- Identify specific areas that could be enhanced
- Provide constructive feedback

**Recommendations for Next Time:**
- Suggest actionable changes to test in future interactions
- Include specific techniques or approaches to try

Please be specific and actionable in your feedback."""

DEFAULT_LINKEDIN_PROMPT = """Analyze the LinkedIn profile and pitch deck to create a comprehensive sales intelligence report:

**Company & Contact Information:**
- Company LinkedIn URL and website
- Role level assessment

**Buying Signals Analysis:**
- List specific buying signals from the LinkedIn profile
- Why each signal matters for our offering
- Source of information for each signal
- Discovery triggers to explore
- Smart questions to ask in the next call

**Buying Style Analysis:**
- Preferred style of buying (analytical, relationship-focused, etc.)
- How this was inferred from the profile
- Approach recommendations

**Pitch Deck Relevance:**
- Top 5 things they would like from our deck
- Parts that may not be clear, relevant, or valuable
- Specific recommendations for improvement
- Why certain sections might not resonate

**Summary & Preparation:**
- Short executive summary
- 3 reflection questions to prepare better for the meeting

Please be specific and actionable in all recommendations."""

async def get_supabase_client():
    return supabase

async def analyze_transcript(transcript: str, custom_prompt: Optional[str] = None) -> str:
    """Analyze transcript using AI"""
    try:
        prompt = custom_prompt if custom_prompt else DEFAULT_TRANSCRIPT_PROMPT
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Here is the transcript to analyze:\n\n{transcript}"}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        # Fallback analysis if AI fails
        return f"""**Analysis Complete**

**What Went Well:**
- Clear communication observed in the transcript
- Professional tone maintained throughout
- Key points were addressed

**Areas for Improvement:**
- Consider more structured approach to discussions
- Opportunity for better question flow
- Could benefit from more active listening techniques

**Recommendations:**
- Practice summarizing key points at regular intervals
- Ask more follow-up questions to deepen understanding
- Use pause techniques to allow for better responses

*Note: AI analysis temporarily unavailable, this is a basic assessment.*"""

async def analyze_linkedin_icebreaker(linkedin_bio: str, pitch_deck: str, prospect_name: str, company_name: str, role_level: str, custom_prompt: Optional[str] = None) -> str:
    """Analyze LinkedIn profile and pitch deck for icebreaker generation"""
    try:
        prompt = custom_prompt if custom_prompt else DEFAULT_LINKEDIN_PROMPT
        
        content = f"""
PROSPECT: {prospect_name}
COMPANY: {company_name}
ROLE LEVEL: {role_level}

LINKEDIN PROFILE:
{linkedin_bio}

PITCH DECK CONTENT:
{pitch_deck}
"""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": content}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        # Fallback analysis if AI fails
        return f"""**LinkedIn Icebreaker Analysis for {prospect_name}**

**Company & Contact Information:**
- Company: {company_name}
- Role Level: {role_level}
- Requires manual research for LinkedIn URL and website

**Buying Signals Analysis:**
- Professional background suggests interest in business solutions
- Company size and role indicate decision-making capability
- Recent activity may show openness to new technologies

**Buying Style Assessment:**
- Appears to be a {role_level.lower()} decision maker
- Likely values data-driven presentations
- May prefer structured, professional approach

**Pitch Deck Recommendations:**
- Focus on ROI and business impact
- Include relevant case studies
- Prepare for detailed technical questions
- Emphasize scalability and implementation

**Meeting Preparation:**
- Research recent company news and challenges
- Prepare specific use cases relevant to their industry
- Plan follow-up questions about their current processes

**Reflection Questions:**
1. What specific challenges is {company_name} likely facing in their industry?
2. How can our solution directly address their business objectives?
3. What would be the most compelling ROI story for this prospect?

*Note: AI analysis temporarily unavailable, this is a basic assessment based on provided information.*"""

@app.get("/")
async def root():
    return {"message": "Transcript Insight API is running"}

@app.post("/transcripts", response_model=TranscriptResponse)
async def create_transcript(
    transcript_data: TranscriptCreate,
    db: Client = Depends(get_supabase_client)
):
    try:
        # Analyze transcript
        insight = await analyze_transcript(
            transcript_data.transcript, 
            transcript_data.custom_prompt
        )
        
        # Store in Supabase
        result = db.table("transcripts").insert({
            "company_name": transcript_data.company_name,
            "attendees": transcript_data.attendees,
            "date": transcript_data.date.isoformat(),
            "transcript": transcript_data.transcript,
            "insight": insight
        }).execute()
        
        if result.data:
            response_data = result.data[0]
            response_data["content_type"] = "transcript"
            return TranscriptResponse(**response_data)
        else:
            raise HTTPException(status_code=400, detail="Failed to create transcript")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/linkedin-icebreakers", response_model=LinkedInIcebreakerResponse)
async def create_linkedin_icebreaker(
    icebreaker_data: LinkedInIcebreakerCreate,
    db: Client = Depends(get_supabase_client)
):
    try:
        # Analyze LinkedIn profile and pitch deck
        analysis = await analyze_linkedin_icebreaker(
            icebreaker_data.linkedin_bio,
            icebreaker_data.pitch_deck,
            icebreaker_data.prospect_name,
            icebreaker_data.company_name,
            icebreaker_data.role_level,
            icebreaker_data.custom_prompt
        )
        
        # Store in Supabase
        result = db.table("linkedin_icebreakers").insert({
            "prospect_name": icebreaker_data.prospect_name,
            "company_name": icebreaker_data.company_name,
            "linkedin_bio": icebreaker_data.linkedin_bio,
            "pitch_deck": icebreaker_data.pitch_deck,
            "role_level": icebreaker_data.role_level,
            "icebreaker_analysis": analysis
        }).execute()
        
        if result.data:
            response_data = result.data[0]
            response_data["content_type"] = "linkedin_icebreaker"
            return LinkedInIcebreakerResponse(**response_data)
        else:
            raise HTTPException(status_code=400, detail="Failed to create LinkedIn icebreaker")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transcripts", response_model=List[TranscriptResponse])
async def get_transcripts(
    limit: int = 10,
    offset: int = 0,
    db: Client = Depends(get_supabase_client)
):
    try:
        result = db.table("transcripts").select("*").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        response_data = []
        for item in result.data:
            item["content_type"] = "transcript"
            response_data.append(TranscriptResponse(**item))
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/linkedin-icebreakers")
async def get_linkedin_icebreakers(
    limit: int = 10,
    offset: int = 0,
    db: Client = Depends(get_supabase_client)
):
    try:
        result = db.table("linkedin_icebreakers").select("*").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        response_data = []
        for item in result.data:
            item["content_type"] = "linkedin_icebreaker"
            response_data.append(LinkedInIcebreakerResponse(**item))
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feed")
async def get_combined_feed(
    limit: int = 20,
    offset: int = 0,
    db: Client = Depends(get_supabase_client)
):
    """Get combined feed of transcripts and LinkedIn icebreakers"""
    try:
        # Get transcripts
        transcripts_result = db.table("transcripts").select("*").order("created_at", desc=True).execute()
        transcripts = []
        for item in transcripts_result.data:
            item["content_type"] = "transcript"
            transcripts.append(item)
        
        # Get LinkedIn icebreakers
        icebreakers_result = db.table("linkedin_icebreakers").select("*").order("created_at", desc=True).execute()
        icebreakers = []
        for item in icebreakers_result.data:
            item["content_type"] = "linkedin_icebreaker"
            icebreakers.append(item)
        
        # Combine and sort by created_at
        combined = transcripts + icebreakers
        combined.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Apply pagination
        paginated = combined[offset:offset + limit]
        
        return paginated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transcripts/{transcript_id}", response_model=TranscriptResponse)
async def get_transcript(
    transcript_id: int,
    db: Client = Depends(get_supabase_client)
):
    try:
        result = db.table("transcripts").select("*").eq("id", transcript_id).single().execute()
        if result.data:
            return TranscriptResponse(**result.data)
        else:
            raise HTTPException(status_code=404, detail="Transcript not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/transcripts/{transcript_id}")
async def delete_transcript(
    transcript_id: int,
    db: Client = Depends(get_supabase_client)
):
    try:
        result = db.table("transcripts").delete().eq("id", transcript_id).execute()
        return {"message": "Transcript deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/linkedin-icebreakers/{icebreaker_id}")
async def delete_linkedin_icebreaker(
    icebreaker_id: int,
    db: Client = Depends(get_supabase_client)
):
    try:
        result = db.table("linkedin_icebreakers").delete().eq("id", icebreaker_id).execute()
        return {"message": "LinkedIn icebreaker deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
 
