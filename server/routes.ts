import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateNamesSchema, randomApiResponseSchema, lookupApiResponseSchema, type NameData } from "@shared/schema";

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
      url.searchParams.append('randomsurname', validated.randomsurname ? 'yes' : 'no');

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

  const httpServer = createServer(app);
  return httpServer;
}
