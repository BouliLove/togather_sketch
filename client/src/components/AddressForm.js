import React from 'react';
import SketchContainer from './SketchContainer';
import '../styles/AddressForm.css';

const VENUE_TYPES = [
  'Café', 'Restaurant', 'Bar', 'Park', 'Museum', 'Cinema'
];

const TRANSPORT_MODES = [
  { value: 'walking', emoji: '🚶‍♂️', label: 'Walking' },
  { value: 'bicycling', emoji: '🚲', label: 'Cycling' },
  { value: 'transit', emoji: '🚇', label: 'Transit' },
  { value: 'driving', emoji: '🚗', label: 'Driving' }
];

function AddressForm({ 
  locations, 
  venueType, 
  onAddLocation, 
  onRemoveLocation, 
  onLocationChange, 
  onVenueTypeChange, 
  onSubmit,
  loading
}) {
  return (
    <SketchContainer className="form-container">
      <h2 className="form-title">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        Starting Points
      </h2>
      
      <form onSubmit={onSubmit}>
        {locations.map((location, index) => (
          <div className="address-row-container" key={location.id}>
            <div className="address-number-container">
              <div className="address-number">{index + 1}</div>
            </div>
            <div className="address-input-container">
              <input 
                type="text" 
                className="address-input sketch-input" 
                placeholder="Enter address in Paris"
                value={location.address}
                onChange={(e) => onLocationChange(location.id, 'address', e.target.value)}
                required
              />
              <select 
                className="transport-select sketch-input"
                value={location.transportMode}
                onChange={(e) => onLocationChange(location.id, 'transportMode', e.target.value)}
              >
                {TRANSPORT_MODES.map(mode => (
                  <option key={mode.value} value={mode.value}>{mode.emoji}</option>
                ))}
              </select>
              
              {index > 1 && (
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => onRemoveLocation(location.id)}
                >×</button>
              )}
            </div>
          </div>
        ))}
        
        <div className="venue-type-container">
          <h3 className="venue-type-title">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 3h7v7H3z"></path>
              <path d="M14 3h7v7h-7z"></path>
              <path d="M14 14h7v7h-7z"></path>
              <path d="M3 14h7v7H3z"></path>
            </svg>
            Venue Type
          </h3>
          
          <div className="venue-type-options">
            {VENUE_TYPES.map(type => (
              <button
                key={type}
                type="button"
                className={`venue-option ${venueType === type ? 'active' : ''}`}
                onClick={() => onVenueTypeChange(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="buttons-container">
          <button 
            type="button" 
            className="add-address-button"
            onClick={onAddLocation}
            disabled={locations.length >= 10 || loading}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v8"></path>
              <path d="M8 12h8"></path>
            </svg>
            Add Location
          </button>
          
          <button 
            type="submit" 
            className="compute-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                Calculating...
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                Find Meeting Point
              </>
            )}
          </button>
        </div>
      </form>
    </SketchContainer>
  );
}

export default AddressForm;