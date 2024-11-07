import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FantasyPlayerInfo.css';  // Ensure this file is imported

const FantasyPlayerInfo = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [playerData, setPlayerData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('lookup'); // State to track the active tab
    const [team, setTeam] = useState([]); // State to store players in the team

    const apiKey = '50f26dd8159e4235a38c343ed5f1c5b5';

    // Load the team from localStorage on component mount
    useEffect(() => {
        const storedTeam = localStorage.getItem('team');
        if (storedTeam) {
            setTeam(JSON.parse(storedTeam));  // Parse the team from localStorage if it exists
        }
    }, []);

    // Save the team to localStorage whenever the team changes
    useEffect(() => {
        if (team.length > 0) {
            localStorage.setItem('team', JSON.stringify(team)); // Store the team in localStorage
        }
    }, [team]);

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

    const addPlayerToTeam = () => {
        if (playerData) {
            const newTeam = [...team, {...playerData, inPlay: false}]; // Add player to the team array with "inPlay" set to false
            setTeam(newTeam); // Update the team state
            setPlayerData(null); // Clear the player data after adding
            alert(`${playerData.FirstName} ${playerData.LastName} has been added to your team!`);
        }
    };

    const handleTeamPlayerSelect = async (playerId) => {
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

            // Switch to the lookup tab
            setActiveTab('lookup');
        } catch (err) {
            console.error('Error fetching player data:', err);
            setError('Could not fetch player data.');
        }
    };

    const handleToggleInPlay = (playerId, position) => {
        // Check if the position already has a player "in play"
        const newTeam = team.map((player) => {
            if (player.PlayerID === playerId) {
                // Toggle the "in play" status
                return { ...player, inPlay: !player.inPlay };
            }

            if (player.Position === position && player.inPlay) {
                // If another player in the same position is in play, set them to "benched"
                return { ...player, inPlay: false };
            }

            return player;
        });

        setTeam(newTeam);
    };

    // Calculate the total fantasy points for all players "in play"
    const calculateTotalPoints = () => {
        return team
            .filter(player => player.inPlay)
            .reduce((total, player) => total + player.FantasyPoints, 0)
            .toFixed(2); // Round to 2 decimal places
    };

    // Function to remove player from team
    const dropPlayerFromTeam = (playerId) => {
        const newTeam = team.filter(player => player.PlayerID !== playerId);
        setTeam(newTeam); // Update the team state after removal
    };

    return (
        <div className="fantasy-player-info">
            {/* Tabs */}
            <div className="view-toggle">
                <button
                    className={activeTab === 'lookup' ? 'active' : ''}
                    onClick={() => setActiveTab('lookup')}
                >
                    Player Look Up
                </button>
                <button
                    className={activeTab === 'yourTeam' ? 'active' : ''}
                    onClick={() => setActiveTab('yourTeam')}
                >
                    Your Team
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'lookup' && (
                <div className="player-lookup">
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
                            <div className="data-box">Fantasy Points: {playerData.FantasyPoints}</div>

                            <button className="add-to-team-btn" onClick={addPlayerToTeam}>
                                Add Player to Team
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Display Team */}
            {activeTab === 'yourTeam' && (
                <div className="team">
                    <h2>Your Team</h2>

                    <div className="total-points">
                        <h3>Total Fantasy Points: {calculateTotalPoints()}</h3>
                    </div>

                    <div className="team-members">
                        {team.map((player) => (
                            <div key={player.PlayerID} className="team-member">
                                <h3>{player.FirstName} {player.LastName} ({player.Position})</h3>

                                <div className="toggle-switch">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={player.inPlay}
                                            onChange={() => handleToggleInPlay(player.PlayerID, player.Position)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <span>{player.inPlay ? 'In Play' : 'Benched'}</span>
                                </div>

                                <button className="view-stats-btn" onClick={() => handleTeamPlayerSelect(player.PlayerID)}>
                                    View Stats
                                </button>

                                <button className="drop-player-btn" onClick={() => dropPlayerFromTeam(player.PlayerID)}>
                                    Drop from Team
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FantasyPlayerInfo;
