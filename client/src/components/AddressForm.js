// client/src/components/AddressForm.js
import React, { useRef, useEffect } from 'react';
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
  loading,
  googleMapsLoaded
}) {
  // Create refs for input fields to attach autocomplete
  const inputRefs = useRef({});

  // Set up Google Places Autocomplete for address fields
  useEffect(() => {
    if (!googleMapsLoaded) {
      console.log('Google Maps not loaded yet, autocomplete will be initialized once loaded');
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps Places API not loaded correctly');
      return;
    }

    console.log('Setting up autocomplete for address fields');

    // Setup autocomplete for each input field
    locations.forEach(location => {
      const inputRef = inputRefs.current[location.id];
      if (!inputRef) {
        console.log(`Input ref for location ${location.id} not found`);
        return;
      }

      // Clear any existing autocomplete instances
      if (inputRef.autocomplete) {
        // Clean up any event listeners
        window.google.maps.event.clearInstanceListeners(inputRef.autocomplete);
        inputRef.autocomplete = null;
      }

      try {
        // Create new autocomplete instance
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef, {
          componentRestrictions: { country: 'fr' }, // Restrict to France
          fields: ['address_components', 'formatted_address', 'geometry'],
          types: ['address'],
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(48.8156, 2.2240), // SW corner of Paris
            new window.google.maps.LatLng(48.9021, 2.4699)  // NE corner of Paris
          ),
          strictBounds: true
        });

        // Store the autocomplete instance
        inputRef.autocomplete = autocomplete;

        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry) {
            console.warn("No geometry returned for this place");
            return;
          }

          console.log(`Selected place for location ${location.id}:`, place.formatted_address);

          // Update location with the selected address and its geocoded position
          onLocationChange(location.id, 'address', place.formatted_address);
          onLocationChange(location.id, 'geocoded', {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        });

        console.log(`Autocomplete setup complete for location ${location.id}`);
      } catch (error) {
        console.error('Error setting up autocomplete:', error);
      }
    });

    // Cleanup function
    return () => {
      // Remove listeners when component unmounts
      Object.values(inputRefs.current).forEach(ref => {
        if (ref && ref.autocomplete) {
          window.google.maps.event.clearInstanceListeners(ref.autocomplete);
        }
      });
    };
  }, [locations, onLocationChange, googleMapsLoaded]);

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
                ref={el => inputRefs.current[location.id] = el}
                type="text" 
                className={`address-input sketch-input ${location.geocoded ? 'geocoded' : ''}`}
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
            disabled={loading || !googleMapsLoaded}
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