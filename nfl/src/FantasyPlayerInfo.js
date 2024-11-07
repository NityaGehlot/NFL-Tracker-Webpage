import React, { useState } from 'react';
import axios from 'axios';
import './FantasyPlayerInfo.css';  // Make sure to import the CSS file

const FantasyPlayerInfo = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [playerData, setPlayerData] = useState(null);
    const [error, setError] = useState(null);

    const apiKey = '50f26dd8159e4235a38c343ed5f1c5b5';

    const handleInputChange = async (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query.length >= 2) {
            try {
                const response = await axios.get(`https://api.sportsdata.io/api/nba/fantasy/json/Players?key=${apiKey}`);
                const players = response.data;

                const filteredPlayers = players.filter(player =>
                    player.FirstName.toLowerCase().includes(query.toLowerCase()) ||
                    player.LastName.toLowerCase().includes(query.toLowerCase())
                );

                setSuggestions(filteredPlayers.slice(0, 5));
            } catch (err) {
                console.error('Error fetching players:', err);
                setError('Could not fetch players.');
            }
        } else {
            setSuggestions([]);
        }
    };

    const handlePlayerSelect = async (playerId) => {
        try {
            const response = await axios.get(`https://api.sportsdata.io/api/nba/fantasy/json/PlayerSeasonStats/2024?key=${apiKey}`);
            const playerStats = response.data.find(stat => stat.PlayerID === playerId);

            const playerDetailsResponse = await axios.get(`https://api.sportsdata.io/api/nba/fantasy/json/Players?key=${apiKey}`);
            const playerDetails = playerDetailsResponse.data.find(player => player.PlayerID === playerId);

            setPlayerData({
                ...playerStats,
                PhotoUrl: playerDetails.PhotoUrl,
                FirstName: playerDetails.FirstName,
                LastName: playerDetails.LastName,
                Position: playerDetails.Position
            });

            setError(null);
            setSuggestions([]);
        } catch (err) {
            console.error('Error fetching player data:', err);
            setError('Could not fetch player data.');
        }
    };

    return (
        <div className="fantasy-player-info">
            <h2>Fantasy Player Information</h2>

            <input
                type="text"
                placeholder="Search for a player..."
                value={searchQuery}
                onChange={handleInputChange}
            />

            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((player) => (
                        <li key={player.PlayerID} onClick={() => handlePlayerSelect(player.PlayerID)}>
                            {player.FirstName} {player.LastName}
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="error">{error}</p>}

            {playerData && (
                <div className="player-data">
                    <h3>{playerData.FirstName} {playerData.LastName} ({playerData.Position})</h3>

                    {playerData.PhotoUrl && (
                        <div className="player-photo-container">
                            <img src={playerData.PhotoUrl} alt={`${playerData.FirstName} ${playerData.LastName}`} className="player-photo" />
                        </div>
                    )}

                    <div className="data-box">Team: {playerData.Team}</div>
                    <div className="data-box">Position: {playerData.Position}</div>
                    <div className="data-box">Points: {playerData.Points}</div>
                    <div className="data-box">Assists: {playerData.Assists}</div>
                    <div className="data-box">Rebounds: {playerData.Rebounds}</div>
                    <div className="data-box">Field Goals Made: {playerData.FieldGoalsMade}</div>
                    <div className="data-box">Field Goals Attempted: {playerData.FieldGoalsAttempted}</div>
                    <div className="data-box">Field Goal %: {playerData.FieldGoalsPercentage}</div>
                    <div className="data-box">Free Throws Made: {playerData.FreeThrowsMade}</div>
                    <div className="data-box">Free Throws Attempted: {playerData.FreeThrowsAttempted}</div>
                    <div className="data-box">Free Throw %: {playerData.FreeThrowsPercentage}</div>
                    <div className="data-box">Three Pointers Made: {playerData.ThreePointersMade}</div>
                    <div className="data-box">Three Pointers Attempted: {playerData.ThreePointersAttempted}</div>
                    <div className="data-box">Three Point %: {playerData.ThreePointersPercentage}</div>
                    <div className="data-box">Minutes: {playerData.Minutes}</div>
                    <div className="data-box">Games Played: {playerData.Games}</div>
                    <div className="data-box">Fantasy Points: {playerData.FantasyPoints}</div>
                </div>
            )}
        </div>
    );
};

export default FantasyPlayerInfo;
