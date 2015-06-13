var Speedometer = function() {
  this.wiggleMax = 4;
  this.startDate = new Date();
  this.score = 0; // Kappas
  this.maxScore = 100; // tweak pls

  this.start = -225;
  this.maxPosition = 270;

  this.createImages();
  this.canvas = document.getElementById('speedometer');
  this.ctx = this.canvas.getContext('2d');
  window.requestAnimationFrame(this.draw.bind(this));
};

Speedometer.prototype.createImages = function() {
  this.background = new Image();
  this.background.src = '/images/speedometer.png';
};

Speedometer.prototype.kpm = function() {
    return Math.round(this.score / ((new Date() - this.startDate) / (1000 * 60)));
};

Speedometer.prototype.position = function() {
  var percentage = Math.min(this.kpm() / this.maxScore, 1);

  var pos = this.maxPosition * percentage + this.start;
  return pos + this.wiggle();
};

Speedometer.prototype.wiggle = function() {
  return Math.random() * this.wiggleMax - this.wiggleMax;
};

Speedometer.prototype.draw = function() {
  // Background
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.drawImage(this.background,0,0,400,400);

  // Needle
  this.ctx.save();
  this.ctx.translate(200,200);
  this.ctx.rotate(((2*Math.PI)/360) * (this.position()));
  this.ctx.translate(0,0);
  this.ctx.fillRect(0,-5,160,10);
  this.ctx.restore();

  // KPM
  this.ctx.font = "35px serif";
  this.ctx.fillText(this.kpm() + " KPM", 140, 340);

  window.requestAnimationFrame(this.draw.bind(this));
};
