// client/src/components/GoogleMapsScript.js
import React, { useEffect, useState } from 'react';

const GoogleMapsScript = ({ onLoad }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      setLoaded(true);
      if (onLoad) onLoad();
      return;
    }

    console.log('Loading Google Maps API...');
    
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is missing!');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      setLoaded(true);
      if (onLoad) onLoad();
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google Maps API:', error);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup if component unmounts before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onLoad]);

  return null; // This component doesn't render anything
};

export default GoogleMapsScript;