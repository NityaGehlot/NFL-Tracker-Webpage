import React, { useEffect, useState } from 'react';
import './NBAStatLeaders.css'; // Import the CSS file

// filter all stats
// possible have a player profile when clicking on them in the data table

// ask what screens we are doing - calendar and standings

function NBAStatLeaders() {
    const [leaders, setLeaders] = useState([]);
    const [error, setError] = useState(null);
    const [selectedStatType, setSelectedStatType] = useState('season'); // Default to season stats
    const [statCategory, setStatCategory] = useState('offensive'); // Default to offensive stats

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/leaders.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`, {
                    method: 'GET',
                    headers: { accept: 'application/json' }
                });

                if (!response.ok) throw new Error('Failed to fetch data');

                const data = await response.json();

                // Log the available categories to see if any are missing
                console.log("Available categories:", data.categories.map(category => category.name));

                // Find required categories and handle gracefully if any are missing
                const pointsCategory = data.categories.find(category => category.name === 'points') || { ranks: [] };
                const reboundsCategory = data.categories.find(category => category.name === 'rebounds') || { ranks: [] };
                const assistsCategory = data.categories.find(category => category.name === 'assists') || { ranks: [] };
                const turnoversCategory = data.categories.find(category => category.name === 'turnovers') || { ranks: [] };
                const stealsCategory = data.categories.find(category => category.name === 'steals') || { ranks: [] };
                const blocksCategory = data.categories.find(category => category.name === 'blocks') || { ranks: [] };
                const minutes = data.categories.find(category => category.name === 'minutes') || { ranks: [] };
                const fieldGoalPercentage = data.categories.find(category => category.name === 'field_goals_pct') || { ranks: [] };
                const twoPointerPercentage = data.categories.find(category => category.name === 'two_points_pct') || { ranks: [] };
                const threePointerPercentage = data.categories.find(category => category.name === 'three_points_pct') || { ranks: [] };
                const freeThrowPercentage = data.categories.find(category => category.name === 'free_throws_pct') || { ranks: [] };
                const personalFouls = data.categories.find(category => category.name === 'personal_fouls') || { ranks: [] };
                const technicalFouls = data.categories.find(category => category.name === 'tech_fouls') || { ranks: [] };
                const flagrantFouls = data.categories.find(category => category.name === 'flagrant_fouls') || { ranks: [] };
                const foulouts = data.categories.find(category => category.name === 'foulouts') || { ranks: [] };

                // Map leader data, checking if each category has data to avoid undefined errors
                const leadersData = pointsCategory.ranks.map((leader, index) => ({
                    rank: leader.rank,
                    player: leader.player,
                    totalGames: leader.total?.games_played || 'N/A',

                    // General stats
                    minutes: selectedStatType === 'per_game' ? leader.average?.minutes : leader.total?.minutes,

                    // Offensive stats
                    points: selectedStatType === 'per_game' ? leader.average?.points : leader.total?.points,
                    assists: selectedStatType === 'per_game' ? leader.average?.assists : leader.total?.assists,
                    rebounds: selectedStatType === 'per_game' ? leader.average?.rebounds : leader.total?.rebounds,
                    turnovers: selectedStatType === 'per_game' ? leader.average?.turnovers : leader.total?.turnovers,

                    // Defensive stats
                    steals: selectedStatType === 'per_game' ? leader.average?.steals : leader.total?.steals,
                    blocks: selectedStatType === 'per_game' ? leader.average?.blocks : leader.total?.blocks,
                    blocked_att: selectedStatType === 'per_game' ? leader.average?.blocked_att : leader.total?.blocked_att,

                    // Percentage stats, rounded to the nearest tenth
                    field_goals_pct: leader.total?.field_goals_pct ? Math.round(leader.total.field_goals_pct * 1000) / 10 : 'N/A',
                    two_points_pct: leader.total?.two_points_pct ? Math.round(leader.total.two_points_pct * 1000) / 10 : 'N/A',
                    three_points_pct: leader.total?.three_points_pct ? Math.round(leader.total.three_points_pct * 1000) / 10 : 'N/A',
                    free_throws_pct: leader.total?.free_throws_pct ? Math.round(leader.total.free_throws_pct * 1000) / 10 : 'N/A',

                    // Fouls stats
                    personal_fouls: leader.total?.personal_fouls,
                    tech_fouls: leader.total?.tech_fouls,
                    flagrant_fouls: leader.total?.flagrant_fouls,
                    foulouts: leader.total?.foulouts,

                }));

                setLeaders(leadersData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchLeaders();
    }, [selectedStatType, statCategory]); // Re-fetch data when stat type or category changes

    const handleStatTypeChange = (event) => {
        setSelectedStatType(event.target.value);
    };

    const handleStatCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        setStatCategory(selectedCategory);

        // If "Percentages" is selected, set stat type to "season" and disable the dropdown
        if (selectedCategory === 'percentages') {
            setSelectedStatType('season');
        }
    };

    return (
        <div className="content">
            <h2>NBA Stat Leaders</h2>
            <label htmlFor="stat-type-select">Select Stat Type:</label>
            <select id="stat-type-select" value={selectedStatType} onChange={handleStatTypeChange} disabled={statCategory === 'percentages' || statCategory === 'fouls'}>
                <option value="season">Season Stats</option>
                <option value="per_game">Per Game Stats</option>
            </select>

            <label htmlFor="stat-category-select">Select Stat Category:</label>
            <select id="stat-category-select" value={statCategory} onChange={handleStatCategoryChange}>
                <option value="offensive">Offensive Stats</option>
                <option value="defensive">Defensive Stats</option>
                <option value="percentages">Percentages</option>
                <option value="fouls">Foul Stats</option>
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
                        <th>{selectedStatType === 'per_game' ? 'MPG' : 'Total Minutes'}</th>
                        {statCategory === 'offensive' && (
                            <>
                                <th>{selectedStatType === 'per_game' ? 'PPG' : 'Total Points'}</th>
                                <th>{selectedStatType === 'per_game' ? 'APG' : 'Total Assists'}</th>
                                <th>{selectedStatType === 'per_game' ? 'RPG' : 'Total Rebounds'}</th>
                                <th>{selectedStatType === 'per_game' ? 'TPG' : 'Total Turnovers'}</th>
                            </>
                        )}
                        {statCategory === 'defensive' && (
                            <>
                                <th>{selectedStatType === 'per_game' ? 'SPG' : 'Total Steals'}</th>
                                <th>{selectedStatType === 'per_game' ? 'BPG' : 'Total Blocks'}</th>
                                <th>{selectedStatType === 'per_game' ? 'BAPG' : 'Total Block Attempts'}</th>
                            </>
                        )}
                        {statCategory === 'percentages' && (
                            <>
                                <th>{'Field Goal %'}</th>
                                <th>{'2 Pointer %'}</th>
                                <th>{'3 Pointer %'}</th>
                                <th>{'Free Throw %'}</th>
                            </>
                        )}
                        {statCategory === 'fouls' && (
                            <>
                                <th>{'Personal Fouls'}</th>
                                <th>{'Technical Fouls'}</th>
                                <th>{'Flagrant Fouls'}</th>
                                <th>{'Foulouts'}</th>
                            </>
                        )}

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
                                <td>{leader.minutes !== undefined ? leader.minutes : 'N/A'}</td>

                                {statCategory === 'offensive' && (
                                    <>
                                        <td>{leader.points !== undefined ? leader.points : 'N/A'}</td>
                                        <td>{leader.assists !== undefined ? leader.assists : 'N/A'}</td>
                                        <td>{leader.rebounds !== undefined ? leader.rebounds : 'N/A'}</td>
                                        <td>{leader.turnovers !== undefined ? leader.turnovers : 'N/A'}</td>
                                    </>
                                )}
                                {statCategory === 'defensive' && (
                                    <>
                                        <td>{leader.steals !== undefined ? leader.steals : 'N/A'}</td>
                                        <td>{leader.blocks !== undefined ? leader.blocks : 'N/A'}</td>
                                        <td>{leader.blocked_att !== undefined ? leader.blocked_att : 'N/A'}</td>
                                    </>
                                )}
                                {statCategory === 'percentages' && (
                                    <>
                                        <td>{leader.field_goals_pct !== undefined ? leader.field_goals_pct : 'N/A'}</td>
                                        <td>{leader.two_points_pct !== undefined ? leader.two_points_pct : 'N/A'}</td>
                                        <td>{leader.three_points_pct !== undefined ? leader.three_points_pct : 'N/A'}</td>
                                        <td>{leader.free_throws_pct !== undefined ? leader.free_throws_pct : 'N/A'}</td>
                                    </>
                                )}
                                {statCategory === 'fouls' && (
                                    <>
                                        <td>{leader.personal_fouls !== undefined ? leader.personal_fouls : 'N/A'}</td>
                                        <td>{leader.tech_fouls !== undefined ? leader.tech_fouls : 'N/A'}</td>
                                        <td>{leader.flagrant_fouls !== undefined ? leader.flagrant_fouls : 'N/A'}</td>
                                        <td>{leader.foulouts !== undefined ? leader.foulouts : 'N/A'}</td>
                                    </>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">No data available</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default NBAStatLeaders;
