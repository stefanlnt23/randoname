import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateNamesSchema, randomApiResponseSchema, lookupApiResponseSchema, searchNameSchema, relatedNamesSchema, type NameData } from "@shared/schema";

const API_KEY = process.env.BEHINDTHENAME_API_KEY || 'st518809570';
const API_BASE_URL = 'https://www.behindthename.com/api';

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/generate-names", async (req, res) => {
    try {
      const validated = generateNamesSchema.parse(req.body);
      
      // Build API URL with parameters
      const url = new URL(`${API_BASE_URL}/random.json`);
      url.searchParams.append('key', API_KEY);
      
      if (validated.gender && validated.gender !== '') {
        url.searchParams.append('gender', validated.gender);
      }
      
      url.searchParams.append('usage', validated.usage);
      url.searchParams.append('number', validated.number.toString());

      // Make request to Behind the Name API
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate API response
      const validatedResponse = randomApiResponseSchema.parse(data);
      
      if (validatedResponse.error) {
        return res.status(400).json({ error: validatedResponse.error });
      }
      
      if (!validatedResponse.names || validatedResponse.names.length === 0) {
        return res.status(400).json({ error: 'No names returned from API' });
      }
      
      // Convert string names to NameData objects
      const names: NameData[] = validatedResponse.names.map((nameString: string) => ({
        name: nameString,
        usage: validated.usage
      }));
      
      res.json({ names });
      
    } catch (error) {
      console.error('Error generating names:', error);
      
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }
      
      res.status(500).json({ error: 'Failed to generate names. Please try again.' });
    }
  });

  // Name lookup endpoint for meanings and etymology
  app.post("/api/lookup-name", async (req, res) => {
    try {
      const validated = searchNameSchema.parse(req.body);
      
      const url = new URL(`${API_BASE_URL}/lookup.json`);
      url.searchParams.append('key', API_KEY);
      url.searchParams.append('name', validated.name);
      
      if (validated.exact) {
        url.searchParams.append('exact', 'yes');
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both single object and array responses
      const nameDetails = Array.isArray(data) ? data[0] : data;
      
      if (!nameDetails || nameDetails.error) {
        return res.status(404).json({ error: 'Name not found' });
      }
      
      // Extract meaning and etymology information
      const result: NameData = {
        name: nameDetails.name || validated.name,
        meaning: nameDetails.meaning || '',
        etymology: nameDetails.etymology || '',
        gender: nameDetails.gender || '',
        usage: nameDetails.usages?.[0]?.usage_full || ''
      };
      
      res.json(result);
      
    } catch (error) {
      console.error('Error looking up name:', error);
      res.status(500).json({ error: 'Failed to lookup name. Please try again.' });
    }
  });

  // Related names endpoint
  app.post("/api/related-names", async (req, res) => {
    try {
      const validated = relatedNamesSchema.parse(req.body);
      
      const url = new URL(`${API_BASE_URL}/related.json`);
      url.searchParams.append('key', API_KEY);
      url.searchParams.append('name', validated.name);
      
      if (validated.usage) {
        url.searchParams.append('usage', validated.usage);
      }
      
      if (validated.gender) {
        url.searchParams.append('gender', validated.gender);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.error) {
        return res.status(404).json({ error: 'No related names found' });
      }
      
      // Extract related names
      const relatedNames = Array.isArray(data) ? data.map((item: any) => item.name || item) : [];
      
      res.json({ relatedNames });
      
    } catch (error) {
      console.error('Error finding related names:', error);
      res.status(500).json({ error: 'Failed to find related names. Please try again.' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
