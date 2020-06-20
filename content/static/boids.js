let gl = null;
let glCanvas = null;
let shaderProgram = null;

// Aspect ratio and coordinate system details
let aspectRatio;
let currentRotation = [0, 1];
let currentScale = [1.0, 1.0];

// Vertex information
let vertexArray;
let vertexBuffer;
let vertexNumComponents;
let vertexCount;

// Rendering data shared with the scalers.
let uScalingFactor;
let uGlobalColor;
let uRotationVector;
let aVertexPosition;

// Program Options
let boids = [];
let boidsCount = 200;
let boidsVelocity = 100;
const colors = ["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min, max, floor = true) {
  let val = Math.random() * (max - min) + min;
  if (floor) {
    return Math.floor(val);
  }
  return val;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255.0,
        g: parseInt(result[2], 16) / 255.0,
        b: parseInt(result[3], 16) / 255.0,
      }
    : null;
}

// Animation timing
let previousTime = 0.0;

// Begin
window.addEventListener("load", startup);

function startup() {
  glCanvas = document.getElementById("boids");
  glCanvas.width = glCanvas.clientWidth;
  glCanvas.height = glCanvas.clientHeight;
  gl = glCanvas.getContext("webgl");

  for (let i = 0; i < boidsCount; i++) {
    boids.push({
      color: randomElement(colors),
      xPos: randomBetween(-glCanvas.width, glCanvas.width),
      yPos: randomBetween(-glCanvas.height, glCanvas.height),
      theta: randomBetween(0, 2 * Math.PI, false),
    });
  }

  const shaderSet = [
    {
      type: gl.VERTEX_SHADER,
      id: "vertex-shader",
    },
    {
      type: gl.FRAGMENT_SHADER,
      id: "fragment-shader",
    },
  ];

  shaderProgram = buildShaderProgram(shaderSet);

  aspectRatio = glCanvas.width / glCanvas.height;
  currentRotation = [0, 1];
  currentScale = [1.0, aspectRatio];
  animateScene();
}
function buildShaderProgram(shaderInfo) {
  let program = gl.createProgram();

  shaderInfo.forEach(function (desc) {
    let shader = compileShader(desc.id, desc.type);

    if (shader) {
      gl.attachShader(program, shader);
    }
  });

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Error linking shader program:");
    console.log(gl.getProgramInfoLog(program));
  }

  return program;
}
function compileShader(id, type) {
  let code = document.getElementById(id).firstChild.nodeValue;
  let shader = gl.createShader(type);

  gl.shaderSource(shader, code);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(
      `Error compiling ${
        type === gl.VERTEX_SHADER ? "vertex" : "fragment"
      } shader:`
    );
    console.log(gl.getShaderInfoLog(shader));
  }
  return shader;
}
function animateScene() {
  gl.clearColor(0.1, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Load vertices

  const vertexArray = new Float32Array(
    boids
      .map((b) => [b.xPos / glCanvas.width, b.yPos / glCanvas.height])
      .reduce((acc, val) => acc.concat(val), [])
  );

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

  vertexNumComponents = 2;
  vertexCount = vertexArray.length / vertexNumComponents;

  // Load colors

  const colorArray = new Float32Array(
    boids
      .map((b) => {
        let colorObj = hexToRgb(b.color);
        return [colorObj.r, colorObj.g, colorObj.b, 1.0];
      })
      .reduce((acc, val) => acc.concat(val), [])
  );

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);

  gl.useProgram(shaderProgram);

  gl.uniform2fv(uScalingFactor, currentScale);
  gl.uniform2fv(uRotationVector, currentRotation);
  gl.uniform4fv(uGlobalColor, [0.4, 0.45, 0.4, 1.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  const aVertexPosition = gl.getAttribLocation(
    shaderProgram,
    "aVertexPosition"
  );
  gl.enableVertexAttribArray(aVertexPosition);
  gl.vertexAttribPointer(
    aVertexPosition,
    vertexNumComponents,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const aVertexColor = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(aVertexColor);
  gl.vertexAttribPointer(
    aVertexColor,
    4, // components per thing
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.drawArrays(gl.POINTS, 0, vertexCount);

  window.requestAnimationFrame(function (currentTime) {
    const velocity = ((currentTime - previousTime) / 1000.0) * boidsVelocity;
    previousTime = currentTime;
    boids.forEach((boid) => {
      boid.xPos += velocity * Math.cos(boid.theta);

      if (boid.xPos > glCanvas.width) {
        boid.xPos -= 2 * glCanvas.width;
      }

      if (boid.xPos < -glCanvas.width) {
        boid.xPos += 2 * glCanvas.width;
      }

      boid.yPos += velocity * Math.sin(boid.theta);

      if (boid.yPos > glCanvas.height) {
        boid.yPos -= 2 * glCanvas.height;
      }

      if (boid.yPos < -glCanvas.height) {
        boid.yPos += 2 * glCanvas.height;
      }
    });

    animateScene();
  });
}
