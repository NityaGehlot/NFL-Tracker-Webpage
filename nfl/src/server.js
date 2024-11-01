// server.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 5000; // Use a port different from React's default 3000

// Set up your API key (replace this with your actual API key)
const API_KEY = 'YOUR_SPORTSRADAR_API_KEY';

// Route to fetch NBA teams
app.get('/api/nba-teams', async (req, res) => {
    try {
        const response = await fetch(`https://api.sportradar.us/nba/trial/v7/en/teams/league_hierarchy.json?api_key=${API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching NBA teams:", error);
        res.status(500).json({ error: "Failed to fetch NBA teams" });
    }
});

// Route to fetch schedule for a specific team
app.get('/api/nba-teams/:teamId/schedule', async (req, res) => {
    const teamId = req.params.teamId;
    try {
        const response = await fetch(`https://api.sportradar.us/nba/trial/v7/en/teams/${teamId}/schedule.json?api_key=${API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error fetching schedule for team ${teamId}:`, error);
        res.status(500).json({ error: `Failed to fetch schedule for team ${teamId}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
