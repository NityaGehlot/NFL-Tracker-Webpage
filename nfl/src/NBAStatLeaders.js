import React, { useEffect, useState } from 'react';
import './NBAStatLeaders.css';


// add different years of stats
// fix three pointer


function NBAStatLeaders() {
    const [leaders, setLeaders] = useState([]);
    const [error, setError] = useState(null);
    const [selectedStatType, setSelectedStatType] = useState('season'); // Default to season stats
    const [statCategory, setStatCategory] = useState('offensive'); // Default to offensive stats
    const [sortStat, setSortStat] = useState('N/A'); // Default to "N/A" (rank sorting)
    const [view, setView] = useState('players'); // New state for view type
    const [teams, setTeams] = useState([]); // State to hold the teams
    const [selectedTeam, setSelectedTeam] = useState(''); // State to hold the selected team
    const [selectedTeamData, setSelectedTeamData] = useState(null); // State for selected team data
    const [teamDetails, setTeamDetails] = useState(null); // New state to store team details (conference, division)
    const [selectedYear, setSelectedYear] = useState('2024'); // Default year
    const [cachedData, setCachedData] = useState({}); // Cache for fetched data




    // Utility function to add delay
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Function to handle rate-limited API requests with delay
    const fetchWithDelay = async (url, delayMs = 1000) => {
        await delay(delayMs);
        return fetch(url, {
            method: 'GET',
            headers: { accept: 'application/json' }
        });
    };


    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const cacheKey = `${selectedYear}-${selectedStatType}`;
                if (cachedData[cacheKey]) {
                    setLeaders(cachedData[cacheKey]);
                    return;
                }

                const response = await fetchWithDelay(
                    `http://localhost:8080/https://api.sportradar.com/nba/trial/v8/en/seasons/${selectedYear}/REG/leaders.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`,
                    { method: 'GET', headers: { accept: 'application/json' } }
                );

                if (!response.ok) throw new Error('Failed to fetch data');

                const data = await response.json();

                // Map and prepare data for the leaders
                const pointsCategory = data.categories.find(category => category.name === 'points') || { ranks: [] };
                const leadersData = pointsCategory.ranks.map((leader) => ({
                    rank: leader.rank,
                    player: leader.player,
                    totalGames: leader.total?.games_played || 'N/A',
                    minutes: selectedStatType === 'per_game' ? leader.average?.minutes : leader.total?.minutes,
                    points: selectedStatType === 'per_game' ? leader.average?.points : leader.total?.points,
                    assists: selectedStatType === 'per_game' ? leader.average?.assists : leader.total?.assists,
                    rebounds: selectedStatType === 'per_game' ? leader.average?.rebounds : leader.total?.rebounds,
                    turnovers: selectedStatType === 'per_game' ? leader.average?.turnovers : leader.total?.turnovers,
                    steals: selectedStatType === 'per_game' ? leader.average?.steals : leader.total?.steals,
                    blocks: selectedStatType === 'per_game' ? leader.average?.blocks : leader.total?.blocks,
                    field_goals_pct: leader.total?.field_goals_pct ? Math.round(leader.total.field_goals_pct * 1000) / 10 : 'N/A',
                    two_points_pct: leader.total?.two_points_pct ? Math.round(leader.total.two_points_pct * 1000) / 10 : 'N/A',
                    three_points_pct: leader.total?.three_points_pct ? Math.round(leader.total.three_points_pct * 1000) / 10 : 'N/A',
                    free_throws_pct: leader.total?.free_throws_pct ? Math.round(leader.total.free_throws_pct * 1000) / 10 : 'N/A',
                    personal_fouls: leader.total?.personal_fouls,
                    tech_fouls: leader.total?.tech_fouls,
                    flagrant_fouls: leader.total?.flagrant_fouls,
                    foulouts: leader.total?.foulouts,
                }));

                setLeaders(leadersData);
                setCachedData((prevCache) => ({ ...prevCache, [selectedYear]: leadersData })); // Store data in cache
            } catch (err) {
                setError(err.message);
            }
        };


        fetchLeaders();
    }, [selectedYear, selectedStatType, statCategory, cachedData]);










    // PLAYER STATS
    const handleStatTypeChange = (event) => {
        setSelectedStatType(event.target.value);
    };

    const handleStatCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        setStatCategory(selectedCategory);
        setSortStat('N/A'); // Reset to "N/A" to sort by rank on category change

        // Ensure stat type is only enabled for certain categories
        if (selectedCategory === 'percentages') {
            setSelectedStatType('season');
        }
    };

    const handleSortStatChange = (event) => {
        setSortStat(event.target.value);
    };

    const calculateAverages = (leadersData) => {
        const stats = ['points', 'assists', 'rebounds', 'turnovers', 'steals', 'blocks', 'field_goals_pct', 'two_points_pct', 'three_points_pct', 'free_throws_pct', 'personal_fouls', 'tech_fouls', 'flagrant_fouls', 'foulouts'];
        const averages = {};

        stats.forEach(stat => {
            const sum = leadersData.slice(0, 25).reduce((acc, leader) => acc + (leader[stat] || 0), 0);
            averages[stat] = sum / 25;
        });

        return averages;
    };

    const averages = calculateAverages(leaders);

    const getColor = (playerStat, stat) => {
        // Check if the stat is turnovers or any fouls
        const foulsAndTurnovers = ['turnovers', 'personal_fouls', 'tech_fouls', 'flagrant_fouls', 'foulouts'];

        // For other stats, default color logic remains based on comparison with the average
        if (sortStat === stat) {
            if (foulsAndTurnovers.includes(stat)) {
                if (playerStat > averages[stat]) return 'red'; // Red if above average
                if (Math.abs(playerStat - averages[stat]) <= 1) return 'yellow'; // Yellow if within ±1 of average
                return 'green'; // Green if below average
            }
            else {
                if (playerStat > averages[stat]) return 'green'; // Green if above average
                if (Math.abs(playerStat - averages[stat]) <= 1) return 'yellow'; // Yellow if within ±1 of average
                return 'red'; // Red if below average
            }

        }

        return ''; // No color for other stats
    };





    // Sort leaders data based on selected stat or rank if "N/A" is selected
    const sortedLeaders = [...leaders].sort((a, b) => {
        if (sortStat === 'N/A') {
            return a.rank - b.rank; // Sort by rank
        } else {
            const statA = a[sortStat] || 0;
            const statB = b[sortStat] || 0;
            return statB - statA; // Sort selected stat in descending order
        }
    });





    return (
        <div className="content">
            <header className="title">
                {view === 'players' && (
                    <h1>NBA Stat Leaders</h1>
                )}
                {view === 'teams' && (
                    <h1>NBA Team Stats</h1>
                )}
            </header>


            {view === 'players' && (
                <>
                    <div className="dropdown-container">
                        <div className="dropdown-item">
                            <label htmlFor="year-select">Select Year:</label>
                            <select
                                id="year-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                                <option value="2020">2020</option>
                                <option value="2019">2019</option>
                                <option value="2018">2018</option>
                                <option value="2017">2017</option>
                                <option value="2016">2016</option>
                                <option value="2015">2015</option>
                                <option value="2014">2014</option>
                                <option value="2013">2013</option>
                                {/* Add more years as needed */}
                            </select>


                            <label htmlFor="stat-type-select">Select Stat Type:</label>
                            <select id="stat-type-select" value={selectedStatType} onChange={handleStatTypeChange}
                                    disabled={statCategory === 'percentages' || statCategory === 'fouls'}>
                                <option value="season">Total Season Stats</option>
                                <option value="per_game">Per Game Stats</option>
                            </select>

                            <label htmlFor="stat-category-select">Select Stat Category:</label>
                            <select id="stat-category-select" value={statCategory} onChange={handleStatCategoryChange}>
                                <option value="offensive">Offensive Stats</option>
                                <option value="defensive">Defensive Stats</option>
                                <option value="percentages">Percentages</option>
                                <option value="fouls">Foul Stats</option>
                            </select>

                            <label htmlFor="sort-stat-select">Sort By:</label>
                            <select id="sort-stat-select" value={sortStat} onChange={handleSortStatChange}>
                                <option value="N/A">N/A</option>
                                {/* Default to sorting by rank */}
                                {statCategory === 'offensive' && (
                                    <>
                                        <option value="points">Points</option>
                                        <option value="assists">Assists</option>
                                        <option value="rebounds">Rebounds</option>
                                        <option value="turnovers">Turnovers</option>
                                    </>
                                )}
                                {statCategory === 'defensive' && (
                                    <>
                                        <option value="steals">Steals</option>
                                        <option value="blocks">Blocks</option>
                                    </>
                                )}
                                {statCategory === 'percentages' && (
                                    <>
                                        <option value="field_goals_pct">Field Goal %</option>
                                        <option value="two_points_pct">2 Pointer %</option>
                                        <option value="three_points_pct">3 Pointer %</option>
                                        <option value="free_throws_pct">Free Throw %</option>
                                    </>
                                )}
                                {statCategory === 'fouls' && (
                                    <>
                                        <option value="personal_fouls">Personal Fouls</option>
                                        <option value="tech_fouls">Technical Fouls</option>
                                        <option value="flagrant_fouls">Flagrant Fouls</option>
                                        <option value="foulouts">Foulouts</option>
                                    </>
                                )}
                            </select>

                        </div>
                    </div>


                    {error && <p>Error: {error}</p>}
                    <div className="table-container">

                        <div className="key-table">
                            <h4>Stat Key:</h4>
                            <div className="key-items">
                                {/* Adjusted key items with conditional classes */}
                                <div className="key-item">
                                    <div className="color-box green"></div>
                                    <span>{['turnovers', 'personal_fouls', 'tech_fouls', 'flagrant_fouls', 'foulouts'].includes(sortStat) ? 'Below Average' : 'Above Average'}</span>
                                </div>
                                <div className="key-item">
                                    <div className="color-box yellow"></div>
                                    <span>Average</span>
                                </div>
                                <div className="key-item">
                                    <div className="color-box red"></div>
                                    <span>{['turnovers', 'personal_fouls', 'tech_fouls', 'flagrant_fouls', 'foulouts'].includes(sortStat) ? 'Above Average' : 'Below Average'}</span>
                                </div>
                            </div>
                        </div>


                        <div className="data-table">
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
                                        </>
                                    )}
                                    {statCategory === 'percentages' && (
                                        <>
                                            <th>Field Goal %</th>
                                            <th>2 Pointer %</th>
                                            <th>3 Pointer %</th>
                                            <th>Free Throw %</th>
                                        </>
                                    )}
                                    {statCategory === 'fouls' && (
                                        <>
                                            <th>Personal Fouls</th>
                                            <th>Technical Fouls</th>
                                            <th>Flagrant Fouls</th>
                                            <th>Foulouts</th>
                                        </>
                                    )}
                                </tr>
                                </thead>
                                <tbody>
                                {sortedLeaders.length > 0 ? (
                                    sortedLeaders.map((leader, index) => (
                                        <tr key={index}>
                                            <td className={sortStat === 'rank' || sortStat === 'N/A' ? 'sorted-column' : ''}>{leader.rank}</td>
                                            <td>{leader.player ? leader.player.full_name : 'N/A'}</td>
                                            <td>{leader.player ? leader.player.jersey_number : 'N/A'}</td>
                                            <td>{leader.player ? leader.player.primary_position : 'N/A'}</td>
                                            <td>{leader.totalGames}</td>
                                            <td>{leader.minutes}</td>
                                            {statCategory === 'offensive' && (
                                                <>
                                                    <td className={getColor(leader.points, 'points')}>{leader.points}</td>
                                                    <td className={getColor(leader.assists, 'assists')}>{leader.assists}</td>
                                                    <td className={getColor(leader.rebounds, 'rebounds')}>{leader.rebounds}</td>
                                                    <td className={getColor(leader.turnovers, 'turnovers')}>{leader.turnovers}</td>
                                                    {/*<td>{leader.points !== undefined ? leader.points : 'N/A'}</td>*/}
                                                    {/*<td>{leader.assists !== undefined ? leader.assists : 'N/A'}</td>*/}
                                                    {/*<td>{leader.rebounds !== undefined ? leader.rebounds : 'N/A'}</td>*/}
                                                    {/*<td>{leader.turnovers !== undefined ? leader.turnovers : 'N/A'}</td>*/}
                                                </>
                                            )}
                                            {statCategory === 'defensive' && (
                                                <>
                                                    <td className={getColor(leader.steals, 'steals')}>{leader.steals}</td>
                                                    <td className={getColor(leader.blocks, 'blocks')}>{leader.blocks}</td>
                                                </>
                                            )}
                                            {statCategory === 'percentages' && (
                                                <>
                                                    <td className={getColor(leader.field_goals_pct, 'field_goals_pct')}>{leader.field_goals_pct}</td>
                                                    <td className={getColor(leader.two_points_pct, 'two_points_pct')}>{leader.two_points_pct}</td>
                                                    <td className={getColor(leader.three_points_pct, 'three_points_pct')}>{leader.three_points_pct}</td>
                                                    <td className={getColor(leader.free_throws_pct, 'free_throws_pct')}>{leader.free_throws_pct}</td>
                                                </>
                                            )}
                                            {statCategory === 'fouls' && (
                                                <>
                                                    <td className={getColor(leader.personal_fouls, 'personal_fouls')}>{leader.personal_fouls}</td>
                                                    <td className={getColor(leader.tech_fouls, 'tech_fouls')}>{leader.tech_fouls}</td>
                                                    <td className={getColor(leader.flagrant_fouls, 'flagrant_fouls')}>{leader.flagrant_fouls}</td>
                                                    <td className={getColor(leader.foulouts, 'foulouts')}>{leader.foulouts}</td>
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
                </>
            )}


            {/*{view === 'teams' && (*/}
            {/*    <>*/}
            {/*        {error && <p>Error: {error}</p>}*/}
            {/*        <div className="table-container">*/}
            {/*            <table>*/}
            {/*                <thead>*/}
            {/*                <tr>*/}
            {/*                    <th>Team City</th>*/}
            {/*                    <th>Team Name</th>*/}
            {/*                </tr>*/}
            {/*                </thead>*/}
            {/*                <tbody>*/}
            {/*                {teams.length > 0 ? (*/}
            {/*                    // Filter to show only specific teams based on indexes and then sort by market name*/}
            {/*                    teams.filter((team, index) =>*/}
            {/*                        [1, 5, 7, 8, 9, 10, 17, 19, 20, 21, 24, 25, 27, 28, 31, 32, 33, 34, 35, 38, 39, 41, 43, 46, 47, 56, 57, 58, 60, 63].includes(index)*/}
            {/*                    ) // Only include specific teams based on indexes*/}
            {/*                        .sort((a, b) => a.market.localeCompare(b.market)) // Sort alphabetically by the market name*/}
            {/*                        .map((team, index) => (*/}
            {/*                            <tr key={index}>*/}
            {/*                                <td>{team.market + ' (' + team.alias + ')'}</td>*/}
            {/*                                <td>{team.name}</td>*/}
            {/*                            </tr>*/}
            {/*                        ))*/}
            {/*                ) : (*/}
            {/*                    <tr>*/}
            {/*                        <td colSpan="4">No data available</td>*/}
            {/*                        /!* Adjusted to colSpan to match table structure *!/*/}
            {/*                    </tr>*/}
            {/*                )}*/}
            {/*                </tbody>*/}
            {/*            </table>*/}
            {/*        </div>*/}
            {/*    </>*/}
            {/*)}*/}


        </div>
    );
}

export default NBAStatLeaders;
