import React, { useState, useEffect } from 'react';
import './Calendar.css';

// Assuming logos are saved in the 'assets/images/' directory inside the public folder
const teamLogos = {
    'ATL': '/images/AtlantaHawks.png',
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

const Calendar = () => {
    const [games, setGames] = useState([]); // Holds the list of games for the day
    const [error, setError] = useState(null); // Holds any fetch errors
    const [selectedYear, setSelectedYear] = useState('2024'); // Default year
    const [selectedMonth, setSelectedMonth] = useState('01'); // Default month
    const [selectedDay, setSelectedDay] = useState('01'); // Default day
    const [daysInMonth, setDaysInMonth] = useState([]); // Holds days in selected month

    useEffect(() => {
        updateDaysInMonth(selectedYear, selectedMonth); // Update days when year or month changes
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchDailySchedule(selectedYear, selectedMonth, selectedDay); // Fetch schedule for the selected date
    }, [selectedYear, selectedMonth, selectedDay]);

    const fetchDailySchedule = (year, month, day) => {
        const options = { method: 'GET', headers: { accept: 'application/json' } };

        fetch(`http://localhost:8080/https://api.sportradar.com/nba/trial/v8/en/games/${year}/${month}/${day}/schedule.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`, options)

            .then((res) => {
                // Check if the response is OK (status code 200)
                if (res.ok) {
                    return res.json(); // Parse as JSON if OK
                } else {
                    // If the response is not OK, throw an error
                    return res.text().then((text) => {
                        throw new Error(`Error: ${res.status} - ${text}`);
                    });
                }
            })
            .then((data) => {
                console.log(data); // Inspect the data structure
                setGames(data.games); // Set games data
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load games.");
            });
    };


    const updateDaysInMonth = (year, month) => {
        // Create a Date object for the first day of the next month
        const date = new Date(year, month, 0); // month is 0-based in Date (January is 0)
        const totalDays = date.getDate(); // Get the number of days in the month
        const days = [];
        for (let i = 1; i <= totalDays; i++) {
            days.push(i.toString().padStart(2, '0')); // Add leading zero for single-digit days
        }
        setDaysInMonth(days); // Set the days for the selected month
        setSelectedDay('01'); // Reset to the first day
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleDayChange = (event) => {
        setSelectedDay(event.target.value);
    };

    return (
        <div className="calendar-screen">
            <h1>NBA Game Schedule</h1>

            {error && <p className="error">{error}</p>}

            {/* Dropdown Container for Year, Month, and Day */}
            <div className="date-dropdown-container">
                {/* Year Dropdown */}
                <div className="date-dropdown">
                    <label htmlFor="year">Select Year:</label>
                    <select id="year" value={selectedYear} onChange={handleYearChange}>
                        {Array.from({ length: 11 }, (_, i) => 2024 - i).map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Month Dropdown */}
                <div className="date-dropdown">
                    <label htmlFor="month">Select Month:</label>
                    <select id="month" value={selectedMonth} onChange={handleMonthChange}>
                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>

                {/* Day Dropdown */}
                <div className="date-dropdown">
                    <label htmlFor="day">Select Day:</label>
                    <select id="day" value={selectedDay} onChange={handleDayChange}>
                        {daysInMonth.map((day) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                </div>
            </div>

            {games.length > 0 ? (
                <div className="game-table">
                    <table>
                        <thead>
                        <tr>
                            <th>Time</th>
                            <th>Home Team</th>
                            <th>Away Team</th>
                            <th>Score</th>
                            <th>Venue</th>
                            <th>Broadcast</th>
                        </tr>
                        </thead>
                        <tbody>
                        {games.map((game) => (
                            <tr key={game.id}>
                                <td>{new Date(game.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td>
                                    <img
                                        src={teamLogos[game.home.alias] || '/images/placeholder.png'}
                                        alt={game.home.name}
                                        className="team-logo"
                                    />
                                    {game.home.name} ({game.home.alias})
                                </td>
                                <td>
                                    <img
                                        src={teamLogos[game.away.alias] || '/images/placeholder.png'}
                                        alt={game.away.name}
                                        className="team-logo"
                                    />
                                    {game.away.name} ({game.away.alias})
                                </td>
                                <td>
                                    <div className="score-cell">
                                        <img
                                            src={teamLogos[game.home.alias] || '/images/placeholder.png'}
                                            alt={game.home.name}
                                            className="score-logo"
                                        />
                                        <span>{game.home_points}</span> - <span>{game.away_points}</span>
                                        <img
                                            src={teamLogos[game.away.alias] || '/images/placeholder.png'}
                                            alt={game.away.name}
                                            className="score-logo"
                                        />
                                    </div>
                                </td>
                                <td>{game.venue.name}, {game.venue.city}</td>
                                <td>
                                    {game.broadcasts?.map((broadcast, idx) => (
                                        <div key={idx}>
                                            {broadcast.network} ({broadcast.locale})
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No games available for this date.</p>
            )}
        </div>
    );
};

export default Calendar;
