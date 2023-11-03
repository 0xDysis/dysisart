// Setup
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000);
camera.position.z = 1;
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Append renderer to the specific div
var container = document.getElementById('threeCanvas');
container.appendChild(renderer.domElement);

// Particles
var particles = [];
for (var i = 0; i < 800; i++) {
  particles[i] = new Particle();
}

// Flow field
var inc = 0.1;
var scl = 20;
var cols = Math.floor(window.innerWidth / scl);
var rows = Math.floor(window.innerHeight / scl);
var zoff = 0;
var flowfield = new Array(cols * rows);

// Particle class
function Particle() {
  this.pos = new THREE.Vector2(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
  this.vel = new THREE.Vector2(0, 0);
  this.acc = new THREE.Vector2(0, 0);
  this.maxspeed = 4;
  this.prevPos = this.pos.clone();

  this.material = new THREE.PointsMaterial({ color: 0x000000, size: 1 });

  this.update = function() {
    this.vel.add(this.acc);
    this.vel.clampScalar(-this.maxspeed, this.maxspeed);
    this.pos.add(this.vel);
    this.acc.multiplyScalar(0);
  };

  this.follow = function(vectors) {
    var x = Math.floor(this.pos.x / scl);
    var y = Math.floor(this.pos.y / scl);
    var index = x + y * cols;
    var force = vectors[index];
    if (force) {
      this.applyForce(force);
    }
  };
  
  this.applyForce = function(force) {
    this.acc.add(force);
  };

  this.show = function() {
    var geometry = new THREE.BufferGeometry().setFromPoints([this.pos.clone()]);
    var point = new THREE.Points(geometry, this.material);
    scene.add(point);
    this.prevPos.copy(this.pos);
  };

  this.edges = function() {
    if (this.pos.x > window.innerWidth) {
      this.pos.x = 0;
      this.prevPos.copy(this.pos);
    }
    if (this.pos.x < 0) {
      this.pos.x = window.innerWidth;
      this.prevPos.copy(this.pos);
    }
    if (this.pos.y > window.innerHeight) {
      this.pos.y = 0;
      this.prevPos.copy(this.pos);
    }
    if (this.pos.y < 0) {
      this.pos.y = window.innerHeight;
      this.prevPos.copy(this.pos);
    }
  };
}

// Initialize flowfield
for (var i = 0; i < flowfield.length; i++) {
  flowfield[i] = new THREE.Vector2();
}

// Noise generator
var noise = new SimplexNoise();

// Animation
function animate() {
  requestAnimationFrame(animate);

  

  // Update flow field
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise.noise3D(xoff, yoff, zoff) * Math.PI * 2 * 4;
      flowfield[index].set(Math.cos(angle), Math.sin(angle));
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.00008;
  }

  // Update particles
  for (var i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }

  renderer.render(scene, camera);
}

animate();
