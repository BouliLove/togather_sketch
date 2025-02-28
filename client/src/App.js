// client/src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AddressForm from './components/AddressForm';
import Map from './components/Map';
import Results from './components/Results';
import GoogleMapsScript from './components/GoogleMapsScript';
import axios from 'axios';
import './styles/App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [locations, setLocations] = useState([
    { id: 1, address: '', transportMode: 'walking', geocoded: null },
    { id: 2, address: '', transportMode: 'walking', geocoded: null }
  ]);
  const [venueType, setVenueType] = useState('Café');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris center
  const [mapMarkers, setMapMarkers] = useState([]);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Update map markers whenever locations or results change
  useEffect(() => {
    const newMarkers = [];
    
    // Add starting point markers for locations with geocoded coordinates
    locations.forEach((location, index) => {
      if (location.geocoded) {
        newMarkers.push({
          position: location.geocoded,
          type: 'start',
          label: index + 1
        });
      }
    });
    
    // Add meeting point marker if results exist
    if (results && results.meetingPoint) {
      newMarkers.push({
        position: results.meetingPoint,
        type: 'meeting'
      });
      
      // If we have results, center the map on the meeting point
      setMapCenter(results.meetingPoint);
    } else if (newMarkers.length > 0) {
      // If we have locations but no meeting point yet, center the map on the most recently added location
      const lastValidLocation = [...locations]
        .reverse()
        .find(loc => loc.geocoded);
        
      if (lastValidLocation && lastValidLocation.geocoded) {
        setMapCenter(lastValidLocation.geocoded);
      }
    }
    
    setMapMarkers(newMarkers);
  }, [locations, results]);

  const handleGoogleMapsLoaded = () => {
    console.log('Google Maps loaded in App component');
    setGoogleMapsLoaded(true);
  };

  const handleAddLocation = () => {
    if (locations.length < 10) {
      setLocations([
        ...locations,
        {
          id: Date.now(), // unique ID
          address: '',
          transportMode: 'walking',
          geocoded: null
        }
      ]);
    }
  };

  const handleRemoveLocation = (id) => {
    if (locations.length > 2) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const handleLocationChange = (id, field, value) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
    
    // If we're updating an address manually, clear its geocoded value
    if (field === 'address') {
      setLocations(locations.map(loc => 
        loc.id === id ? { ...loc, address: value, geocoded: null } : loc
      ));
    }
  };

  const handleVenueTypeChange = (type) => {
    setVenueType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out locations without geocoded coordinates
      const validLocations = locations.filter(loc => loc.geocoded && loc.address.trim() !== '');
      
      if (validLocations.length < 2) {
        throw new Error('Please enter at least 2 valid addresses');
      }

      const response = await axios.post(`${API_URL}/meeting/calculate`, {
        locations: validLocations.map(loc => ({
          address: loc.address,
          transportMode: loc.transportMode,
          lat: loc.geocoded.lat,
          lng: loc.geocoded.lng
        })),
        venueType
      });

      setResults(response.data);
    } catch (err) {
      console.error('Error calculating meeting point:', err);
      setError(err.response?.data?.error || err.message || 'Failed to calculate meeting point');
    } finally {
      setLoading(false);
    }
  };

  // Check if a location has valid coordinates
  const hasValidCoordinates = (location) => {
    return location.geocoded && 
           typeof location.geocoded.lat === 'number' && 
           typeof location.geocoded.lng === 'number';
  };

  // Calculate how many valid locations we have
  const validLocationCount = locations.filter(hasValidCoordinates).length;

  return (
    <div className="container">
      <GoogleMapsScript onLoad={handleGoogleMapsLoaded} />
      <Header />
      
      <div className="main-layout">
        <div className="top-section">
          <AddressForm 
            locations={locations}
            venueType={venueType}
            onAddLocation={handleAddLocation}
            onRemoveLocation={handleRemoveLocation}
            onLocationChange={handleLocationChange}
            onVenueTypeChange={handleVenueTypeChange}
            onSubmit={handleSubmit}
            loading={loading}
            googleMapsLoaded={googleMapsLoaded}
          />
          
          {results && (
            <Results results={results} />
          )}
        </div>
        
        <div className="map-section">
          <Map 
            center={mapCenter}
            markers={mapMarkers}
            googleMapsLoaded={googleMapsLoaded}
          />
        </div>
      </div>
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}
      
      {/* Show helper message if coordinates are missing */}
      {!loading && !error && validLocationCount < locations.length && (
        <div className="helper-message">
          <p>Please enter complete addresses for all starting points using the autocomplete suggestions.</p>
        </div>
      )}
      
      {/* Show loading message if Google Maps is not loaded yet */}
      {!googleMapsLoaded && (
        <div className="helper-message">
          <p>Loading Google Maps... If the map doesn't appear, please check your API key configuration.</p>
        </div>
      )}
    </div>
  );
}

export default App;