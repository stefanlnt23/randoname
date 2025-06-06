import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateNamesSchema, apiResponseSchema } from "@shared/schema";

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
      const data = await response.json();
      
      // Validate API response
      const validatedResponse = apiResponseSchema.parse(data);
      
      if (validatedResponse.error) {
        return res.status(400).json({ error: validatedResponse.error });
      }
      
      // Normalize response - API returns either 'names' array or single 'name'
      let names = validatedResponse.names || [];
      if (validatedResponse.name && names.length === 0) {
        names = [validatedResponse.name];
      }
      
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
