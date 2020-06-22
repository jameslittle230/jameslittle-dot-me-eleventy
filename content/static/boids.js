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
let boidsVelocity = 400;
const colors = [
  "#ffa297",
  "#fba900",
  "#9dca00",
  "#00d5a1",
  "#42cbff",
  "#c3b1ff",
];

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
      special: false,
    });
  }

  boids[0].special = true;

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
  gl.clearColor(0.13, 0.21, 0.18, 1.0); // Background color, magic number!
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
        if (b.special) {
          return [1, 1, 1, 1];
        }
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
    if (
      document.getElementById("activeCheckbox") &&
      !document.getElementById("activeCheckbox").checked
    ) {
      animateScene();
      return;
    }
    const velocity = ((currentTime - previousTime) / 1000.0) * boidsVelocity;
    previousTime = currentTime;
    boids.forEach((boid) => {
      // boid.color = "#888888";
      moveBoid(boid, velocity);

      let separationData = [];
      let alignmentData = [];
      let cohesionData = [];

      boids.forEach((other) => {
        if (boidSeesBoid(boid, other)) {
          separationData.push(getSeparationData(boid, other));
          alignmentData.push(getAlignmentData(boid, other));
          cohesionData.push(getCohesionData(boid, other));
        }
      });

      let separationVector = calculateSeparationVector(boid, separationData);
      let alignmentVector = calculateAlignmentVector(boid, alignmentData);
      let cohesionVector = calculateCohesionVector(boid, cohesionData);

      if (boid.special && separationData.length > 0) {
        // console.log("SEPARATION", separationData, separationVector);
        // console.log("ALIGNMENT", alignmentData, alignmentVector);
        // console.log("COHESION", cohesionData, cohesionVector);
      }

      let steerVector = calculateSteerVector(
        boid,
        separationVector,
        alignmentVector,
        cohesionVector
      );

      if (boid.special) {
        // console.log("STEER", steerVector);
      }

      boid = steerBoid(boid, steerVector);
    });

    animateScene();
  });
}

function moveBoid(boid, velocity) {
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
}

function boidSeesBoid(boid, other) {
  viewport = (Math.PI / 3) * 2;

  if (boid.xPos == other.xPos && boid.yPos == other.yPos) {
    // other.color = "#888888";
    return false;
  }

  const dist = Math.sqrt(
    Math.pow(boid.xPos - other.xPos, 2) + Math.pow(boid.yPos - other.yPos, 2)
  );

  if (dist > 150) {
    if (boid.special) other.color = "#888888";
    return false;
  }

  const output = true;

  if (boid.special && output) {
    other.color = "#FAFA0A";
  }

  if (boid.special && !output) {
    other.color = "#888888";
  }

  return output;
}

function getSeparationData(boid, other) {
  let theta = Math.atan2(other.yPos - boid.yPos, other.xPos - boid.xPos);
  let distance = Math.sqrt(
    Math.pow(boid.xPos - other.xPos, 2) + Math.pow(boid.yPos - other.yPos, 2)
  );
  return {
    theta: theta,
    distance: distance,
  };
}

function getAlignmentData(boid, other) {
  return other.theta;
}

function getCohesionData(boid, other) {
  return {
    xPos: other.xPos,
    yPos: other.yPos,
  };
}

function calculateSeparationVector(boid, data) {
  if (data.length == 0) {
    return boid.theta;
  }

  const points = data.map(({ theta, distance }) => {
    const thetaPlusPi = addPiToTheta(theta);
    const x = Math.cos(thetaPlusPi) * distance;
    const y = Math.sin(thetaPlusPi) * distance;
    return {
      xPos: x,
      yPos: y,
    };
  });

  const averageX = points.map((p) => p.xPos).reduce((a, b) => a + b);
  const averageY = points.map((p) => p.yPos).reduce((a, b) => a + b);

  const theta = Math.atan2(averageY, averageX);
  return theta;
}

function calculateAlignmentVector(boid, data) {
  if (data.length == 0) {
    return boid.theta;
  }

  // take all thetas and turn into points
  const points = data.map((t) => {
    const xPos = Math.cos(t);
    const yPos = Math.sin(t);
    return {
      xPos: xPos,
      yPos: yPos,
    };
  });
  // average components of all points
  const averageX = points.map((p) => p.xPos).reduce((a, b) => a + b);
  const averageY = points.map((p) => p.yPos).reduce((a, b) => a + b);

  // get new theta from point
  const theta = Math.atan2(averageY, averageX);

  return theta;
}

function calculateCohesionVector(boid, data) {
  if (data.length == 0) {
    return boid.theta;
  }

  const averageX =
    data.map((d) => d.xPos).reduce((a, b) => a + b) / data.length;
  const averageY =
    data.map((d) => d.yPos).reduce((a, b) => a + b) / data.length;

  const theta = Math.atan2(averageY - boid.yPos, averageX - boid.xPos);
  return theta;
}

function calculateSteerVector(boid, separationVec, alignmentVec, cohesionVec) {
  const points = [
    separationVec,
    separationVec,
    separationVec,
    separationVec,
    separationVec,
    alignmentVec,
    alignmentVec,
    alignmentVec,
    alignmentVec,
    cohesionVec,
    cohesionVec,
    cohesionVec,
    cohesionVec,
  ].map((t) => {
    const xPos = Math.cos(t);
    const yPos = Math.sin(t);
    return {
      xPos: xPos,
      yPos: yPos,
    };
  });
  // average components of all points
  const averageX = points.map((p) => p.xPos).reduce((a, b) => a + b);
  const averageY = points.map((p) => p.yPos).reduce((a, b) => a + b);

  // get new theta from point
  const theta = Math.atan2(averageY, averageX);

  return theta;
}

function steerBoid(boid, steerVec) {
  const points = [steerVec, boid.theta, boid.theta, boid.theta].map((t) => {
    const xPos = Math.cos(t);
    const yPos = Math.sin(t);
    return {
      xPos: xPos,
      yPos: yPos,
    };
  });
  // average components of all points
  const averageX = points.map((p) => p.xPos).reduce((a, b) => a + b);
  const averageY = points.map((p) => p.yPos).reduce((a, b) => a + b);

  // get new theta from point
  const theta = Math.atan2(averageY, averageX);

  boid.theta = theta;
  return boid;
}

function addPiToTheta(theta) {
  const piPlusTheta = Math.PI + theta;
  if (piPlusTheta > 2 * Math.PI) {
    return piPlusTheta - 2 * Math.PI;
  }

  if (piPlusTheta < 0) {
    return piPlusTheta + 2 * Math.PI;
  }

  return piPlusTheta;
}
