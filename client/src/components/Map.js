import React, { useEffect, useRef } from 'react';
import '../styles/Map.css';

function Map({ center, markers = [] }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize the map
    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 13,
        styles: [
          // Add some custom styling to match the app's sketch aesthetic
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ visibility: 'simplified' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#a1e3d8' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{ color: '#b5e8c3' }]
          }
        ]
      });
    } else {
      // Update center if it changes
      googleMapRef.current.setCenter(center);
    }
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add markers
    markers.forEach(marker => {
      if (!marker.position) return;
      
      let icon;
      
      if (marker.type === 'meeting') {
        // Custom icon for meeting point
        icon = {
          path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
          fillColor: '#88d498',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#435058',
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 22)
        };
      } else {
        // Numbered icons for starting points
        icon = {
          path: 'M10,2A8,8 0 0,0 2,10A8,8 0 0,0 10,18A8,8 0 0,0 18,10A8,8 0 0,0 10,2Z',
          fillColor: '#f8c885',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#435058',
          scale: 1.5,
          anchor: new window.google.maps.Point(10, 10),
          labelOrigin: new window.google.maps.Point(10, 10)
        };
      }
      
      const newMarker = new window.google.maps.Marker({
        position: marker.position,
        map: googleMapRef.current,
        icon: icon,
        label: marker.type === 'start' ? {
          text: marker.label.toString(),
          color: '#435058',
          fontWeight: 'bold'
        } : null,
        animation: window.google.maps.Animation.DROP
      });
      
      markersRef.current.push(newMarker);
    });
    
    // Fit bounds if there are multiple markers
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(marker => {
        if (marker.position) {
          bounds.extend(marker.position);
        }
      });
      googleMapRef.current.fitBounds(bounds);
    }
  }, [center, markers]);
  
  return (
    <div className="map-container sketch-container">
      <div ref={mapRef} className="map"></div>
      
      {markers.length === 0 && (
        <div className="map-placeholder">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24">
            <path d="M17.5 8.5 14 17l-9-4.5 5.5-5.5"></path>
            <path d="m8 2 1 1"></path>
            <path d="m2 8 1 1"></path>
            <path d="m14 2 1 1"></path>
            <path d="m20 8 1 1"></path>
            <path d="m8 14 1 1"></path>
            <path d="m2 20 1 1"></path>
            <path d="m14 20 1 1"></path>
            <path d="m20 14 1 1"></path>
          </svg>
          <p>Map will display here with all locations</p>
        </div>
      )}
    </div>
  );
}

export default Map;