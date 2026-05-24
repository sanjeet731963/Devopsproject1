const Prediction = require('../models/prediction.model');
const fs = require('fs');

// Mock list of possible diseases for our mock AI
const mockDiseases = [
  'Healthy',
  'Apple Scab',
  'Cedar Apple Rust',
  'Corn Blight',
  'Tomato Early Blight',
  'Tomato Late Blight',
  'Potato Early Blight',
  'Grape Black Rot'
];

exports.uploadAndPredict = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imagePath = req.file.path;

    // TODO: In a real scenario, we would send this image to a Python microservice 
    // running TensorFlow, or load a TFLite model via Node.js bindings.
    // For this prototype, we simulate a model prediction delay and response.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock Prediction Logic
    const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    const randomConfidence = (Math.random() * (0.99 - 0.75) + 0.75).toFixed(2); // Between 75% and 99%

    // Save prediction to database
    const newPrediction = new Prediction({
      diseaseName: randomDisease,
      confidence: randomConfidence,
      imageUrl: imagePath,
    });

    await newPrediction.save();

    res.status(200).json({
      success: true,
      message: 'Image processed successfully',
      data: newPrediction,
    });
  } catch (error) {
    console.error('Error in prediction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Prediction.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    // Delete file from disk if it exists
    if (prediction.imageUrl) {
      const path = require('path');
      const absolutePath = path.join(__dirname, '../../', prediction.imageUrl);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    await Prediction.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Prediction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting prediction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

