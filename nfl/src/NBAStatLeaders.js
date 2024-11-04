import React, { useEffect, useState } from 'react';
import './NBAStatLeaders.css'; // Import the CSS file


// add defensive stats
// be able to sort through each stat from highest to lowest and lowest to highest

// ask logan if he wants to do fantasy and i do schedule


function NBAStatLeaders() {
    const [leaders, setLeaders] = useState([]);
    const [error, setError] = useState(null);
    const [selectedStatType, setSelectedStatType] = useState('season'); // Default to season stats

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/leaders.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`, {
                    method: 'GET',
                    headers: { accept: 'application/json' }
                });

                if (!response.ok) throw new Error('Failed to fetch data');

                const data = await response.json();
                console.log(data); // Check the structure of the data

                // Get the leaders based on selected stat type
                const pointsCategory = data.categories.find(category => category.name === 'points');
                const reboundsCategory = data.categories.find(category => category.name === 'rebounds');
                const assistsCategory = data.categories.find(category => category.name === 'assists');
                const turnoversCategory = data.categories.find(category => category.name === 'turnovers');

                if (!pointsCategory || !reboundsCategory || !assistsCategory) {
                    setError("Required categories not found");
                    return;
                }

                const leadersData = pointsCategory.ranks.map((leader, index) => ({
                    rank: leader.rank,
                    player: leader.player,
                    totalGames: leader.total?.games_played || 'N/A',
                    points: selectedStatType === 'per_game' ? leader.average?.points : leader.total?.points,
                    assists: selectedStatType === 'per_game' ? leader.average?.assists : leader.total?.assists,
                    rebounds: selectedStatType === 'per_game' ? leader.average?.rebounds : leader.total?.rebounds,
                    turnovers: selectedStatType === 'per_game' ? leader.average?.turnovers : leader.total?.turnovers,
                }));

                setLeaders(leadersData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchLeaders();
    }, [selectedStatType]); // Fetch data when the selected stat type changes

    const handleStatTypeChange = (event) => {
        setSelectedStatType(event.target.value);
    };

    return (
        <div className="content">
            <h2>NBA Stat Leaders</h2>
            <label htmlFor="stat-type-select">Select Stat Type:</label>
            <select id="stat-type-select" value={selectedStatType} onChange={handleStatTypeChange}>
                <option value="season">Season Stats</option> {/* First option is now Season Stats */}
                <option value="per_game">Per Game Stats</option>
            </select>
            {error && <p>Error: {error}</p>}
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Jersey</th>
                        <th>Position</th>
                        <th>Games Played</th>
                        <th>{selectedStatType === 'per_game' ? 'PPG' : 'Total Points'}</th>
                        <th>{selectedStatType === 'per_game' ? 'APG' : 'Total Assists'}</th>
                        <th>{selectedStatType === 'per_game' ? 'RPG' : 'Total Rebounds'}</th>
                        <th>{selectedStatType === 'per_game' ? 'TPG' : 'Total Turnovers'}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaders.length > 0 ? (
                        leaders.map((leader, index) => (
                            <tr key={index}>
                                <td>{leader.rank}</td>
                                <td>{leader.player ? leader.player.full_name : 'N/A'}</td>
                                <td>{leader.player ? leader.player.jersey_number : 'N/A'}</td>
                                <td>{leader.player ? leader.player.position : 'N/A'}</td>
                                <td>{leader.totalGames}</td>
                                <td>{leader.points !== undefined ? leader.points : 'N/A'}</td>
                                <td>{leader.assists !== undefined ? leader.assists : 'N/A'}</td>
                                <td>{leader.rebounds !== undefined ? leader.rebounds : 'N/A'}</td>
                                <td>{leader.turnovers !== undefined ? leader.turnovers : 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No data available</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default NBAStatLeaders;