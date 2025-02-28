import React from 'react';
import '../styles/Results.css';

function Results({ results }) {
  return (
    <div className="results-container sketch-container">
      <h2 className="results-title">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="m9 11 3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        Perfect Meeting Point Found!
      </h2>
      
      <div className="result-address">
        {results.venueName}, {results.venueAddress}
      </div>
      
      <div className="result-stats">
        <div className="stat-card">
          <div className="stat-label">Average Travel Time</div>
          <div className="stat-value">{results.averageTravelTime} minutes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Max Travel Time</div>
          <div className="stat-value">{results.maxTravelTime} minutes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Min Travel Time</div>
          <div className="stat-value">{results.minTravelTime} minutes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Combined Time</div>
          <div className="stat-value">{results.totalTravelTime} minutes</div>
        </div>
      </div>
      
      <div className="travel-details">
        <h3>Individual Travel Times</h3>
        <ul className="travel-list">
          {results.travelTimes.map((time, index) => (
            <li key={index} className="travel-item">
              <div className="travel-point">
                <span className="point-number">{index + 1}</span>
              </div>
              <div className="travel-info">
                <span className="travel-time">{time.durationText}</span>
                <span className="travel-mode">
                  {time.transportMode === 'walking' && '🚶‍♂️ '}
                  {time.transportMode === 'bicycling' && '🚲 '}
                  {time.transportMode === 'transit' && '🚇 '}
                  {time.transportMode === 'driving' && '🚗 '}
                  {time.transportMode.charAt(0).toUpperCase() + time.transportMode.slice(1)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Results;