import * as faceapi from 'face-api.js';

// Base path to the models directory in public
const BASE_MODEL_URL = '/models';

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) {
    console.log('Models already loaded.');
    return;
  }
  
  // Client-side check to prevent SSR issues
  if (typeof window === 'undefined') {
    console.warn('Attempting to load face models on server - skipping');
    return;
  }

  try {
    console.log('Loading face-api models from new paths...');
    await Promise.all([
      // tinyFaceDetector is in the 'tiny_face_detector' subdirectory
      faceapi.nets.tinyFaceDetector.loadFromUri(`${BASE_MODEL_URL}/tiny_face_detector`),
      // faceLandmark68Net is in the 'face_landmark_68' subdirectory
      faceapi.nets.faceLandmark68Net.loadFromUri(`${BASE_MODEL_URL}/face_landmark_68`),
      // faceExpressionNet is in the 'face_expression' subdirectory
      faceapi.nets.faceExpressionNet.loadFromUri(`${BASE_MODEL_URL}/face_expression`),
      // ageGenderNet is in the 'faceapi' subdirectory (which contains age_gender_model files)
      faceapi.nets.ageGenderNet.loadFromUri(`${BASE_MODEL_URL}/faceapi`) 
    ]);
    
    modelsLoaded = true;
    console.log('Face-api models loaded successfully.');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw new Error(`Failed to load face detection models: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Optional: Add a function to check if models are loaded
export function areModelsLoaded() {
  return modelsLoaded;
}

// Optional: Function to get detection options if you plan to use TinyFaceDetector
export const getTinyFaceDetectorOptions = () => {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize: 320, // Reduced from 512 for better performance
    scoreThreshold: 0.5
  });
}

// You can add more functions here later for detection, etc.
// For example:
/*
export async function detectFacesWithDetails(imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
  if (!modelsLoaded) {
    await loadModels();
  }

  const detections = await faceapi
    .detectAllFaces(imageElement, getTinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();
  
  return detections;
}
*/

// Ensure TensorFlow.js backend is set (usually handled by face-api.js, but good to be aware)
// import * as tf from '@tensorflow/tfjs';
// tf.setBackend('webgl'); // or 'cpu', 'wasm' etc.
// console.log(\`Using TensorFlow.js backend: \${tf.getBackend()}\`); 