import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { processUrls, ScrapedData } from './scraper'; // Import scraping logic

dotenv.config(); // Load .env file

const app = express();
const port = process.env.PORT || 3000; // Allow port configuration via .env

app.use(express.json()); // Middleware to parse JSON request bodies

// Simple root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Twitter Scraper API is running!');
});

// Main scraping endpoint
app.post('/scrape', async (req: Request, res: Response) => {
  const { urls } = req.body;

  if (!Array.isArray(urls) || !urls.every(item => typeof item === 'string')) {
    return res.status(400).json({ error: 'Invalid input: "urls" must be an array of strings.' });
  }

  if (urls.length === 0) {
    return res.status(400).json({ error: 'Invalid input: "urls" array cannot be empty.' });
  }

  console.log(`Received request to scrape ${urls.length} URLs.`);

  try {
    // Pass the URLs from the request body to the processing function
    const results: ScrapedData[] = await processUrls(urls);

    // Return results as JSON - Need to handle potential circular references
    // A simple approach is to filter/map the results before sending
    const safeResults = results.map(result => {
        // Remove the complex 'content' object before sending if it's not a string
        // Or create a more detailed summary object if needed
        if (typeof result.content !== 'string' && result.content) {
            return { ...result, content: `Scraped ${result.type} data (details omitted for JSON safety)` };
        }
        return result;
    });

    res.status(200).json(safeResults);

  } catch (error: any) {
    console.error('Error during scraping process:', error);
    res.status(500).json({ error: 'An internal server error occurred during scraping.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 