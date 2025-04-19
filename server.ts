import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { processUrls, ScrapedData } from './scraper'; // Import scraping logic
// Import necessary types from the client library - Only importing top-level types
import { Tweet, Profile } from 'agent-twitter-client'; 
// Note: PollOption might be nested or need a different import path, using any for now if direct import fails
// import { PollOption } from 'agent-twitter-client/dist/types/api-data'; // Example potential path

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
    const results: ScrapedData[] = await processUrls(urls);

    // Create JSON-safe results by extracting specific fields
    const safeResults = results.map(result => {
      if (result.error) {
        return { url: result.url, type: result.type, error: result.error };
      }

      if (typeof result.content === 'string') {
        // Pass through simple string content (Community, Generic, Unknown)
        return { url: result.url, type: result.type, content: result.content };
      }

      if (result.type === 'Tweet' && result.content) {
        const tweet = result.content as Tweet;
        const tweetDetails = {
          tweetId: tweet.id || 'N/A',
          username: tweet.username || 'N/A',
          userId: tweet.userId || 'N/A',
          timestamp: tweet.timeParsed ? tweet.timeParsed.toISOString() : (tweet.timestamp ? new Date(tweet.timestamp * 1000).toISOString() : 'N/A'),
          permanentUrl: tweet.permanentUrl || 'N/A',
          conversationId: tweet.conversationId || 'N/A',
          language: tweet.language || 'N/A',
          text: tweet.text || '(No Text)',
          likes: tweet.likes ?? 'N/A',
          retweets: tweet.retweets ?? 'N/A',
          quotes: tweet.quotes ?? 'N/A',
          replies: tweet.replies ?? 'N/A',
          views: tweet.views ?? 'N/A',
          bookmarkCount: tweet.bookmarkCount ?? 'N/A',
          isRetweet: tweet.isRetweet ?? false,
          retweetedStatusId: tweet.retweetedStatusId || null,
          isReply: tweet.isReply ?? false,
          inReplyToStatusId: tweet.inReplyToStatusId || null,
          isQuote: tweet.isQuoted ?? false,
          quotedStatusId: tweet.quotedStatusId || null,
          isPin: tweet.isPin ?? false,
          isSelfThread: tweet.isSelfThread ?? false,
          sensitiveContent: tweet.sensitiveContent ?? false,
          mentions: tweet.mentions?.map((m: any) => `@${m.username || m.id}`) || [],
          hashtags: tweet.hashtags || [],
          urls: tweet.urls || [],
          photos: tweet.photos?.map((p: any) => p.url) || [],
          videos: tweet.videos?.map((v: any) => ({ preview: v.preview, url: v.url })) || [],
          place: tweet.place ? { 
              id: tweet.place.id, 
              name: tweet.place.name, 
              full_name: tweet.place.full_name, 
              place_type: tweet.place.place_type 
          } : null,
          poll: tweet.poll ? { 
              options: tweet.poll.options.map((o: any) => o.label), 
              duration_minutes: tweet.poll.duration_minutes, 
              end_datetime: tweet.poll.end_datetime, 
              voting_status: tweet.poll.voting_status 
          } : null
        };
        return { url: result.url, type: result.type, content: tweetDetails };

      } else if (result.type === 'Profile' && result.content) {
        const profile = result.content as Profile;
        const profileDetails = {
          userId: profile.userId || 'N/A',
          username: profile.username || 'N/A',
          name: profile.name || 'N/A',
          location: profile.location || 'N/A',
          website: profile.website || 'N/A', 
          profileUrlField: profile.url || 'N/A',
          joined: profile.joined ? profile.joined.toISOString() : 'N/A',
          birthday: profile.birthday || 'N/A',
          biography: profile.biography || '(No Bio)',
          followersCount: profile.followersCount ?? 'N/A',
          followingCount: profile.followingCount ?? 'N/A',
          tweetsCount: profile.tweetsCount ?? profile.statusesCount ?? 'N/A',
          likesCount: profile.likesCount ?? 'N/A',
          listedCount: profile.listedCount ?? 'N/A',
          mediaCount: profile.mediaCount ?? 'N/A',
          isVerified: profile.isVerified ?? false,
          isBlueVerified: profile.isBlueVerified ?? false,
          isPrivate: profile.isPrivate ?? false,
          canDm: profile.canDm ?? 'N/A',
          avatarUrl: profile.avatar || 'N/A',
          bannerUrl: profile.banner || 'N/A',
          pinnedTweetIds: profile.pinnedTweetIds || []
        };
        return { url: result.url, type: result.type, content: profileDetails };

      } else {
        // Fallback for unexpected cases where content might be null/undefined but no error
        return { url: result.url, type: result.type, content: null, error: 'Scraped content was unexpectedly empty.' };
      }
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