// Import necessary libraries
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NBAStandings from './NBAStandings';
import NBAStatLeaders from './NBAStatLeaders';

// Define simple components for each page
const Home = () => <div className="content"><h2>Welcome to the Homepage!</h2></div>;
const PageTwo = () => <div className="content"><h2>NBA Fantasy</h2></div>;
const PageThree = () => <div className="content"><h2>NBA Stat Leaders</h2></div>;
const PageFour = () => <div className="content"><h2>Page Four Content</h2></div>;

function App() {
    return (
        <Router>
            <div className="app">
                {/* Big title */}
                <header className="title">
                    {/*<h1>My React Webpage</h1>*/}
                </header>

                {/* Main content area where different pages are displayed */}
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/page1" element={<NBAStandings />} />
                        <Route path="/page2" element={<PageTwo />} />
                        <Route path="/page3" element={<NBAStatLeaders />} />
                        <Route path="/page4" element={<PageFour />} />
                    </Routes>
                </main>

                {/* Navigation bar at the bottom with clickable sections */}
                <nav className="navbar">
                    <Link to="/page1" className="nav-item"><span>NBA Standings</span></Link>
                    <Link to="/page2" className="nav-item"><span>NBA Fantasy</span></Link>
                    <Link to="/page3" className="nav-item"><span>Team/Player Stats</span></Link>
                    <Link to="/page4" className="nav-item"><span>Section 4</span></Link>
                </nav>
            </div>
        </Router>
    );
}

export default App;


// NBAStatLeaders.js
// import React, { useEffect, useState } from 'react';
// import './NBAStatLeaders.css'; // Import the CSS file
//
// function NBAStatLeaders() {
//     const [leaders, setLeaders] = useState([]);
//     const [error, setError] = useState(null);
//     const [selectedStatType, setSelectedStatType] = useState('season'); // Default to season stats
//
//     useEffect(() => {
//         const fetchLeaders = async () => {
//             try {
//                 const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.sportradar.com/nba/trial/v8/en/seasons/2023/REG/leaders.json?api_key=vgQZFqluQZPraL49KlFtaPlNZpZ21DGwOuRovsb9`, {
//                     method: 'GET',
//                     headers: { accept: 'application/json' }
//                 });
//
//                 if (!response.ok) throw new Error('Failed to fetch data');
//
//                 const data = await response.json();
//                 console.log(data); // Check the structure of the data
//
//                 // Get the leaders based on selected stat type
//                 const pointsCategory = data.categories.find(category => category.name === 'points');
//                 const reboundsCategory = data.categories.find(category => category.name === 'rebounds');
//                 const assistsCategory = data.categories.find(category => category.name === 'assists');
//
//                 if (!pointsCategory || !reboundsCategory || !assistsCategory) {
//                     setError("Required categories not found");
//                     return;
//                 }
//
//                 const leadersData = pointsCategory.ranks.map((leader, index) => ({
//                     rank: leader.rank,
//                     player: leader.player,
//                     totalGames: leader.total?.games_played || 'N/A',
//                     points: selectedStatType === 'per_game' ? leader.average?.points : leader.total?.points,
//                     assists: selectedStatType === 'per_game' ? assistsCategory.ranks[index].average?.assists : assistsCategory.ranks[index].total?.assists,
//                     rebounds: selectedStatType === 'per_game' ? reboundsCategory.ranks[index].average?.rebounds : reboundsCategory.ranks[index].total?.rebounds,
//                     turnovers: selectedStatType === 'per_game' ? assistsCategory.ranks[index].average?.turnovers : assistsCategory.ranks[index].total?.turnovers,
//                 }));
//
//                 setLeaders(leadersData);
//             } catch (err) {
//                 setError(err.message);
//             }
//         };
//
//         fetchLeaders();
//     }, [selectedStatType]); // Fetch data when the selected stat type changes
//
//     const handleStatTypeChange = (event) => {
//         setSelectedStatType(event.target.value);
//     };
//
//     return (
//         <div className="content">
//             <h2>NBA Stat Leaders</h2>
//             <label htmlFor="stat-type-select">Select Stat Type:</label>
//             <select id="stat-type-select" value={selectedStatType} onChange={handleStatTypeChange}>
//                 <option value="season">Season Stats</option> {/* First option is now Season Stats */}
//                 <option value="per_game">Per Game Stats</option>
//             </select>
//             {error && <p>Error: {error}</p>}
//             <div className="table-container">
//                 <table>
//                     <thead>
//                     <tr>
//                         <th>Rank</th>
//                         <th>Player</th>
//                         <th>Jersey</th>
//                         <th>Position</th>
//                         <th>Games Played</th>
//                         <th>{selectedStatType === 'per_game' ? 'PPG' : 'Total Points'}</th>
//                         <th>{selectedStatType === 'per_game' ? 'APG' : 'Total Assists'}</th>
//                         <th>{selectedStatType === 'per_game' ? 'RPG' : 'Total Rebounds'}</th>
//                         <th>{selectedStatType === 'per_game' ? 'TPG' : 'Total Turnovers'}</th>
//                     </tr>
//                     </thead>
//                     <tbody>
//                     {leaders.length > 0 ? (
//                         leaders.map((leader, index) => (
//                             <tr key={index}>
//                                 <td>{leader.rank}</td>
//                                 <td>{leader.player ? leader.player.full_name : 'N/A'}</td>
//                                 <td>{leader.player ? leader.player.jersey_number : 'N/A'}</td>
//                                 <td>{leader.player ? leader.player.position : 'N/A'}</td>
//                                 <td>{leader.totalGames}</td>
//                                 <td>{leader.points !== undefined ? leader.points : 'N/A'}</td>
//                                 <td>{leader.assists !== undefined ? leader.assists : 'N/A'}</td>
//                                 <td>{leader.rebounds !== undefined ? leader.rebounds : 'N/A'}</td>
//                                 <td>{leader.turnovers !== undefined ? leader.turnovers : 'N/A'}</td>
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="8">No data available</td>
//                         </tr>
//                     )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }
//
// export default NBAStatLeaders;
