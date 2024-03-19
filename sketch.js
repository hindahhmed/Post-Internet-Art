// Global variables for the ripple array, drag state, and previous mouse positions.
let ripples = [];
let isDragging = false;
let prevMouseX, prevMouseY;
let rippleSize = 10;
let rippleSpeedFactor = 0.5;
let currentColorMode = 'dynamic'; // Toggles between 'dynamic' and 'static' color modes.

function setup() {
  // Sets up the canvas and color mode.
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  
   // Creates a slider for adjusting the ripple size.
  let sizeSlider = createSlider(1, 20, 10);
  sizeSlider.position(20, 35);
  // Updates the ripple size based on the slider's value.
  sizeSlider.input(() => rippleSize = sizeSlider.value());

   // Creates a slider for adjusting the ripple speed.
  let speedSlider = createSlider(0, 2, 0.5, 0.1);
  speedSlider.position(20, 75);
   // Updates the ripple speed factor based on the slider's value.
  speedSlider.input(() => rippleSpeedFactor = speedSlider.value());

  // Creates a button for toggling the colors of the ripples.
  let colorButton = createButton('Color Mode');
  colorButton.position(20, 120);
  // Changes the color mode when the button is pressed.
  colorButton.mousePressed(() => currentColorMode = currentColorMode === 'dynamic' ? 'static' : 'dynamic');

  // Sets the background color of the canvas.
  background(0);
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function draw() {
  // Redraws the background with a slight transparency for a trail effect.
  background(0, 25);

  // Displays text labels for the user interface elements.
  fill(255);
  noStroke();
  textSize(16);
  text('Ripple Size:', 20, 30);
  text('Ripple Speed:', 20, 70);
  text('Color Mode:', 20, 110);

  // Updates and displays each ripple, removing any that are 'done'.
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();
    if (ripples[i].isDone()) {
      ripples.splice(i, 1);
    }
  }

  // Creates new ripples if the mouse is dragged and not over user interface elements.
  if (isDragging && !isMouseOverUI()) {
    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY;
    let newRipple = new Ripple(mouseX, mouseY, dx * rippleSpeedFactor, dy * rippleSpeedFactor, rippleSize);
    ripples.push(newRipple);
    newRipple.playSound(); // Plays a sound for the new ripple.
  }

  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function mousePressed() {
  // Starts dragging and potentially creating ripples unless over user interface elements.
  isDragging = !isMouseOverUI();
}

function mouseReleased() {
  // Stops dragging when the mouse is released.
  isDragging = false;
}

// Checks if the mouse is over any user interface elements to prevent ripples creation when interacting with the user interface.
function isMouseOverUI() {
  // Assumes user interface elements and labels occupy the top 140 pixels.
  return mouseY <= 140;
}

// Defines the Ripple class with properties and methods for each ripple.
class Ripple {
  constructor(x, y, dx = 0, dy = 0, size = 10) {
    this.x = x;
    this.y = y;
    this.radius = size;
    this.dx = dx;
    this.dy = dy;
    // Determines the color based on the position and color mode.
    this.color = this.getColor(x, y);
    this.lifespan = 255; // Lifespan for fade-out effect.
    // Creates an oscillator for sound production.
    this.oscillator = new p5.Oscillator('sine');
  }

  // Calculates the color of the ripple based on its position and the current color mode.
  getColor(x, y) {
    if (currentColorMode === 'dynamic') {
      return color(abs(x - width / 2) % 255, abs(y - height / 2) % 255, 255);
    }
    return color(128, 204, 255);
  }

  // Updates the ripple's size and lifespan.
  update() {
    this.radius += sqrt(this.dx * this.dx + this.dy * this.dy);
    this.lifespan -= 2;
  }

  // Displays the ripple with its current properties.
  display() {
    noFill();
    strokeWeight(2);
    stroke(this.color, this.lifespan);
    ellipse(this.x, this.y, this.radius * 2);
  }

  // Plays a sound based on the ripple's properties.
  playSound() {
    let freq = map(this.radius, 1, 20, 100, 500); // Map ripple size to frequency.
    this.oscillator.freq(freq);
    this.oscillator.start();
    this.oscillator.amp(0.5, 0.1); // Sets amplitude with a quick fade out.
    this.oscillator.stop(0.5); // Stops the sound after a short duration.
  }

  // Determines if the ripple is done (fully faded out).
  isDone() {
    return this.lifespan < 0;
  }
}