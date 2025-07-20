# BizSherpa-Assignment

An AI-powered application for analyzing business transcripts and generating personalized LinkedIn icebreakers for sales outreach. Built with FastAPI backend and Next.js frontend.

## Features

- **Transcript Analysis**: Upload and analyze business meeting transcripts with AI-powered insights
- **LinkedIn Icebreaker Generation**: Create personalized cold outreach messages using LinkedIn profiles and pitch decks
- **Real-time Feed**: View all transcripts and icebreakers in organized, searchable feeds
- **Custom Prompts**: Use custom AI prompts for tailored analysis
- **Data Persistence**: All data stored securely in Supabase

## Tech Stack

### Backend

- **FastAPI**: Modern Python web framework
- **Supabase**: PostgreSQL database with real-time features
- **OpenAI GPT**: AI-powered analysis and generation
- **Pydantic**: Data validation and serialization
- **Python-dotenv**: Environment variable management

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript/JavaScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Modern UI components
- **Lucide React**: Beautiful icons

## Prerequisites

- Python 3.8+
- Node.js 18+
- OpenAI API key
- Supabase account and project

## Installation

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd business-intelligence-hub
   ```

2. **Create and activate virtual environment**

   ```bash
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install fastapi uvicorn supabase openai python-dotenv pydantic
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Set up database**
   Execute the provided SQL schema in your Supabase SQL editor:

   ```sql
   -- See the database schema provided in the project
   ```

6. **Run the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend  # Adjust path as needed
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Transcripts

- `GET /transcripts` - Get all transcripts
- `POST /transcripts` - Create new transcript analysis
- `GET /transcripts/{id}` - Get specific transcript
- `DELETE /transcripts/{id}` - Delete transcript

### LinkedIn Icebreakers

- `GET /linkedin-icebreakers` - Get all icebreakers
- `POST /linkedin-icebreakers` - Create new icebreaker
- `DELETE /linkedin-icebreakers/{id}` - Delete icebreaker

### Combined Feed

- `GET /feed` - Get combined feed of transcripts and icebreakers

## Usage

### Analyzing Transcripts

1. Navigate to the "Upload & Analyze" tab
2. Fill in the required fields:
   - Company Name
   - Date
   - Attendees
   - Transcript content
3. Optionally add a custom analysis prompt
4. Click "Analyze Transcript"
5. View the AI-generated insights in the "Insights Feed" tab

### Generating LinkedIn Icebreakers

1. Navigate to the "LinkedIn Icebreaker" tab
2. Enter prospect information:
   - Prospect Name
   - Company Name
   - Role Level
   - LinkedIn About section
   - Pitch deck content
3. Optionally customize the analysis prompt
4. Click "Generate LinkedIn Icebreaker"
5. View results in the "Icebreaker Feed" tab

## Database Schema

The application uses two main tables:

### `transcripts`

- `id`: Primary key
- `company_name`: Company name (max 100 chars)
- `attendees`: Meeting attendees (max 500 chars)
- `date`: Meeting date
- `transcript`: Full transcript text
- `insight`: AI-generated analysis
- `created_at`: Timestamp

### `linkedin_icebreakers`

- `id`: Primary key
- `prospect_name`: Prospect's name (max 100 chars)
- `company_name`: Company name (max 100 chars)
- `linkedin_bio`: LinkedIn about section
- `pitch_deck`: Pitch deck content
- `role_level`: Role level (default: Mid-level)
- `icebreaker_analysis`: AI-generated analysis
- `created_at`: Timestamp

## Configuration

### Environment Variables

**Backend (.env)**

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### CORS Configuration

The backend is configured to accept requests from `http://localhost:3000`. Update the CORS settings in `main.py` if deploying to different URLs.

## Deployment

### Backend Deployment (Railway/Heroku/etc.)

1. Set environment variables in your hosting platform
2. Install dependencies: `pip install -r requirements.txt`
3. Run with: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment (Vercel/Netlify)

1. Set `NEXT_PUBLIC_API_URL` to your backend URL
2. Deploy using your preferred platform

## Error Handling

The application includes comprehensive error handling:

- **Network errors**: Displays user-friendly messages when backend is unreachable
- **Validation errors**: Shows specific field validation issues
- **AI failures**: Provides fallback analysis when OpenAI API is unavailable
- **Database errors**: Handles Supabase connection issues gracefully

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the GitHub Issues page
2. Review the error messages in the browser console
3. Ensure all environment variables are set correctly
4. Verify that both backend and frontend servers are running

---

**Built with ❤️ for better business intelligence and sales outreach**
