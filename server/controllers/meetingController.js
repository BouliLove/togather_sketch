const meetingService = require('../services/meetingService');

/**
 * Calculate the best meeting point between multiple locations
 */
exports.calculateMeetingPoint = async (req, res) => {
  try {
    const { locations, venueType } = req.body;
    
    if (!locations || !Array.isArray(locations) || locations.length < 2) {
      return res.status(400).json({ 
        error: 'At least 2 valid locations are required' 
      });
    }
    
    if (!venueType) {
      return res.status(400).json({ 
        error: 'Venue type is required' 
      });
    }
    
    const result = await meetingService.findBestMeetingPoint(locations, venueType);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating meeting point:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate meeting point', 
      details: error.message 
    });
  }
};