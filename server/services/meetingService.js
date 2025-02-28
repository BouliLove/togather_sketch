const axios = require('axios');
const { calculateCentroid } = require('../utils/locationUtils');

/**
 * Find the best meeting point between multiple locations
 * @param {Array} locations - Array of location objects with address and transportMode
 * @param {String} venueType - Type of venue (cafe, restaurant, etc.)
 * @returns {Object} Best meeting point and travel times
 */
exports.findBestMeetingPoint = async (locations, venueType) => {
  try {
    // 1. Convert all addresses to coordinates
    const coordinates = await Promise.all(
      locations.map(async (location) => {
        const coords = await getCoordinates(location.address);
        return {
          ...coords,
          transportMode: location.transportMode
        };
      })
    );
    
    // 2. Calculate centroid (weighted if needed)
    const center = calculateCentroid(coordinates);
    
    // 3. Find nearby venues of the requested type
    const venues = await findNearbyVenues(center, venueType);
    
    if (!venues.length) {
      throw new Error(`No ${venueType} found near the calculated meeting point`);
    }
    
    // 4. Find the best venue by calculating travel times to each venue
    const bestVenue = await findBestVenue(venues, coordinates);
    
    return {
      meetingPoint: bestVenue.location,
      venueName: bestVenue.name,
      venueAddress: bestVenue.address,
      travelTimes: bestVenue.travelTimes,
      averageTravelTime: bestVenue.averageTravelTime,
      maxTravelTime: bestVenue.maxTravelTime,
      minTravelTime: bestVenue.minTravelTime,
      totalTravelTime: bestVenue.totalTravelTime
    };
  } catch (error) {
    console.error('Error finding best meeting point:', error);
    throw error;
  }
};

/**
 * Get coordinates from address using Google Geocoding API
 */
async function getCoordinates(address) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
          region: 'fr', // France
          components: 'locality:paris' // Restrict to Paris
        }
      }
    );
    
    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding error: ${response.data.status}`);
    }
    
    const location = response.data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to geocode address: ${address}`);
  }
}

/**
 * Find nearby venues using Google Places API
 */
async function findNearbyVenues(center, venueType) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${center.lat},${center.lng}`,
          radius: 500, // Search within 500 meters
          type: mapVenueType(venueType),
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );
    
    if (response.data.status !== 'OK') {
      if (response.data.status === 'ZERO_RESULTS') {
        return [];
      }
      throw new Error(`Places API error: ${response.data.status}`);
    }
    
    // Map results to a simpler format
    return response.data.results.map(venue => ({
      placeId: venue.place_id,
      name: venue.name,
      address: venue.vicinity,
      location: {
        lat: venue.geometry.location.lat,
        lng: venue.geometry.location.lng
      },
      rating: venue.rating
    })).slice(0, 5); // Only get top 5 places
  } catch (error) {
    console.error('Places API error:', error);
    throw new Error(`Failed to find nearby venues`);
  }
}

/**
 * Map venue type to Google Places API type
 */
function mapVenueType(venueType) {
  const typeMap = {
    'café': 'cafe',
    'cafe': 'cafe',
    'restaurant': 'restaurant',
    'bar': 'bar',
    'park': 'park',
    'museum': 'museum',
    'cinema': 'movie_theater'
  };
  
  return typeMap[venueType.toLowerCase()] || 'cafe';
}

/**
 * Find the best venue by calculating travel times from all starting points
 */
async function findBestVenue(venues, startingPoints) {
  const venuesWithTravelTimes = await Promise.all(
    venues.map(async (venue) => {
      const travelTimes = await calculateTravelTimes(venue, startingPoints);
      
      // Calculate statistics
      const times = travelTimes.map(t => t.duration.value);
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      return {
        ...venue,
        travelTimes,
        averageTravelTime: Math.round(avgTime / 60), // Convert to minutes
        maxTravelTime: Math.round(maxTime / 60),
        minTravelTime: Math.round(minTime / 60),
        totalTravelTime: Math.round(totalTime / 60)
      };
    })
  );
  
  // Sort venues by average travel time
  venuesWithTravelTimes.sort((a, b) => a.averageTravelTime - b.averageTravelTime);
  
  return venuesWithTravelTimes[0]; // Return venue with lowest average travel time
}

/**
 * Calculate travel times from each starting point to the venue
 */
async function calculateTravelTimes(venue, startingPoints) {
  try {
    const travelTimes = await Promise.all(
      startingPoints.map(async (point, index) => {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json`,
          {
            params: {
              origin: `${point.lat},${point.lng}`,
              destination: `${venue.location.lat},${venue.location.lng}`,
              mode: point.transportMode || 'walking',
              key: process.env.GOOGLE_MAPS_API_KEY
            }
          }
        );
        
        if (response.data.status !== 'OK') {
          throw new Error(`Directions API error: ${response.data.status}`);
        }
        
        const route = response.data.routes[0].legs[0];
        
        return {
          startPointIndex: index,
          distance: route.distance,
          duration: route.duration,
          durationText: route.duration.text,
          transportMode: point.transportMode
        };
      })
    );
    
    return travelTimes;
  } catch (error) {
    console.error('Directions API error:', error);
    throw new Error(`Failed to calculate travel times`);
  }
}