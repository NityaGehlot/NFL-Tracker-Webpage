import React, { useEffect, useState } from 'react';
import './NBAStandings.css';

const NBAStandings = () => {
    const [teams, setTeams] = useState({});
    const apiKey = "vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9"; // Replace with your SportsRadar API key
    const season = "2024";

    useEffect(() => {
        fetchTeamsAndSchedules();
    }, []);

    const fetchTeamsAndSchedules = async () => {
        const nbaTeamsURL = "http://localhost:5000/api/nba-teams";
        
        const fetchedTeams = {};

        try {
            const response = await fetch(nbaTeamsURL);
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            const data = await response.json();

            for (const conference of data.conferences) {
                for (const division of conference.divisions) {
                    for (const team of division.teams) {
                        fetchedTeams[team.id] = { name: team.name, market: team.market, schedule: [] };
                        await fetchTeamSchedule(team.id, fetchedTeams);
                    }
                }
            }
            setTeams(fetchedTeams);
        } catch (error) {
            console.error("Failed to fetch NBA teams or schedules:", error);
        }
    };

    const fetchTeamSchedule = async (teamId, fetchedTeams) => {
        const teamScheduleURL = (teamId) => `http://localhost:5000/api/nba-teams/${teamId}/schedule`;
        try {
            const response = await fetch(teamScheduleURL);
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            const scheduleData = await response.json();
            fetchedTeams[teamId].schedule = scheduleData.games;
        } catch (error) {
            console.error(`Failed to fetch schedule for team ${teamId}:`, error);
        }
    };

    // Helper function to get logo path based on team name
    const getLogoPath = (market, name) => {
        const formattedName = `${market}${name}`.replace(/\s+/g, '');
        return `${process.env.PUBLIC_URL}/images/${formattedName}.png`;
    };

    return (
        <div className="nba-standings">
            <h2>NBA Team Schedules</h2>
            {Object.keys(teams).map(teamId => (
                <div key={teamId} className="team-schedule">
                    <h3>{teams[teamId].market} {teams[teamId].name} Schedule</h3>
                    <div className="schedule-container">
                        {teams[teamId].schedule.map(game => {
                            const gameDate = new Date(game.scheduled).toLocaleDateString();
                            const isPastGame = new Date() > new Date(game.scheduled);
                            const gameResult = game.home_points !== null && game.away_points !== null;
                            const homeIsWinner = gameResult && game.home_points > game.away_points;
                            const awayIsWinner = gameResult && game.away_points > game.home_points;

                            const homeLogo = getLogoPath(game.home.market, game.home.name);
                            const awayLogo = getLogoPath(game.away.market, game.away.name);

                            return (
                                <div key={game.id} className="game">
                                    <p>{gameDate}</p>
                                    <img src={homeLogo} alt={game.home.name} className={`team-logo ${homeIsWinner ? 'winner-logo' : 'loser-logo'}`} />
                                    <span>vs</span>
                                    <img src={awayLogo} alt={game.away.name} className={`team-logo ${awayIsWinner ? 'winner-logo' : 'loser-logo'}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NBAStandings;
