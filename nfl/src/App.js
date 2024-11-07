// Import necessary libraries
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NBAStandings from './NBAStandings';
import NBAStatLeaders from './NBAStatLeaders';
import FantasyPlayerInfo from './FantasyPlayerInfo';
import TeamStats from "./TeamStats";

// Define simple components for each page
const Home = () => <div className="content"><h2>Welcome to the Homepage!</h2></div>;
const PageTwo = () => <div className="content"><h2>???</h2></div>;
const PageThree = () => <div className="content"><h2>NBA Stat Leaders</h2></div>;
const PageFour = () => <div className="content"><h2>NBA Fantasy</h2></div>;

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
                        <Route path="/page2" element={<TeamStats />} />
                        <Route path="/page3" element={<NBAStatLeaders />} />
                        <Route path="/page4" element={<FantasyPlayerInfo />} />
                    </Routes>
                </main>

                {/* Navigation bar at the bottom with clickable sections */}
                <nav className="navbar">
                    <Link to="/page1" className="nav-item"><span>NBA Standings</span></Link>
                    <Link to="/page2" className="nav-item"><span>Team Stats</span></Link>
                    <Link to="/page3" className="nav-item"><span>Player Stats</span></Link>
                    <Link to="/page4" className="nav-item"><span>NBA Fantasy</span></Link>
                </nav>
            </div>
        </Router>
    );
}

export default App;