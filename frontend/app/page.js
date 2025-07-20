"use client" 

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Users, Building, MessageSquare, Trash2, Upload, Loader2, Linkedin, FileText, Zap } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TranscriptInsightApp() {
  const [transcripts, setTranscripts] = useState([]);
  const [icebreakers, setIcebreakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    attendees: '',
    date: '',
    transcript: '',
    custom_prompt: ''
  });
  const [icebreakerData, setIcebreakerData] = useState({
    prospect_name: '',
    company_name: '',
    linkedin_bio: '',
    pitch_deck: '',
    role_level: 'Mid-level',
    custom_prompt: ''
  });

  // Fetch transcripts and icebreakers on component mount
  useEffect(() => {
    fetchTranscripts();
    fetchIcebreakers();
  }, []);

  const fetchTranscripts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transcripts`);
      if (response.ok) {
        const data = await response.json();
        setTranscripts(data);
      }
    } catch (err) {
      setError('Failed to fetch transcripts');
    }
  };

  const fetchIcebreakers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/linkedin-icebreakers`);
      if (response.ok) {
        const data = await response.json();
        setIcebreakers(data);
      }
    } catch (err) {
      console.error('Failed to fetch icebreakers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIcebreakerInputChange = (e) => {
    const { name, value } = e.target;
    setIcebreakerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          attendees: formData.attendees,
          date: formData.date,  
          transcript: formData.transcript,
          custom_prompt: formData.custom_prompt || null
        }),
      });

      if (response.ok) {
        const newTranscript = await response.json();
        setTranscripts(prev => [newTranscript, ...prev]);
        setFormData({
          company_name: '',
          attendees: '',
          date: '',
          transcript: '',
          custom_prompt: ''
        });
        setSuccess('Transcript analyzed successfully!');
      } else {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // Handle validation errors
          const errorMessages = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          setError(errorMessages);
        } else {
          setError(errorData.detail || 'Failed to analyze transcript');
        }
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleIcebreakerSubmit = async () => {
    setIcebreakerLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/linkedin-icebreakers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospect_name: icebreakerData.prospect_name,
          company_name: icebreakerData.company_name,
          linkedin_bio: icebreakerData.linkedin_bio,
          pitch_deck: icebreakerData.pitch_deck,
          role_level: icebreakerData.role_level,
          custom_prompt: icebreakerData.custom_prompt || null
        }),
      });

      if (response.ok) {
        const newIcebreaker = await response.json();
        setIcebreakers(prev => [newIcebreaker, ...prev]);
        setIcebreakerData({
          prospect_name: '',
          company_name: '',
          linkedin_bio: '',
          pitch_deck: '',
          role_level: 'Mid-level',
          custom_prompt: ''
        });
        setSuccess('LinkedIn icebreaker generated successfully!');
      } else {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // Handle validation errors
          const errorMessages = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          setError(errorMessages);
        } else {
          setError(errorData.detail || 'Failed to generate icebreaker');
        }
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
    } finally {
      setIcebreakerLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transcripts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTranscripts(prev => prev.filter(t => t.id !== id));
        setSuccess('Transcript deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete transcript');
    }
  };

  const handleIcebreakerDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/linkedin-icebreakers/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIcebreakers(prev => prev.filter(i => i.id !== id));
        setSuccess('Icebreaker deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete icebreaker');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDefaultIcebreakerPrompt = (company, role) => {
    return `Paste a [LinkedIn - about section], give me the company LinkedIn, and website. I'll give you buying signals for [deck] list them, why they matter, what's the source of information, discovery triggers, and smart questions to ask in your next call. At the level of [${company}] & at the level of [${role}], also share what is his preferred style of buying and how did you infer that. At the end give me a short summary and ask me 3 reflection questions to prepare better for the meet. Also give me top 5 things he would like from our deck. What parts may not be clear, relevant or valuable and why + what to do instead.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Hub</h1>
          <p className="text-gray-600 mt-2">Analyze transcripts and generate LinkedIn icebreakers with AI</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload & Analyze
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Insights Feed
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn Icebreaker
            </TabsTrigger>
            <TabsTrigger value="icebreaker-feed" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Icebreaker Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Transcript</CardTitle>
                <CardDescription>
                  Add transcript details and get AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="attendees">Attendees</Label>
                    <Input
                      id="attendees"
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleInputChange}
                      placeholder="John Doe, Jane Smith, etc."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="transcript">Transcript</Label>
                    <Textarea
                      id="transcript"
                      name="transcript"
                      value={formData.transcript}
                      onChange={handleInputChange}
                      placeholder="Paste your transcript here..."
                      rows={8}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom_prompt">Custom Analysis Prompt (Optional)</Label>
                    <Textarea
                      id="custom_prompt"
                      name="custom_prompt"
                      value={formData.custom_prompt}
                      onChange={handleInputChange}
                      placeholder="Leave empty to use default analysis prompt..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analyze Transcript
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="linkedin" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>LinkedIn Icebreaker Generator</CardTitle>
                <CardDescription>
                  Generate personalized cold outreach icebreakers using LinkedIn profiles and pitch decks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="prospect_name">Prospect Name</Label>
                      <Input
                        id="prospect_name"
                        name="prospect_name"
                        value={icebreakerData.prospect_name}
                        onChange={handleIcebreakerInputChange}
                        placeholder="e.g., John Smith"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={icebreakerData.company_name}
                        onChange={handleIcebreakerInputChange}
                        placeholder="e.g., Microsoft, Google, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role_level">Role Level</Label>
                      <Input
                        id="role_level"
                        name="role_level"
                        value={icebreakerData.role_level}
                        onChange={handleIcebreakerInputChange}
                        placeholder="e.g., Senior, VP, Director, etc."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="linkedin_bio">LinkedIn About Section</Label>
                    <Textarea
                      id="linkedin_bio"
                      name="linkedin_bio"
                      value={icebreakerData.linkedin_bio}
                      onChange={handleIcebreakerInputChange}
                      placeholder="Paste the LinkedIn 'About' section here..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pitch_deck">Pitch Deck Content</Label>
                    <Textarea
                      id="pitch_deck"
                      name="pitch_deck"
                      value={icebreakerData.pitch_deck}
                      onChange={handleIcebreakerInputChange}
                      placeholder="Paste or describe your pitch deck content here..."
                      rows={8}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="icebreaker_custom_prompt">
                      Custom Analysis Prompt (Optional)
                    </Label>
                    <Textarea
                      id="icebreaker_custom_prompt"
                      name="custom_prompt"
                      value={icebreakerData.custom_prompt}
                      onChange={handleIcebreakerInputChange}
                      placeholder={getDefaultIcebreakerPrompt(
                        icebreakerData.company_name || 'company',
                        icebreakerData.role_level || 'role'
                      )}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use the default prompt. The default prompt will be customized with your company and role inputs.
                    </p>
                  </div>

                  <Button 
                    onClick={handleIcebreakerSubmit} 
                    disabled={icebreakerLoading} 
                    className="w-full"
                  >
                    {icebreakerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Icebreaker...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate LinkedIn Icebreaker
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feed" className="mt-6">
            <div className="space-y-4">
              {transcripts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transcripts analyzed yet. Upload your first transcript to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                transcripts.map((transcript) => (
                  <Card key={transcript.id} className="w-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {transcript.company_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(transcript.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {transcript.attendees}
                            </span>
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transcript.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">AI Insight:</h4>
                          <ScrollArea className="h-64">
                            <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                              {transcript.insight}
                            </div>
                          </ScrollArea>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-semibold mb-2">Original Transcript:</h4>
                          <ScrollArea className="h-32">
                            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                              {transcript.transcript.substring(0, 500)}
                              {transcript.transcript.length > 500 && '...'}
                            </p>
                          </ScrollArea>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Created: {formatDate(transcript.created_at)}</span>
                          <Badge variant="secondary">ID: {transcript.id}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="icebreaker-feed" className="mt-6">
            <div className="space-y-4">
              {icebreakers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Linkedin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No icebreakers generated yet. Create your first LinkedIn icebreaker to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                icebreakers.map((icebreaker) => (
                  <Card key={icebreaker.id} className="w-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Linkedin className="h-5 w-5 text-blue-600" />
                            {icebreaker.prospect_name} - {icebreaker.company_name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Role: {icebreaker.role_level} | LinkedIn Icebreaker Analysis
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIcebreakerDelete(icebreaker.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">AI-Generated Icebreaker Analysis:</h4>
                          <ScrollArea className="h-64">
                            <div className="whitespace-pre-wrap text-sm bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
                              {icebreaker.icebreaker_analysis}
                            </div>
                          </ScrollArea>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">LinkedIn Bio (Preview):</h4>
                            <ScrollArea className="h-24">
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                {icebreaker.linkedin_bio.substring(0, 200)}
                                {icebreaker.linkedin_bio.length > 200 && '...'}
                              </p>
                            </ScrollArea>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Pitch Deck (Preview):</h4>
                            <ScrollArea className="h-24">
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                {icebreaker.pitch_deck.substring(0, 200)}
                                {icebreaker.pitch_deck.length > 200 && '...'}
                              </p>
                            </ScrollArea>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Created: {formatDate(icebreaker.created_at)}</span>
                          <Badge variant="secondary">ID: {icebreaker.id}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
 