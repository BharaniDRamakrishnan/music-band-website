import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <div className="overlay">
        <h1>Welcome to Music Band </h1>
        <p>Your one-stop place for albums, events, and our musical journey.</p>
        <Link to="/auth">
          <button className="explore-btn">Explore Our Music</button>
        </Link>
      </div>
    </div>
  );
}
