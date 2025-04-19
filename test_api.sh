#!/bin/bash

API_URL="http://localhost:3000/scrape"

# URLs to test
URLS_JSON='[
  "https://x.com/2ndCityStudio",
  "https://x.com/420Elon_",
  "https://x.com/AMAZlNGNATURE/status/1913330096544403901",
  "https://x.com/AuditOnSolana",
  "https://x.com/GTTSOL",
  "https://x.com/JohnStoll1977/status/1913650541202231574",
  "https://x.com/JustHighCoin",
  "https://x.com/KieranOnBase/status/1913305617739001856",
  "https://x.com/M0onCat",
  "https://x.com/OceanicTorqueCC?t=7bqDb4HCcXE-3cal1nOtMQ&s=09",
  "https://x.com/Quamergy",
  "https://x.com/SOL_BOOST",
  "https://x.com/SolPrinterBot",
  "https://x.com/Spacecartstore",
  "https://x.com/flikpepesol",
  "https://x.com/i/communities/1913676197675802860",
  "https://x.com/kanyewest",
  "https://x.com/racewarai",
  "https://x.com/redegg888",
  "https://x.com/search?q=%22unrape%20yourself%22&src=typed_query&f=live",
  "https://x.com/search?q=dedollarization&src=typed_query&f=top",
  "https://x.com/search?q=ts%20kevin&src=typed_query&f=live",
  "https://x.com/skidoginme",
  "https://x.com/trenchdiver101/status/1913670767532790150",
  "https://x.com/usagi_fanpage"
]'

# Construct the JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "urls": $URLS_JSON
}
EOF
)

echo "Sending POST request to $API_URL"
echo "Payload:"
echo $JSON_PAYLOAD
echo "--------------------"

# Make the curl request
curl -X POST -H "Content-Type: application/json" \
     -d "$JSON_PAYLOAD" \
     $API_URL

echo "\n--------------------"
echo "Request finished." 