import { Scraper, Tweet, Profile } from 'agent-twitter-client';
import dotenv from 'dotenv';

// Load environment variables - still needed for credentials
dotenv.config(); 

// --- Interfaces (Exported for Server) ---
export interface ScrapedData {
  url: string;
  type: 'Tweet' | 'Profile' | 'Community' | 'Generic' | 'Unknown';
  content?: Tweet | Profile | string | null; // Store scraped data or a message
  error?: string;
}

// --- Credentials --- (Keep internal)
const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const email = process.env.TWITTER_EMAIL; 

// --- Helper Functions (Keep internal or export if needed elsewhere) ---
function categorizeUrl(url: string): { type: ScrapedData['type']; identifier: string | null } {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, ''); // Handle www.
    const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment); 

    if (hostname !== 'twitter.com' && hostname !== 'x.com') {
      return { type: 'Unknown', identifier: null };
    }

    // Check for specific paths first
    if (pathSegments[0] === 'home' || pathSegments[0] === 'explore' || pathSegments[0] === 'notifications' || pathSegments[0] === 'messages' || pathSegments[0] === 'settings') {
        return { type: 'Generic', identifier: pathSegments[0] };
    }

    // Check for Community: /i/communities/{id}
    if (pathSegments[0] === 'i' && pathSegments[1] === 'communities' && pathSegments[2]) {
      return { type: 'Community', identifier: pathSegments[2] };
    }

    // Check for Tweet: /{username}/status/{tweet_id}
    if (pathSegments.length >= 3 && pathSegments[1] === 'status' && /^\d+$/.test(pathSegments[2])) {
      return { type: 'Tweet', identifier: pathSegments[2] };
    }

    // Check for Profile: /{username} 
    const potentialUsername = pathSegments[0];
    const reservedPaths = ['i', 'home', 'explore', 'notifications', 'messages', 'settings', 'search', 'hashtag', 'explore', 'compose'];
    if (pathSegments.length === 1 && potentialUsername && !reservedPaths.includes(potentialUsername)) {
        if (/^[a-zA-Z0-9_]{1,15}$/.test(potentialUsername)) {
            return { type: 'Profile', identifier: potentialUsername };
        }
    }

    return { type: 'Unknown', identifier: null }; 
  } catch (error) {
    console.error(`Error parsing URL ${url}:`, error);
    return { type: 'Unknown', identifier: null };
  }
}

// --- Main Processing Function (Exported for Server) ---
export async function processUrls(urls: string[]): Promise<ScrapedData[]> {
  const results: ScrapedData[] = [];
  const scraper = new Scraper();
  let loggedIn = false;

  // Check for credentials *before* attempting login
  if (!username || !password) {
    console.warn('Twitter username or password not found in environment variables. Scraping may fail or be limited.');
  } else {
      try {
          console.log('Attempting login...');
          await scraper.login(username, password, email || undefined);
          console.log('Login successful.');
          loggedIn = true;
      } catch (error) {
          console.error('Login failed. Proceeding without login, functionality may be limited.', error);
          loggedIn = false;
      }
  }

  for (const url of urls) {
    const { type, identifier } = categorizeUrl(url);
    const result: ScrapedData = { url, type };

    console.log(`Processing URL: ${url} (Type: ${type}, ID: ${identifier || 'N/A'})`);

    try {
      switch (type) {
        case 'Tweet':
          if (identifier) {
            result.content = await scraper.getTweet(identifier);
            console.log(`Scraped Tweet: ${identifier}`);
          } else {
             result.error = 'Could not extract Tweet ID.';
          }
          break;

        case 'Profile':
          if (identifier) {
            result.content = await scraper.getProfile(identifier);
             console.log(`Scraped Profile: ${identifier}`);
          } else {
            result.error = 'Could not extract Username.';
          }
          break;

        case 'Community':
          result.content = `Community page identified (ID: ${identifier}). Specific scraping for communities is not implemented in this script or potentially supported by the library.`;
          console.log(`Identified Community: ${identifier} - Scraping not implemented.`);
          break;

        case 'Generic':
           result.content = `Generic Twitter page (${identifier}). No specific content to scrape.`;
           console.log(`Identified Generic Page: ${identifier}`);
           break;

        case 'Unknown':
        default:
          result.content = 'URL is not recognized as a standard Tweet, Profile, or Community page, or is not a Twitter URL.';
          console.log(`URL type unknown or not scrapeable.`);
          break;
      }
    } catch (error: any) {
      console.error(`Error scraping ${url}:`, error.message);
      result.error = error.message || 'Scraping failed';
    }
    results.push(result);
  }

  // Optional: Logout when done
  if (loggedIn) { 
      try {
          await scraper.logout();
          console.log('Logged out.');
      } catch (error) {
          console.error('Logout failed.', error);
      }
  } else {
      console.log("Skipping logout as not logged in.")
  }

  return results;
} 