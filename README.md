# Twitter Link Scraper API

Simple local API server to categorize and scrape basic information from Twitter URLs (Tweets and Profiles) using `agent-twitter-client`.

## Features

*   Accepts a list of Twitter URLs via a POST request.
*   Categorizes each URL (Tweet, Profile, Community, Generic, Unknown).
*   Scrapes basic details for Tweet and Profile URLs using `agent-twitter-client`.
*   Returns results as JSON.

## Prerequisites

*   Node.js (v20.18.1 or higher recommended)
*   npm
*   Twitter Account Credentials

## Installation & Setup

1.  **Clone:** `git clone <repository-url> && cd twitter-link-api`
2.  **Install Dependencies:** 
    ```bash
    npm install
    # Install & build the nested client
    cd agent-twitter-client && npm install && npm run build && cd ..
    # Link the local client
    npm install ./agent-twitter-client 
    ```
3.  **Configure Credentials:** Create a `.env` file in the project root with your Twitter details:
    ```dotenv
    # .env
    TWITTER_USERNAME='your_twitter_username'
    TWITTER_PASSWORD='your_twitter_password'
    TWITTER_EMAIL='your_twitter_email' # Optional
    # PORT=3001 # Optional: default is 3000
    ```

## Running the API Server

*   **Development:** `npm run dev` (uses `ts-node` for auto-reloading)
*   **Production:** `npm run serve` (builds to `dist/` then runs with `node`)

The server will typically start on port 3000.

## Testing the API

1.  Ensure the API server is running (e.g., using `npm run dev` in one terminal).
2.  Open another terminal in the project root.
3.  Make the test script executable (only needed once):
    ```bash
    chmod +x test_api.sh
    ```
4.  Run the test script:
    ```bash
    ./test_api.sh
    ```
    This sends a predefined list of URLs to the `/scrape` endpoint and prints the JSON response.

## API Usage

Send a `POST` request to `/scrape` with a JSON body:

```json
{
  "urls": [
    "<twitter_url_1>",
    "<twitter_url_2>"
  ]
}
```

**Example `curl`:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"urls": ["<url1>"]}' http://localhost:3000/scrape
```

**Response:** A JSON array with objects for each URL, containing `url`, `type`, and `content` (detailed object for Tweets/Profiles, string for others) or `error`.

## Notes

*   Respect Twitter's terms and rate limits.
*   JSON response contains extracted fields to avoid circular reference errors when serializing.