import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateNamesSchema, randomApiResponseSchema, lookupApiResponseSchema, searchNameSchema, relatedNamesSchema, nameOriginSchema, nameOriginResponseSchema, type NameData } from "@shared/schema";

const API_KEY = process.env.BEHINDTHENAME_API_KEY || 'st518809570';
const API_BASE_URL = 'https://www.behindthename.com/api';
const NAMSOR_API_KEY = process.env.NAMSOR_API_KEY;
const NAMSOR_API_BASE_URL = 'https://v2.namsor.com/NamSorAPIv2/api2/json';

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

  // Name origin endpoint using Namsor API
  app.post("/api/name-origin", async (req, res) => {
    try {
      const validated = nameOriginSchema.parse(req.body);
      
      if (!NAMSOR_API_KEY) {
        return res.status(500).json({ error: 'Namsor API key not configured' });
      }

      // Prepare request body for Namsor API
      const requestBody = {
        personalNames: [{
          id: "name-origin-request",
          firstName: validated.firstName || "",
          lastName: validated.lastName || ""
        }]
      };

      const response = await fetch(`${NAMSOR_API_BASE_URL}/originBatch`, {
        method: 'POST',
        headers: {
          'X-API-KEY': NAMSOR_API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Namsor API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate API response
      const validatedResponse = nameOriginResponseSchema.parse(data);
      
      if (!validatedResponse.personalNames || validatedResponse.personalNames.length === 0) {
        return res.status(404).json({ error: 'No origin data found' });
      }
      
      const originData = validatedResponse.personalNames[0];
      
      // Format response for frontend
      const result = {
        countryOrigin: originData.countryOrigin,
        countryOriginAlt: originData.countryOriginAlt,
        regionOrigin: originData.regionOrigin,
        subRegionOrigin: originData.subRegionOrigin,
        probabilityCalibrated: originData.probabilityCalibrated,
        score: originData.score
      };
      
      res.json(result);
      
    } catch (error) {
      console.error('Error getting name origin:', error);
      res.status(500).json({ error: 'Failed to get name origin. Please try again.' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
