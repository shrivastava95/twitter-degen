# Twitter Link Scraper API

This project provides a simple local API server to categorize and scrape basic information from Twitter URLs (Tweets and Profiles).

## Features

*   Accepts a list of Twitter URLs via a POST request.
*   Categorizes each URL (Tweet, Profile, Community, Generic, Unknown).
*   Scrapes basic details for Tweet and Profile URLs using `agent-twitter-client`.
*   Returns results as JSON.

## Prerequisites

*   Node.js (version compatible with `agent-twitter-client`, likely >= 20.18.1 based on previous warnings)
*   npm
*   Twitter Account Credentials

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd twitter-link-api
    ```

2.  **Install dependencies:** This includes the main package dependencies and the dependencies for the nested `agent-twitter-client`.
    ```bash
    npm install
    cd agent-twitter-client
    npm install
    npm run build # Ensure the client is built
    cd ..
    npm install ./agent-twitter-client # Link the local client
    ```
    *Note: If you encounter issues, ensure `agent-twitter-client` builds correctly and is properly linked.* 

## Setup

1.  **Create a `.env` file** in the project root directory (`twitter-link-api`).
2.  Add your Twitter credentials to the `.env` file:
    ```dotenv
    TWITTER_USERNAME='your_twitter_username'
    TWITTER_PASSWORD='your_twitter_password'
    TWITTER_EMAIL='your_twitter_email' # Optional but recommended
    # PORT=3001 # Optional: Specify a different port for the server (default is 3000)
    ```

## Running the API Server

*   **Development (using ts-node):**
    ```bash
    npm run dev
    ```
    This command uses `ts-node` to run the TypeScript server directly. It will automatically restart if you make changes (if `nodemon` is added later).

*   **Production (build first, then run):**
    ```bash
    npm run serve 
    # Or manually:
    # npm run build
    # npm start
    ```
    This compiles the TypeScript code to JavaScript in the `dist` folder and then runs the compiled code with Node.js.

The server will start, typically on port 3000 (unless specified otherwise in `.env`).

## Usage

Send a `POST` request to the `/scrape` endpoint with a JSON body containing an array of URLs.

**Endpoint:** `POST /scrape`

**Request Body:**
```json
{
  "urls": [
    "https://twitter.com/elonmusk/status/1798976790101327901",
    "https://x.com/TwitterDev",
    "https://example.com"
  ]
}
```

**Example using `curl`:**
```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"urls": ["https://twitter.com/elonmusk/status/1798976790101327901", "https://x.com/TwitterDev"]}' \
     http://localhost:3000/scrape
```

**Success Response (200 OK):**

The response will be a JSON array containing objects for each URL processed.
The `content` field for successfully scraped Tweets/Profiles will contain a message indicating data was scraped (details omitted for JSON safety in this basic setup).
```json
[
  {
    "url": "https://twitter.com/elonmusk/status/1798976790101327901",
    "type": "Tweet",
    "content": "Scraped Tweet data (details omitted for JSON safety)"
  },
  {
    "url": "https://x.com/TwitterDev",
    "type": "Profile",
    "content": "Scraped Profile data (details omitted for JSON safety)"
  },
  {
    "url": "https://example.com",
    "type": "Unknown",
    "content": "URL is not recognized as a standard Tweet, Profile, or Community page, or is not a Twitter URL."
  }
]
```

**Error Responses:**

*   **400 Bad Request:** If the request body is missing the `urls` array or it's not formatted correctly.
*   **500 Internal Server Error:** If an error occurs during the scraping process on the server.

## Notes

*   This uses scraping and requires login credentials. Be mindful of Twitter's terms of service and rate limits.
*   Error handling is basic.
*   The JSON response currently omits the detailed scraped data to avoid circular reference errors. You can modify `server.ts` to include specific fields if needed, ensuring they are JSON-safe. 