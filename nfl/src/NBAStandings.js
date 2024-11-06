import React, { Component } from 'react';

class NBAStandings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            standings: [], // Holds the processed teams data
            previousStandings: [], // Holds the processed teams data for the previous year
            selectedFilter: "NBA", // The selected filter for displaying teams
            selectedYear: "2024", // Default year to fetch
            error: null, // Holds any error message
        };
    }

    // Available years for the dropdown
    years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013"]; // Example years (update with available ones)

    componentDidMount() {
        this.fetchStandingsData(this.state.selectedYear); // Fetch data for the initial year
    }

    // Fetch data for the selected year and the previous year
    fetchStandingsData = (year) => {
        const options = { method: 'GET', headers: { accept: 'application/json' } };

        // Fetch current year
        fetch(`https://cors-anywhere.herokuapp.com/https://api.sportradar.com/nba/trial/v8/en/seasons/${year}/REG/standings.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`, options)
            .then(res => res.json())
            .then(data => {
                console.log(data); // Log the full API response to inspect
                const allTeams = [];

                // Process each team for the current year
                data.conferences.forEach(conference => {
                    conference.divisions.forEach(division => {
                        division.teams.forEach(team => {
                            allTeams.push({
                                teamName: `${team.market} ${team.name}`,
                                conference: conference.name,
                                conferenceAlias: conference.alias,
                                division: division.name,
                                divisionAlias: division.alias,
                                wins: team.wins,
                                losses: team.losses,
                                win_pct: team.win_pct,
                            });
                        });
                    });
                });

                // Save current year standings
                this.setState({ standings: allTeams });

                // Now fetch previous year data for comparison
                const prevYear = (parseInt(year) - 1).toString();
                return fetch(`https://cors-anywhere.herokuapp.com/https://api.sportradar.com/nba/trial/v8/en/seasons/${prevYear}/REG/standings.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`, options);
            })
            .then(res => res.json())
            .then(prevData => {
                console.log(prevData); // Log the previous year data
                const prevTeams = [];

                // Process each team for the previous year
                prevData.conferences.forEach(conference => {
                    conference.divisions.forEach(division => {
                        division.teams.forEach(team => {
                            prevTeams.push({
                                teamName: `${team.market} ${team.name}`,
                                win_pct: team.win_pct,
                            });
                        });
                    });
                });

                // Save previous year standings
                this.setState({ previousStandings: prevTeams });
            })
            .catch(err => this.setState({ error: err.message }));
    };

    // Handle dropdown change for filter
    handleFilterChange = (event) => {
        this.setState({ selectedFilter: event.target.value });
    };

    // Handle dropdown change for year
    handleYearChange = (event) => {
        const selectedYear = event.target.value;
        this.setState({ selectedYear });
        this.fetchStandingsData(selectedYear); // Fetch data for the selected year
    };

    // Filter teams based on selected dropdown value
    getFilteredTeams = () => {
        const { standings, previousStandings, selectedFilter, selectedYear } = this.state;
        let filteredTeams = [];

        // When "NBA" is selected, show all teams
        if (selectedFilter === "NBA") {
            filteredTeams = standings;
        }
        // When filtering by conference
        else if (selectedFilter === "EASTERN CONFERENCE" || selectedFilter === "WESTERN CONFERENCE") {
            filteredTeams = standings.filter(team => team.conference === selectedFilter);
        }
        // When filtering by division
        else {
            filteredTeams = standings.filter(team => team.division === selectedFilter);
        }

        // Sort teams by win percentage (desc), and if win percentages are the same, by wins (desc)
        filteredTeams = filteredTeams.sort((a, b) => {
            if (b.win_pct !== a.win_pct) {
                return b.win_pct - a.win_pct;
            }
            return b.wins - a.wins;
        });

        // Assign rank based on sorted position, handle same win percentage with the same rank
        let rank = 1;
        let lastWinPct = null;
        filteredTeams = filteredTeams.map((team, index) => {
            if (team.win_pct !== lastWinPct) {
                lastWinPct = team.win_pct;
                rank = index + 1; // Assign new rank when the win percentage changes
            }

            // Find the corresponding team from the previous year for comparison
            const previousTeam = previousStandings.find(prevTeam => prevTeam.teamName === team.teamName);
            let arrow = null;
            let bgColor = "transparent"; // Default background


            // Only compare if the previous year is available (skip for 2013)
            if (selectedYear !== "2013" && previousTeam) {
                // Compare win percentage
                if (team.win_pct > previousTeam.win_pct) {
                    arrow = "↑"; // Green up arrow for better performance
                    bgColor = "lightgreen"; // Light green background
                } else if (team.win_pct < previousTeam.win_pct) {
                    arrow = "↓"; // Red down arrow for worse performance
                    bgColor = "lightcoral"; // Light red background
                }
            }

            return {
                ...team,
                rank: rank,
                arrow: arrow, // Add arrow for comparison
                bgColor: bgColor, // Add background color
            };
        });

        return filteredTeams;
    };

    render() {
        const { error, selectedFilter, selectedYear } = this.state;
        const filteredTeams = this.getFilteredTeams();

        return (
            <div className="nba-standings">
                <h1>NBA Standings - {selectedYear} Season</h1>

                {error && <p className="error">Error: {error}</p>}

                {/* Dropdown for selecting year */}
                <div className="year-dropdown">
                    <label htmlFor="year">Select Year: </label>
                    <select id="year" value={selectedYear} onChange={this.handleYearChange}>
                        {this.years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Dropdown for sorting */}
                <div className="filter-dropdown">
                    <label htmlFor="filter">Filter by: </label>
                    <select id="filter" value={selectedFilter} onChange={this.handleFilterChange}>
                        <option value="NBA">NBA (All Teams)</option>
                        <option value="EASTERN CONFERENCE">Eastern Conference</option>
                        <option value="WESTERN CONFERENCE">Western Conference</option>
                        <option value="Central">Central Division</option>
                        <option value="Atlantic">Atlantic Division</option>
                        <option value="Southeast">Southeast Division</option>
                        <option value="Pacific">Pacific Division</option>
                        <option value="Northwest">Northwest Division</option>
                        <option value="Southwest">Southwest Division</option>
                    </select>
                </div>

                {/* Scrollable table container */}
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Rank</th> {/* New column for rank */}
                            <th>Team Name</th>
                            <th>Conference</th>
                            <th>Division</th>
                            <th>Wins</th>
                            <th>Losses</th>
                            <th>Win Percentage</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTeams.length > 0 ? (
                            filteredTeams.map((team, index) => (
                                <tr key={index}>
                                    <td>{team.rank}</td> {/* Display rank */}
                                    <td>{team.teamName}</td>
                                    <td>{team.conferenceAlias}</td>
                                    <td>{team.divisionAlias}</td>
                                    <td>{team.wins}</td>
                                    <td>{team.losses}</td>
                                    <td
                                        style={{
                                            backgroundColor: team.bgColor, // Set background color for win percentage cell
                                        }}
                                    >

                                        {`${(team.win_pct * 100).toFixed(2)}%`}
                                        {team.arrow && (
                                            <span>
                                                {team.arrow === "↑" ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="40" // Make the arrow wider
                                                        height="16" // Make the arrow shorter
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke={team.arrow === "↑" ? "green" : "red"}
                                                        strokeWidth="4" // Increase the thickness of the arrow
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M12 19V6m0 0l-7 7m7-7l7 7"></path>
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="40" // Make the arrow wider
                                                        height="16" // Make the arrow shorter
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke={team.arrow === "↑" ? "green" : "red"}
                                                        strokeWidth="4" // Increase the thickness of the arrow
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M12 5v13m0 0l7-7m-7 7l-7-7"></path>
                                                    </svg>
                                                )}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No data available</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default NBAStandings;
