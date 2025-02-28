import React, { useState } from 'react';
import Header from './components/Header';
import AddressForm from './components/AddressForm';
import Map from './components/Map';
import Results from './components/Results';
import axios from 'axios';
import './styles/App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [locations, setLocations] = useState([
    { id: 1, address: '', transportMode: 'walking' },
    { id: 2, address: '', transportMode: 'walking' }
  ]);
  const [venueType, setVenueType] = useState('café');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris center

  const handleAddLocation = () => {
    if (locations.length < 10) {
      setLocations([
        ...locations,
        {
          id: Date.now(), // unique ID
          address: '',
          transportMode: 'walking'
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
  };

  const handleVenueTypeChange = (type) => {
    setVenueType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty addresses
      const validLocations = locations.filter(loc => loc.address.trim() !== '');
      
      if (validLocations.length < 2) {
        throw new Error('Please enter at least 2 valid addresses');
      }

      const response = await axios.post(`${API_URL}/meeting/calculate`, {
        locations: validLocations,
        venueType
      });

      setResults(response.data);
      setMapCenter(response.data.meetingPoint);
    } catch (err) {
      console.error('Error calculating meeting point:', err);
      setError(err.response?.data?.error || err.message || 'Failed to calculate meeting point');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
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
          />
          
          {results && (
            <Results results={results} />
          )}
        </div>
        
        <div className="map-section">
          <Map 
            center={mapCenter}
            markers={results ? [
              ...locations.map(loc => ({ 
                position: loc.geocoded, 
                type: 'start', 
                label: locations.findIndex(l => l.id === loc.id) + 1 
              })),
              { position: results.meetingPoint, type: 'meeting' }
            ] : []}
          />
        </div>
      </div>
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;