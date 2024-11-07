import React, { useEffect, useState } from 'react';

const TeamStats = () => {
    const [teamStats, setTeamStats] = useState(null);
    const [injuries, setInjuries] = useState([]); // Store injury data
    const [teams, setTeams] = useState([]); // List of NBA teams
    const [selectedTeamId, setSelectedTeamId] = useState('583eca2f-fb46-11e1-82cb-f4ce4684ea4c'); // Default team (example)
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('offensive'); // Default category
    const [selectedView, setSelectedView] = useState('total'); // Default view (totals)
    const [displayView, setDisplayView] = useState('stats'); // Default view (stats)
    const [playersSorted, setPlayersSorted] = useState([]); // State for sorted players

    const teamLogos = {
        'ATL': '/images/Atlanta.png',
        'BOS': 'images/BostonCeltics.png',
        'BKN': 'images/BrooklynNets.png',
        'CHA': 'images/CharlotteHornets.png',
        'CHI': 'images/ChicagoBulls.png',
        'CLE': 'images/ClevelandCavaliers.png',
        'DAL': 'images/DallasMavericks.png',
        'DEN': '/images/DenverNuggets.png',
        'DET': '/images/DetroitPistons.png',
        'GSW': '/images/Golden StateWarriors.png',
        'HOU': '/images/HoustonRockets.png',
        'IND': '/images/IndianaPacers.png',
        'LAC': '/images/LAClippers.png',
        'LAL': '/images/Los AngelesLakers.png',
        'MEM': '/images/MemphisGrizzlies.png',
        'MIA': '/images/MiamiHeat.png',
        'MIL': '/images/MilwaukeeBucks.png',
        'MIN': '/images/MinnesotaTimberwolves.png',
        'NOP': '/images/New OrleansPelicans.png',
        'NYK': '/images/New YorkKnicks.png',
        'OKC': '/images/Oklahoma CityThunder.png',
        'ORL': '/images/OrlandoMagic.png',
        'PHI': '/images/Philadelphia76ers.png',
        'PHX': '/images/PhoenixSuns.png',
        'POR': '/images/PortlandTrail Blazers.png',
        'SAC': '/images/SacramentoKings.png',
        'SAS': '/images/San AntonioSpurs.png',
        'TOR': '/images/TorontoRaptors.png',
        'UTA': '/images/UtahJazz.png',
        'WAS': '/images/WashingtonWizards.png',
// Add other NBA teams' logos as needed...
    };

    // List of allowed indexes (replace with the indexes of teams you want to allow)
    const allowedTeamIndexes = [1, 5, 7, 8, 9, 10, 17, 19, 20, 21, 24, 25, 27, 28, 31, 32, 33, 34, 35, 38, 39, 41, 43, 46, 47, 56, 57, 58, 60, 63]; // Example indexes, replace with actual ones

    // Fetch the list of NBA teams and set the default selected team
    useEffect(() => {
        const options = { method: 'GET', headers: { accept: 'application/json' } };

        fetch('http://localhost:8080/https://api.sportradar.com/nba/trial/v8/en/league/teams.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9', options)
            .then((res) => res.json())
            .then((data) => {
                setTeams(data.teams);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, []);

    // Fetch stats and injury data for the selected team
    useEffect(() => {
        const options = { method: 'GET', headers: { accept: 'application/json' } };

        // Fetch team stats for the selected team
        fetch(
            `http://localhost:8080/https://api.sportradar.com/nba/trial/v8/en/seasons/2024/REG/teams/${selectedTeamId}/statistics.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`,
            options
        )
            .then((res) => res.json())
            .then((data) => {
                console.log(data); // Log the data to inspect its structure
                setTeamStats(data);
                if (data.players) {
                    // Sort players by their average points
                    setPlayersSorted(data.players.sort((a, b) => b.average?.points - a.average?.points));
                }
            })
            .catch((err) => {
                setError(err.message);
            });

        // Fetch injury data for the selected team
        // Fetch injury data for the selected team
        fetch(
            `http://localhost:8080/https://api.sportradar.com/nba/trial/v8/en/league/injuries.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`,
            options
        )
            .then((res) => res.json())
            .then((data) => {
                console.log(data); // Log the injury data to inspect its structure
                if (data && data.teams) {
                    // Extract injuries data and include teamId
                    const injuredPlayers = [];
                    data.teams.forEach((team) => {
                        team.players.forEach((player) => {
                            if (player.injuries && player.injuries.length > 0) {
                                player.injuries.forEach((injury) => {
                                    injuredPlayers.push({
                                        teamId: team.id,  // Add teamId for filtering
                                        playerName: player.full_name,
                                        injuryDescription: injury.desc,
                                        injuryStatus: injury.status,
                                        injuryStartDate: injury.start_date,
                                        injuryComment: injury.comment,
                                    });
                                });
                            }
                        });
                    });
                    setInjuries(injuredPlayers);
                }
            })
            .catch((err) => {
                console.error(err);
            });

    }, [selectedTeamId]); // Re-fetch when selected team changes

    if (error) return <p>Error: {error}</p>;
    if (!teamStats) return <p>Loading...</p>;

    // Extract team information and selected stats from own_record.total
    const { name, market, own_record, players } = teamStats;
    const totals = own_record?.total || {};
    const averages = own_record?.average || {}; // Assuming averages are in the 'average' field

    // Define categories and corresponding stats
    const statCategories = {
        offensive: ["points", "assists", "rebounds"],
        defensive: ["steals", "blocks"],
        percentages: ["field_goals_pct", "two_points_pct", "three_points_pct"],
    };

    // Get the stats for the selected category
    const displayedStats = statCategories[selectedCategory];

    // Determine which stats (totals or averages) to display
    const statsToDisplay = selectedView === 'total' ? totals : averages;

    // Function to render stats table
    const renderStatsTable = () => (
        <div className="table-container">
            <table>
                <thead>
                <tr>
                    {displayedStats.map((stat) => (
                        <th key={stat}>{stat.replace(/_/g, ' ').toUpperCase()}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                <tr>
                    {displayedStats.map((stat) => (
                        <td key={stat}>{statsToDisplay[stat] ?? 'N/A'}</td>
                    ))}
                </tr>
                </tbody>
            </table>
        </div>
    );

    // Function to render players table (with offensive, defensive, percentages stats)
    const renderPlayersTable = () => {
        // Get the stats to display for players (offensive, defensive, or percentages)
        const playerStats = statCategories[selectedCategory];

        return (
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Jersey Number</th>
                        <th>Position</th>
                        <th>Primary Position</th>
                        {playerStats.map((stat) => (
                            <th key={stat}>
                                {stat.replace(/_/g, ' ').toUpperCase()} ({selectedView === 'total' ? 'Total' : 'Avg'})
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {playersSorted?.map((player) => (
                        <tr key={player.id}>
                            <td>{player.full_name}</td>
                            <td>{player.jersey_number}</td>
                            <td>{player.position}</td>
                            <td>{player.primary_position}</td>
                            {playerStats.map((stat) => (
                                <td key={stat}>
                                    {
                                        selectedView === 'total'
                                            ? player.total?.[stat] ?? 'N/A'
                                            : player.average?.[stat] ?? 'N/A'
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Function to render injuries table
    // Function to render injuries table
    const renderInjuriesTable = () => {
        // Filter injuries by the selected team
        const filteredInjuries = injuries.filter((injury) => {
            // Check if the injury is for the selected team
            return injury.teamId === selectedTeamId;
        });

        return (
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Player Name</th>
                        <th>Injury</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>Comment</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredInjuries.length > 0 ? (
                        filteredInjuries.map((injury, index) => (
                            <tr key={index}>
                                <td>{injury.playerName}</td>
                                <td>{injury.injuryDescription}</td>
                                <td>{injury.injuryStatus}</td>
                                <td>{injury.injuryStartDate}</td>
                                <td>{injury.injuryComment}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No injuries reported</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        );
    };



    return (
        <div>
            <h1>{market} {name}</h1>
            {/*<img src={teamLogos[market] || '/images/placeholder.png'} alt={name} className="team-logo"/>*/}

            {/* View toggle buttons */}
            <div className="view-toggle">
            <button onClick={() => setDisplayView('stats')}>Stats</button>
                <button onClick={() => setDisplayView('players')}>Players</button>
                <button onClick={() => setDisplayView('injuries')}>Injuries</button>
            </div>

            {/* Conditionally render Stats, Players, or Injuries table */}
            {displayView === 'stats' ? (
                <div>
                    {/* Dropdown container */}
                    <div className="dropdown-container">
                        {/* Team selection dropdown */}
                        <div className="dropdown-item">
                            <label htmlFor="team">Select Team: </label>
                            <select
                                id="team"
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                            >
                                {teams.filter((team, index) => allowedTeamIndexes.includes(index)).map((team, index) => (
                                    <option key={team.id} value={team.id}>
                                        {team.market} {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stat category dropdown */}
                        <div className="dropdown-item">
                            <label htmlFor="category">Select Stat Category: </label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="offensive">Offensive</option>
                                <option value="defensive">Defensive</option>
                                <option value="percentages">Percentages</option>
                            </select>
                        </div>

                        {/* View dropdown */}
                        <div className="dropdown-item">
                            <label htmlFor="view">View: </label>
                            <select
                                id="view"
                                value={selectedView}
                                onChange={(e) => setSelectedView(e.target.value)}
                            >
                                <option value="total">Totals</option>
                                <option value="average">Averages</option>
                            </select>
                        </div>
                    </div>

                    {/* Display stats table */}
                    {renderStatsTable()}
                </div>
            ) : displayView === 'players' ? (
                // Display players table with offensive, defensive, percentages stats
                <div>
                    {/* Dropdown container */}
                    <div className="dropdown-container">
                        {/* Team selection dropdown */}
                        <div className="dropdown-item">
                            <label htmlFor="team">Select Team: </label>
                            <select
                                id="team"
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                            >
                                {teams.filter((team, index) => allowedTeamIndexes.includes(index)).map((team, index) => (
                                    <option key={team.id} value={team.id}>
                                        {team.market} {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="dropdown-item">
                            {/* Dropdown to select the stat category for players */}
                            <label htmlFor="player-category">Select Stat Category: </label>
                            <select
                                id="player-category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="offensive">Offensive</option>
                                <option value="defensive">Defensive</option>
                                <option value="percentages">Percentages</option>
                            </select>
                        </div>

                        <div className="dropdown-item">
                            {/* Dropdown to select totals or averages for players */}
                            <label htmlFor="player-view">View: </label>
                            <select
                                id="player-view"
                                value={selectedView}
                                onChange={(e) => setSelectedView(e.target.value)}
                            >
                                <option value="total">Totals</option>
                                <option value="average">Averages</option>
                            </select>
                        </div>
                    </div>

                    {/* Display players table */}
                    {renderPlayersTable()}
                </div>
            ) : (
                // Display injuries table
                <div>
                    {/* Dropdown container */}
                    <div className="dropdown-container">
                        {/* Team selection dropdown */}
                        <div className="dropdown-item">
                            <label htmlFor="team">Select Team: </label>
                            <select
                                id="team"
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                            >
                                {teams.filter((team, index) => allowedTeamIndexes.includes(index)).map((team, index) => (
                                    <option key={team.id} value={team.id}>
                                        {team.market} {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {renderInjuriesTable()}
                </div>
            )}
        </div>
    );
};

export default TeamStats;
