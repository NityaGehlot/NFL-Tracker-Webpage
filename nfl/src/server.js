const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 5000; // or any port of your choice
const apiKey = "YOUR_SPORTSRADAR_API_KEY"; // Replace with your API key

// Endpoint to fetch NBA teams
app.get('/api/nba-teams', async (req, res) => {
    const nbaTeamsURL = `https://api.sportradar.us/nba/trial/v7/en/teams/league_hierarchy.json?api_key=${apiKey}`;
    try {
        const response = await fetch(nbaTeamsURL);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching NBA teams:", error);
        res.status(500).json({ error: "Failed to fetch NBA teams" });
    }
});

// Endpoint to fetch a team’s schedule by ID
app.get('/api/nba-teams/:teamId/schedule', async (req, res) => {
    const teamId = req.params.teamId;
    const teamScheduleURL = `https://api.sportradar.us/nba/trial/v7/en/teams/${teamId}/schedule.json?api_key=${apiKey}`;
    try {
        const response = await fetch(teamScheduleURL);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error fetching schedule for team ${teamId}:`, error);
        res.status(500).json({ error: `Failed to fetch schedule for team ${teamId}` });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}`);
});
