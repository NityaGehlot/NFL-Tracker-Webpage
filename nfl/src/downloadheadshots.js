const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Your Fantasy API URL for players
const API_KEY = '50f26dd8159e4235a38c343ed5f1c5b5';
const API_URL = `https://api.sportsdata.io/api/nba/fantasy/json/Players?key=${API_KEY}`;

// Function to get the headshot URL from a player's Basketball Reference page
async function getHeadshot(playerName, playerId, folder) {
    // Construct the Basketball Reference URL
    const playerUrl = `https://www.basketball-reference.com/players/${playerName[0].toLowerCase()}/${playerName.toLowerCase()}01.html`;

    try {
        // Fetch the page HTML using axios with custom headers
        const { data } = await axios.get(playerUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Find the headshot image URL from the player's page (it's located in the image with class 'media-item')
        const headshotUrl = $('#meta img').attr('src');
        
        if (headshotUrl) {
            // Construct the full image URL
            const imageUrl = `https://www.basketball-reference.com${headshotUrl}`;

            // Fetch the headshot image
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            // Create folder if it doesn't exist
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
            }

            // Save the image with playerId.png as the file name
            const filePath = path.join(folder, `${playerId}.png`);
            fs.writeFileSync(filePath, imageResponse.data);

            console.log(`Headshot for ${playerName} saved successfully!`);
        } else {
            console.log(`Headshot not found for ${playerName}`);
        }
    } catch (error) {
        console.error(`Error fetching headshot for ${playerName}:`, error);
    }
}

// Fetch players' data from Fantasy API and get their headshots
async function fetchPlayers() {
    try {
        // Fetch the player data from Fantasy API
        const { data } = await axios.get(API_URL);

        // Loop through the players and get their headshots
        for (let i = 0; i < data.length; i++) {
            const player = data[i];
            const playerName = player.FirstName + player.LastName; // Name format used in the URL
            const playerId = player.PlayerID;

            // Fetch headshot for each player
            await getHeadshot(playerName, playerId, './headshots'); // Save headshots in the 'headshots' folder
            
            // Delay between requests to avoid rate limiting (2-second delay)
            await new Promise(resolve => setTimeout(resolve, 500)); // 2-second delay
        }
    } catch (error) {
        console.error('Error fetching player data:', error);
    }
}

// Run the fetchPlayers function
fetchPlayers();
