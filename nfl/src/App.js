// Import necessary libraries
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NBAStandings from './NBAStandings';

// Define simple components for each page
const Home = () => <div className="content"><h2>Welcome to the Homepage!</h2></div>;
const PageTwo = () => <div className="content"><h2>Welcome to the Fantasy Page!</h2></div>;
const PageThree = () => <div className="content"><h2>Page Three Content</h2></div>;
const PageFour = () => <div className="content"><h2>Page Four Content</h2></div>;

function App() {
    return (
        <Router>
            <div className="app">
                {/* Big title */}
                <header className="title">
                    <h1>My React Webpage</h1>
                </header>

                {/* Main content area where different pages are displayed */}
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/page1" element={<NBAStandings />} />
                        <Route path="/page2" element={<PageTwo />} />
                        <Route path="/page3" element={<PageThree />} />
                        <Route path="/page4" element={<PageFour />} />
                    </Routes>
                </main>

                {/* Navigation bar at the bottom with clickable sections */}
                <nav className="navbar">
                    <Link to="/page1" className="nav-item"><span>NBA Standings</span></Link>
                    <Link to="/page2" className="nav-item"><span>NBA Fantasy</span></Link>
                    <Link to="/page3" className="nav-item"><span>Section 3</span></Link>
                    <Link to="/page4" className="nav-item"><span>Section 4</span></Link>
                </nav>
            </div>
        </Router>
    );
}

export default App;
