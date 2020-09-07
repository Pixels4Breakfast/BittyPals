
function Snowball(ob) {
  this.isPlayer = ob.isPlayer || true;  //default assumption that snowball is coming from player
  this.origin = ob.origin || {x:571, y:300, z:900}; //default to player snowball if no origin is given
  this.target = ob.target || {x:560, y:280, z:900};  //default is enemies throwing at player
  this.accuracy = ob.accuracy || 100;  //player always has an accuracy of 100
  this.type = ob.type || 'default';
  this.speed = ob.speed || 10;  //dink with this

  this.tickCount = 0;

  this._x = this.origin.x;
  this._y = this.origin.y;
  this._z = this.origin.z;
  this._s = 1;
  this._apex = undefined;

  this.img = undefined;
  this.innerImg = undefined;
  this.frames = [];
  this.cFrame = 0;

}

Snowball.prototype = {
  get x()   { return this._x; },
  set x(v)  {
    this._x = v;
    this.img.css("left", v + "px");
  },
  get y()   { return this._y; },
  set y(v)  {
    this._y = v;
    this.img.css("top", v + "px");
  },
  get z()   { return this._z },
  set z(v)  {
    this._z = v;
    this.img.css("z-index", v);
  },

  set scale(v)   {
    var scale = Number(v); //Math.round( v /10 * 10 ) / 10;  //computers are incredibly stupid at times...and they need a little help
    this.innerImg.css({
      '-webkit-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', // Chrome 4+, Op 15+, Saf 3.1, iOS Saf 3.2+
      '-moz-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', //FX 3.5-15
      '-ms-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', //IE 9
      '-o-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', //Op 10.5-12
      'transform': 'scaleY(' + scale + ') scaleX(' + scale + ')' //Fx 16+, IE10+
    });
  }
}


Snowball.prototype.init = function() {
  console.log("Initializing Snowball instance", this);
  this.img = $("<div/>", {class:'snowball'});
  this.innerImg = $("<img/>", {class:'sbImg', src:'assets/arcade/snowballhero/snowball.png'});
  this.img.append(this.innerImg);
  this.x = this.origin.x;
  this.y = this.origin.y;
  $("#gameScreen").append(this.img);

  //calculate drift
  if (this.accuracy < 100) {
    var drift = Math.round((100 - this.accuracy) * Math.random());
    this.target.x = (Math.random() > .5) ? this.target.x + drift : this.target.x - drift;
    this.target.y = (Math.random() > .5) ? this.target.y + drift : this.target.y - drift;
    //TODO:calculate z-drift, which will affect the apex of the snowball's arc
  }

  //TODO: build/calculate arc...somehow

  if (this.isPlayer) {
    this.target.z = Math.ceil(990 * (this.target.y / 430));  //this is a best-guess scenario
  } else {
    //do...something?
  }

  //not doing real physics here because it's too heavy on the processor for some people's devices...lots of fake-work
  var distanceY = Math.ceil(Math.abs(990 - this.target.z) / 10);
  var distanceX = Math.ceil(Math.abs((this.target.x - 552) / 10));
  var fcount = Math.ceil((distanceY + distanceX) / 4);
  // var realDistance = Math.sqrt((this.target.x - this.origin.x)^2 + (this.origin.y - this.target.y)^2); //this doesn't work for quandrants 1 and 3
  // console.log("DX: " + distanceX + ", DY: " + distanceY + ", frames: " + fcount + ", Real Distance: " + realDistance);

  var xStep = Math.abs(this.origin.x - this.target.x) / fcount;
  var yStep = Math.abs(this.origin.y - this.target.y) / fcount;
  var zStep = (this.isPlayer) ? Math.ceil((990 - this.target.z) / fcount) : Math.ceil((990 - this.origin.z) / fcount);
  var sStep = .6 / fcount;
  //TODO: put in the z-axis stuph


  var cY = this.origin.y;
  var cX = this.origin.x;
  var cS = (this.isPlayer) ? 1 : .4;
  var cZ = (this.isPlayer) ? 990 : this.origin.z;
  this.scale = cS;



  this.frames.push({x:cX, y:cY, s:cS, z:cZ});

  for (var i = 1; i < fcount; i++) {
    cX = (this.target.x > this.origin.x) ? cX + xStep : cX - xStep;
    cY = (this.target.y > this.origin.y) ? cY + yStep : cY - yStep;
    cS = (this.isPlayer) ? cS - sStep : cS + sStep;
    cZ = (this.isPlayer) ? cZ - zStep : cZ + zStep;
    this.frames.push({x:cX, y:cY, s:cS, z:cZ});
  }



  return true;
}

Snowball.prototype.fire = function() {
  console.log("FIRING!!");
  ticklist.subscribe(this);
}

Snowball.prototype.checkCollision = function() {
  //z-levels within 30 will be considered to be on the same level?  We'll have to see how this works out...or if I'm even going to use them.
  var isHit = false;
  var hitObstacle = false;

  for (var i=0; i<obstacles.length; i++) {
    var o = obstacles[i].el;
    var pixelData = o.getContext("2d").getImageData(this.target.x, this.target.y, 1, 1).data;
    if (pixelData[3] > 0) hitObstacle = true;
    // console.log('R: ' + pixelData[0] + ' G: ' + pixelData[1] + ' B: ' + pixelData[2] + ' A: ' + pixelData[3]);
  }

  if (hitObstacle) {
    //TODO: snowball splodey animation
    console.log("HIT OBSTACLE");

    this.remove();
  } else if (isHit) {
    this.hit();
  } else {
    console.log("NO OBSTACLES HIT");
    this.remove();
  }
}

Snowball.prototype.hit = function() {
  console.log("HIT!");
}

Snowball.prototype.remove = function() {
  ticklist.unsubscribe(this);
  this.img.remove();
  killme(this);
  return true;
}


Snowball.prototype.tick = function() {
  this.tickCount++;
  if (this.tickCount > TICKTOCK) {
    this.tickCount = 0;
    //do something
    // console.log("tick");
    this.cFrame++;
    if (this.cFrame < this.frames.length) {
      var f = this.frames[this.cFrame];
      this.x = f.x;
      this.y = f.y;
      // this.z = f.z;  //we're ignoring this right now because I may have been overthinking this...shocking, right?
      this.scale = f.s;
    } else {
      this.checkCollision();
      // this.remove();
    }
  }
}



console.log("Snowball module loaded");
