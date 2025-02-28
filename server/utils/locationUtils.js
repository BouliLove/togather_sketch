/**
 * Calculate centroid (average position) of multiple coordinates
 * @param {Array} coordinates - Array of coordinate objects with lat and lng
 * @returns {Object} Centroid coordinates
 */
exports.calculateCentroid = (coordinates) => {
    const count = coordinates.length;
    
    const sumLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    
    return {
      lat: sumLat / count,
      lng: sumLng / count
    };
  };