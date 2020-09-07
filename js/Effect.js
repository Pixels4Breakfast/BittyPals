

function HabEffect(ob) {
  // console.log("hfx:", ob);
  var o = {
    //initialization variables
    _src:ob.src,

    _sprite:(ob.sprite == 1) ? true : false,
    _frameCount:Number(ob.frame_count),
    _frameHeight:Number(ob.frame_height),
    _frameWidth:Number(ob.frame_width),
    _animated:Number(ob.animated),  //this will also determine if it's random

    _bgFX:Number(ob.background_effect) == 1 ? true : false,

    _target:ob.target,
    _dir:ob.dir || 'down',
    _tps:Number(ob.tps) || 1000,
    _speed:Number(ob.speed) || 1,
    _maxX:Number(ob.max_x) || 1126,
    _maxY:Number(ob.max_y) || 430,
    _minX:Number(ob.min_x) || 0,
    _minY:Number(ob.min_y) || 0,
    _maxCount:Number(ob.max_count) || 20,
    _stagger:Number(ob.stagger) || 0,
    _rock:Number(ob.rock) || 0,
    _randomStart:Number(ob.random_start) || 0,

    //new params 09-01
    _parallax:Number(ob.parallax) || 0,
    _parallaxDepth:Number(ob.parallax_depth) || 0,
    _parallaxShift:Number(ob.parallax_shift) || 0,
    _originX:Number(ob.origin_x) || 0,
    _originY:Number(ob.origin_y) || 0,

    //start internal variables
    _initialized:false,
    _instances:[],
    _interval:undefined,
    _ticking:false,
    _tCount:0,
    _iCount:0,

    //getters
    get initialized()   { return this._initialized; },
    get instances()     { return this._instances; },
    get src()           { return this._src; },
    get dir()           { return this._dir; },
    get direction()     { return this._dir; },
    get tps()           { return this._tps; },
    get speed()         { return this._speed; },
    get maxX()          { return this._maxX; },
    get maxY()          { return this._maxY; },
    get minX()          { return this._minX; },
    get minY()          { return this._minY; },
    get maxCount()      { return this._maxCount; },
    get stagger()       { return this._stagger; },
    get rock()          { return this._rock; },
    get randomStart()   { return this._randomStart; },
    get sprite()        { return this._sprite; },
    get frameCount()    { return this._frameCount; },
    get frameHeight()   { return this._frameHeight; },
    get frameWidth()    { return this._frameWidth; },
    get animated()      { return this._animated; },
    get bgFX()          { return this._bgFX; },
    get tCount()        { return this._tCount; },
    get iCount()        { return this._iCount; },
    get parallax()      { return (this._parallax == 0) ? false : true; },
    get parallaxDepth() { return this._parallaxDepth; },
    get parallaxShift() { return this._parallaxShift; },
    get originX()       { return this._originX; },
    get originY()       { return this._originY; },

    //setters
    set target(v)        { this._target = v; },
    set initialized(v)   { this._initialized = v; },
    set instances(v)     { this._instances = v; },
    set tps(v)           { this._tps = v; },
    set speed(v)         { this._speed = v; },
    set maxCount(v)      { this._maxCount = v; },
    set stagger(v)       { this._stagger = v; },
    set tCount(v)        { this._tCount = v; },
    set iCount(v)        { this._iCount = v; },

    addInstance: function(inst) { this.instances.push(inst); },

    init:function() {
      if (this.initialized) return true;
      if (this.bgFX && this._target == 'fxLayer') {
        console.log("backgroundEffect found...moving");
        if ($("fxLayer_back").attr("id") == undefined) {
          var fxb = $("<div/>", {id:"fxLayer_back", style:"position:absolute; width:1126px; height:430px; overflow:hidden; pointer-events:none;"});
          fxb.insertAfter($("#habBackground"));
        }
        this._target = "fxLayer_back";
      }
      this.instances = [];
      var foo = new Image();
      var me = this;
      foo.onload = function() {
        me.initialized = true;
        switch(me.direction) {
          case 'down':
          case 'up':
            me._minY = 0 - this.height;
          break;
          case 'left':
          case 'right':
            me._minX = (me.sprite == 1) ? 0 - me.frameWidth : 0 - this.width;
          break;
        }
        me.play();
      };
      foo.src = this.src;
    },

    //control functions
    play:function() {
      // console.log("attempting to start");
      if (this.initialized) {
        ticklist.subscribe(this);
        if (!ticking) startTick();
      } else {
        this.init();
      }
    },
    stop:function() {
      console.log("stopping");
      ticklist.unsubscribe(this);
      this.destroy();
    },
    tick: function() {
      if (this.tCount < 1000/this.tps) {
        this.tCount = this.tCount*1 + 1;
        return;
      } else { this.tCount = 0; }
      //to create, or not to create...
      if (this.instances == undefined) {
        console.error("can't find instances", this);
        this.stop();
        return;
      }
      if (this.instances.length < this.maxCount) {
        this.iCount = this.iCount*1 + 1;
        var dist = (this.dir == 'up' || this.dir == 'down') ? this.maxY - this.minY : this.maxX - this.minX;
        var spread = dist / this.speed / this.maxCount;

        if (this.iCount >= spread) {
          this.iCount = 0;
          switch(this.dir) {
            case 'down':
              var iob = {src:this.src,
                         target:this._target,
                         x:Math.random() * this.maxX,
                         y:this.maxY,
                         minY:this.minY,
                         minX:this.minX,
                         maxY:this.maxY,
                         maxX:this.maxX,
                         stagger:this.stagger,
                         speed:this.speed,
                         dir:this.dir,
                         rock:this.rock,
                         sprite:this.sprite,
                         frameCount:this.frameCount,
                         frameHeight:this.frameHeight,
                         frameWidth:this.frameWidth,
                         animated:this.animated
                       };

            break;
            case 'up':
              var iob = {src:this.src,
                         target:this._target,
                         x:Math.random() * this.maxX,
                         y:this.maxY,
                         minY:this.minY,
                         minX:this.minX,
                         maxY:this.maxY,
                         maxX:this.maxX,
                         stagger:this.stagger,
                         speed:this.speed,
                         dir:this.dir,
                         rock:this.rock,
                         sprite:this.sprite,
                         frameCount:this.frameCount,
                         frameHeight:this.frameHeight,
                         frameWidth:this.frameWidth,
                         animated:this.animated
                       };
            break;
            case 'left':
              var iob = {src:this.src, target:this._target, x:this.maxX, y:Math.random() * this.maxY, stagger:this.stagger, speed:this.speed, dir:this.dir, rock:this.rock};
            break;
            case 'right':
              var startX = (this.randomStart == 1 && this.instances.length == 0) ? Math.floor(Math.random() * this.maxX) : this.minX;
              var iob = {src:this.src,
                         target:this._target,
                         x:startX,
                         y:Math.random() * this.maxY,
                         minY:this.minY,
                         minX:this.minX,
                         maxY:this.maxY,
                         maxX:this.maxX,
                         stagger:this.stagger,
                         speed:this.speed,
                         dir:this.dir,
                         rock:this.rock,
                         randomStart:this.randomStart,
                         sprite:this.sprite,
                         frameCount:this.frameCount,
                         frameHeight:this.frameHeight,
                         frameWidth:this.frameWidth,
                         animated:this.animated
                       };
            break;
            case 'forward':
              var iob = {src:this.src,
                       target:this._target,
                       x:this.originX,
                       y:this.originY,
                       minY:this.minY,
                       minX:this.minX,
                       maxY:this.maxY,
                       maxX:this.maxX,
                       stagger:this.stagger,
                       speed:this.speed,
                       dir:this.dir,
                       rock:this.rock,
                       randomStart:this.randomStart,
                       sprite:this.sprite,
                       frameCount:this.frameCount,
                       frameHeight:this.frameHeight,
                       frameWidth:this.frameWidth,
                       animated:this.animated,

                       parallax:this.parallax,
                       parallaxDepth:this.parallaxDepth,
                       parallaxShift:this.parallaxShift,
                       originX:this.originX,
                       originY:this.originY,
                       scale:0,  //needs to be basically invisible to start
                       angle:Math.floor(Math.random() * 360) * (Math.PI/180)  //converted to radians for JS friendliness
                     };
            break;
            default:
              console.error("direction not defined on fx");
            break;

          }
          var fxi = new HabEffectInstance(iob);
          this.addInstance(fxi);

        }
      }

      //motion
      for (var i = 0; i < this.instances.length; i++) this.instances[i].tick();
    },


    destroy:function() {
      for (var i=this.instances.length-1; this.instances.length > 0; i--) {
        this.instances[i].destroy();
        delete this.instances[i];
        this.instances.pop();
      }
    }


  } //eoo
  return o;
}



function HabEffectInstance(ob) {
  var o = {
    _src:ob.src,  //required
    _target:ob.target, //required

    _sprite:ob.sprite,
    _frameCount:ob.frameCount,
    _frameHeight:ob.frameHeight,
    _frameWidth:ob.frameWidth,
    _animated:ob.animated,  //this will also determine if it's random

    _x:ob.x,
    _y:ob.y,
    _centerX:ob.x,  //for stagger
    _centerY:ob.y,  //for stagger
    _maxX:ob.maxX || 1126,
    _maxY:ob.maxY || 430,
    _minX:ob.minX || 0,
    _minY:ob.minY || 0,

    _parallax:ob.parallax || false,
    _parallaxDepth:ob.parallaxDepth || 0,
    _parallaxShift:ob.parallaxShift || 0,
    _originX:ob.originX || 0,
    _originY:ob.originY || 0,
    _delta:0,  //this might go away
    _maxScale:1,
    _scale:ob.scale || 1,
    _angle:ob.angle || 0,  //this might go away

    _tScale:ob.scale || 1,  //temporary scale figure

    _dir:ob.dir || "down",
    _speed:ob.speed || 1,
    _stagger:ob.stagger || 0,
    _rock:ob.rock || 0,
    _randomStart:ob.randomStart || 0,
    _currentRock:0,
    _lean:(Math.floor(Math.random() * 10) > 5) ? 1 : -1,
    _img:undefined,
    _id:String(ob.x).split('.').join(''),

    _initialized:false,

    get x()   { return this._x; },
    set x(v)  { this._x = v; this._img.css('left', v + 'px'); },
    get y()   { return this._y; },
    set y(v)  { this._y = v; this._img.css('top', v + 'px'); },

    get lean()        { return this._lean; },
    set lean(v)       { this._lean = v; },

    get rock()        { return this._rock; },
    set rock(v)       { this._rock = v; },
    get crock()       { return this._currentRock; },
    set crock(v)      { this._currentRock = v; },

    get randomStart() { return this.randomStart; },

    get sprite()        { return this._sprite; },
    get frameCount()    { return this._frameCount; },
    get frameHeight()   { return this._frameHeight; },
    get frameWidth()    { return this._frameWidth; },
    get animated()      { return this._animated; },

    get originX()       { return this._originX; },
    get originY()       { return this._originY; },
    get delta()         { return this._delta; },
    set delta(v)        { this._delta = v},
    get angle()         { return this._angle; },
    set angle(v)        { this._angle = v; },
    get speed()         { return this._speed; },
    set speed(v)        { this._speed = v; },
    get maxScale()      { return this._maxScale; },
    set maxScale(v)     { this._maxScale = v; },
    get scale()         { return this._scale; },
    set scale(v)   {
      var scale = Number(v); //computers are incredibly stupid at times...and they need a little help
      // console.log("setting scale: " + v);
      this._scale = scale;
      this._tScale = scale;
      this._img.css({
        '-webkit-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', // Chrome 4+, Op 15+, Saf 3.1, iOS Saf 3.2+
        '-moz-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', //FX 3.5-15
        '-ms-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', //IE 9
        '-o-transform': 'scaleY(' + scale + ') scaleX(' + scale + ')', //Op 10.5-12
        'transform': 'scaleY(' + scale + ') scaleX(' + scale + ')' //Fx 16+, IE10+
      });
    },


    init:function() {
      var image = $("<img/>",{id:"fxi_" + this._id, style:"position:absolute;pointer-events:none;"});
      if (!this.sprite) {
        image.attr('src', this._src);
      } else {
        //create the sprite based on ob
        if (!this.animated) {
          image.attr('src', 'assets/site/transparentPixel.png');
          image.css('height', this.frameHeight + "px");
          image.css('width', this.frameWidth + "px");
          // get random frame
          var rand = Math.floor(Math.random() * this.frameCount);  //random number between 0 and frameCount-1
          var frameX = rand * this.frameWidth * -1;
          // console.log("rand, frameX, frameWidth", rand, frameX, this.frameWidth);
          image.css('background', "url("+this._src+") " + frameX + "px 0px");
        } else {
          //TODO:animated sprite effects
        }
      }

      this._img = image;
      this.x = this._x;
      this.y = this._y;
      // image.css('top', this._y);
      // image.css('left', this._x);
      $("#"+this._target).append(image);
      // ticklist.subscribe(this);
      // console.log("initializing", this);

      //now for the scary stuff...
      if (this._dir == 'forward') {

        var modSpeed = this.speed;
        var modScale = 1;
        if (this._parallax) {
          //get the parallax depth and set the variables from there
          var depth = Math.ceil(Math.random() * this._parallaxDepth);
          modSpeed = this.speed / depth;
          modScale = 0;
          this.maxScale = 1/depth; //this might need to change
          if (!isFinite(this.maxScale)) this.maxScale = 1;  //damn infinity issues...
        }
        var dx = modSpeed * Math.cos(this.angle);
          if (!isFinite(dx)) dx = modSpeed * Math.cos(Math.round(this.angle));
        var dy = modSpeed * Math.sin(this.angle);
          if (!isFinite(dy)) dy = modSpeed * Math.sin(Math.round(this.angle));
        this.delta = {x:dx, y:dy};
        // console.log(modSpeed, this.angle, this.delta);
        this.scale = modScale;
      }


      this._initialized = true;
    },

    tick:function() {
      if (!this._initialized) {
        this.init();
        return;
      }
      switch(this._dir) {
        case 'down':
          this._y = this._y*1 + this._speed;
          this._img.css("top", this._y + "px");
          if (this._stagger > 0) {
            this._x = this._x*1 + this.lean;
            if (Math.random() > .95) this.lean = this.lean * -1;
            this._img.css("left", this._x*1 + "px");
            if (this.rock > 0) {
              //base it off of the lean
              if (this.lean > 0) {
                if (this.crock < this.rock) {
                  //tilt one degree further
                  this.crock = this.crock*1 +1;
                }
              } else if (this.lean < 0) {
                if (this.crock > this.rock * -1) {
                  this.crock = this.crock - 1;
                }
              }

              this.setStyle('transform', 'rotate(' + this.crock + 'deg)');
              this.setStyle('transform-origin', "50% 50%");
            }

          }

          if (this._y > this._maxY) {
            this._y = this._minY;
            this._centerX = Math.random() * this._maxX;
            this._x = this._centerX;
            this._img.css("left", this._centerX + "px");  //change the random position to avoid repeating patterns

            if (this.sprite && !this.animated) {
              var rand = Math.floor(Math.random() * this.frameCount);  //random number between 0 and frameCount-1
              var frameX = rand * this.frameWidth * -1;
              // console.log("rand, frameX, frameWidth", rand, frameX, this.frameWidth);
              this._img.css('background', "url("+this._src+") " + frameX + "px 0px");
            }
          }
        break;
        case 'up':
          this._y = this._y - this._speed;
          this._img.css("top", this._y + "px");
          if (this._stagger > 0) {
            this._x = this._x*1 + this.lean;
            if (Math.random() > .9) this.lean = this.lean * -1;
            this._img.css("left", this._x*1 + "px");
            if (this.rock > 0) {
              //base it off of the lean
              if (this.lean > 0) {
                if (this.crock < this.rock) {
                  //tilt one degree further
                  this.crock = this.crock*1 +1;
                }
              } else if (this.lean < 0) {
                if (this.crock > this.rock * -1) {
                  this.crock = this.crock - 1;
                }
              }

              this.setStyle('transform', 'rotate(' + this.crock + 'deg)');
              this.setStyle('transform-origin', "50% 50%");
            }
          }

          if (this._y < this._minY) {
            this._y = this._maxY;
            this._centerX = Math.random() * this._maxX;
            this._x = this._centerX;
            this._img.css("left", Math.random() * this._maxX + "px");  //change the random position to avoid repeating patterns

            if (this.sprite && !this.animated) {
              var rand = Math.floor(Math.random() * this.frameCount);  //random number between 0 and frameCount-1
              var frameX = rand * this.frameWidth * -1;
              // console.log("rand, frameX, frameWidth", rand, frameX, this.frameWidth);
              this._img.css('background', "url("+this._src+") " + frameX + "px 0px");
            }

          }
        break;
        case 'left':
          this._x = this._x - this._speed;
          this._img.css("left", this._x + "px");
          if (this._stagger > 0) {

          }

          if (this._x < this._minX) {
            this._x = this._maxX;
            this._centerY = Math.random() * this._maxY;
            this._y = this._centerY;
            this._img.css("top", Math.random() * this._maxY + "px");  //change the random position to avoid repeating patterns
          }
        break;
        case 'right':
          this._x = this._x*1 + this._speed;
          this._img.css("left", this._x + "px");
          if (this._stagger > 0) {

          }

          if (this._x > this._maxX) {
            this._x = this._minX;
            this._centerY = Math.random() * this._maxY;
            this._y = this._centerY;
            this._img.css("top", Math.random() * this._maxY + "px");  //change the random position to avoid repeating patterns

            if (this.sprite && !this.animated) {
              var rand = Math.floor(Math.random() * this.frameCount);  //random number between 0 and frameCount-1
              var frameX = rand * this.frameWidth * -1;
              // console.log("rand, frameX, frameWidth", rand, frameX, this.frameWidth);
              this._img.css('background', "url("+this._src+") " + frameX + "px 0px");
            }
          }
        break;
        case 'forward':
          this.x = this.x + this.delta.x;
          this.y = this.y + this.delta.y;

          if (this._parallax) {
            var max = this.maxScale;

            var cur = this.scale;
            //this is going to get wonky...
            var xSteps = 0;
            var ySteps = 0;

            if (this.delta.x > 0) {
              var xdist = this._maxX - this.originX;
              var xSteps = Math.floor(xdist/this.delta.x);
              var cxPer = (this.x - this.originX) / xdist;
            } else {
              var xdist = this._minX + this.originX;
              var xSteps = Math.floor(xdist/Math.abs(this.delta.x));
              var cxPer = (this.originX - this.x) / xdist;
            }

            if (this.delta.y > 0) {
              var ydist = this._maxY - this.originY;
              var ySteps = Math.floor(ydist/this.delta.y);
              var cyPer = (this.y - this.originY) / ydist;
            } else {
              var ydist = this._minY + this.originY;
              var ySteps = Math.floor(ydist/Math.abs(this.delta.y));
              var cyPer = (this.originY - this.y) / ydist;
            }
            var scaleCheck = Math.floor(this._tScale * 100);
            var scaleStep = (xSteps > ySteps) ? max * cyPer : max * cxPer;
            if (Math.floor(scaleStep * 100) > scaleCheck) this.scale = scaleStep;
          }

          if (this.x > this._maxX || this.x < this._minX || this.y > this._maxY || this.y < this._minY) {
            this.x = this.originX;
            this.y = this.originY;
            this.scale = 0;
            var modSpeed = this.speed;

            //RESET THE VECTOR MATH
            // get a random parallax depth and set the variables from there
            var depth = Math.ceil(Math.random() * this._parallaxDepth);
            modSpeed = this.speed / depth;
            modScale = 0;
            this.maxScale = 1/depth; //this might need to change
            if (!isFinite(this.maxScale)) this.maxScale = 1;  //damn infinity issues...

            var dx = modSpeed * Math.cos(this.angle);
              if (!isFinite(dx)) dx = modSpeed * Math.cos(Math.round(this.angle));
            var dy = modSpeed * Math.sin(this.angle);
              if (!isFinite(dy)) dy = modSpeed * Math.sin(Math.round(this.angle));
            this.delta = {x:dx, y:dy};
            // console.log(modSpeed, this.angle, this.delta);
            this.scale = modScale;
          }
        break;
        default:
          console.error("direction not defined on fxi");
        break;
      }
    },

    setStyle:function(att, val) {
      var style = base = ":" + val + ";";
      this._img.css(att, val);
      var bs = ['webkit', 'moz', 'ms', 'o'];
      for (var i=0; i<bs.length; i++) {
        this._img.css("-" + bs[i] + "-" + base,  val);
      }
    },


    destroy:function() {
      // ticklist.unsubscribe(this);
      this._img.remove();
    }


  }
  return o;
}

function loadEffectPreviewLarge(r) {
  loadEffectPreview(r, true);
}

function loadEffectPreview(r, large) {
  //modify for preview size
  var containerSize = (large == true) ? 1000 : 148;
  if(large == true) r.origin_x = 250;
  var per = 1;
  if (large == true) {
    r.max_y = 400;
    r.max_x = 600;
  } else {
    per = (r.max_y < r.max_x) ? containerSize / r.max_y : containerSize / r.max_x;
    if (r.max_y < r.max_x) {
      r.max_x = r.max_y;
    } else {
      r.max_y = r.max_x;
    }

  }

  var container = $("<div/>", {id:"effectPreview_" + r.id, style:"position:absolute; top:0px; left:0px;     overflow:hidden; height:" + r.max_y + "px; width:" + r.max_x + "px"});
  $("#" + r.target).append(container);
  container.css({
    '-webkit-transform': 'scale(' + per + ')', // Chrome 4+, Op 15+, Saf 3.1, iOS Saf 3.2+
    '-moz-transform': 'scale(' + per + ')', //FX 3.5-15
    '-ms-transform': 'scale(' + per + ')', //IE 9
    '-o-transform': 'scale(' + per + ')', //Op 10.5-12
    'transform': 'scale(' + per + ')', //Fx 16+, IE10+
    '-webkit-transform-origin': '0px 0px',
    '-moz-transform-origin': '0px 0px',
    '-ms-transform-origin': '0px 0px',
    '-o-transform-origin': '0px 0px',
    'transform-origin': '0px 0px'
  });
  r.target = "effectPreview_" + r.id;
  // console.log("loadEffectPreview", r);
  var fx = new HabEffect(r);

  fx.play();
}
function loadEffect(r) {
  // console.log("loadEffect", r);
  var fx = new HabEffect(r);
  fx.play();
}
