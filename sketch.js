// sketch.js

let frequencyInput;
let frequencyValue;
let backwardSpeedInput;
let audioContext;
let oscillator;
let penPositions;


let isPlaying = false;
let cameraCentered = false; // Track if the camera is centered
let canvasBackground = "#202123"; // Default background color (dark mode)
let drawingColor = "#F7F7F8"; // Default drawing color (dark mode)

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Use WEBGL renderer for 3D
  noFill(); // Disable filling shapes
  strokeWeight(3); // Thicker stroke

  // Set up camera controls to enable spinning
  let fov = 20; // Field of view (in degrees)
  let cameraZ = (height / 2.0) / tan(PI * fov / 360.0);
  perspective(fov, width / height, cameraZ / 10.0, cameraZ * 10.0);

  frequencyInput = select("#frequency-slider");
  frequencyValue = select("#frequency-value");
  frequencyValue.html(frequencyInput.value() + " Hz");

  backwardSpeedInput = select("#backward-slider");

  // Initialize audio context and oscillator
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequencyInput.value();
  oscillator.connect(audioContext.destination); // Connect the oscillator to the speakers
  oscillator.start(0);

  penPositions = []; // Array to store pen positions
  
  camera(0, 0, 1000, 0, 0, -backwardSpeedInput.value()*25);
}

function draw() {
  stroke(drawingColor); // Slightly transparent stroke
  background(canvasBackground); // Set the background color of the canvas

  let amplitude = map(sin(frameCount * (oscillator.frequency.value / 100)), -1, 1, 50, 200);
  let angle = frameCount * (oscillator.frequency.value / 100);
  let nextPenPosition = createVector(amplitude * cos(angle), amplitude * sin(angle), 0); // Set the drawing position to z = 0

  // Move all previous positions backward in the negative z direction based on the backward speed
  for (let i = 0; i < penPositions.length; i++) {
    penPositions[i].z -= backwardSpeedInput.value();
  }

  // Store the current pen position in the array
  penPositions.push(nextPenPosition);

  // Limit the number of positions stored to maintain smoothness
  if (penPositions.length > 50) {
    penPositions.splice(0, 1);
  }

  // Enable camera controls for spinning
  orbitControl();

  // Draw a smooth curve connecting the pen positions in 3D
  beginShape();
  for (let i = 0; i < penPositions.length; i++) {
    let { x, y, z } = penPositions[i];
    curveVertex(x, y, z);
  }
  endShape();

  // Update the frequency value displayed
  frequencyValue.html(frequencyInput.value() + " Hz");
}

function updateFrequency(value) {
  // Update the oscillator frequency based on the slider value
  oscillator.frequency.value = value;
}

function updateBackwardSpeed(value) {
  // Update the backward speed based on the slider value
  backwardSpeedInput.value(value);
}

function stopOscillator() {
  // Stop the oscillator when the user stops interacting with the slider
  oscillator.stop();
}

function centerCamera() {
    // Center the camera to x = 0 and y = 0
    orbitControl();
    camera(0, 0, 1000, 0, 0, -backwardSpeedInput.value()*25);
    cameraCentered = true; // Mark camera as centered
  }
  
  function viewLeft() {
    // Set the camera to view 90 degrees to the left
    orbitControl();
    camera(-1000, 0, -backwardSpeedInput.value()*25, 0, 0, -backwardSpeedInput.value()*25);
    cameraCentered = false; // Mark camera as not centered
  }

  function mousePressed() {
    // If the camera was centered, re-enable orbit control
    if (cameraCentered) {
      orbitControl();
      cameraCentered = false;
    }
  }


  function startAudio() {
    // Start the AudioContext after a user gesture (e.g., button click)
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('AudioContext is now resumed!');
      });
    } else {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequencyInput.value();
      oscillator.connect(audioContext.destination); // Connect the oscillator to the speakers
      oscillator.start(0);
    }
    isPlaying = true;
    document.getElementById("play-button").classList.add("playing");
  }
  
  function stopAudio() {
    console.log('hsdgfjfs')
    if (oscillator) {
      oscillator.stop();
    }
    isPlaying = false;
    document.getElementById("play-button").classList.remove("playing");
  }
  
  function toggleAudio() {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  }
  
  function updateFrequency(value) {
    // Update the oscillator frequency based on the slider value
    if (oscillator) {
      oscillator.frequency.value = value;
    }
  }


  function toggleDarkMode() {
    const body = document.body;
    // Toggle dark and light mode classes for body and canvas
    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode");
    // Update the canvas background color dynamically
    if (body.classList.contains("dark-mode")) {
      canvasBackground = "#202123";
      drawingColor = "#F7F7F8"
    } else {
      canvasBackground = "#F7F7F8";
      drawingColor = "#202123"
    }
  }