
function Sprite(ob) {
  var o = {
    _id:ob.id, //required
    _base:"sprite_" + ob.id + "_" + Math.floor(Math.random() * 100000),
    _class:undefined,
    _fullInit:false,
    _frameCount:ob.framecount, //required
    _frames:[], //generated in init()
    _src:ob.src, //required
    _h:ob.height, //required
    _w:ob.width, //required
    _x:ob.x || 0,
    _y:ob.y || 0,
    _z:ob.z || 0,
    _s:ob.s || 1,
    _r:ob.r ||0,
    _hr:ob.hr || 0,
    _autoStart:(ob.autoStart == false) ? false : true,
    _loop:(ob.loop == false) ? false : true,
    _animationOnInit:ob.animationOnInit || "default",
    _sprite:undefined,
    _wrapper:undefined,
    _container:undefined,
    _animations:ob.animations || {},
    _widget:ob.widget || undefined,

    //put the other parameters in here...
    get className()   { return "Sprite"; },

    get id()          { return this._id; },
    get base()        { return this._base; },
    get src()         { return this._src; },
    get fullInit()    { return this._fullInit; },
    get height()      { return this._h; },
    get width()       { return this._w; },
    get x()           { return this._x; },
    get y()           { return this._y; },
    get z()           { return this._z; },
    get s()           { return this._s; },
    get r()           { return this._r; },
    get hr()          { return this._hr; },
    get sprite()      { return this._sprite; }, //this has the background-url, controls hue-rotation
    get wrapper()     { return this._wrapper; },  //this controls scale
    get container()   { return this._container; }, //this controls rotation
    get animations()  { return this._animations; },
    get widget()      { return this._widget; },

    set fullInit(v)    { this._fullInit = v; },
    set height(v)      { this._h = v;
        //do math...
      },
    set width(v)       { this._w = v;
        //do math...
      },
    set x(v)           { this._x = v; this.container.css("left", v+"px"); },
    set y(v)           { this._y = v; this.container.css("top", v+"px"); },
    set z(v)           { this._z = v; this.container.css("z-index", v); },
    set s(v)           { /*TODO: set the scale*/ },
    set r(v)           { /*TODO: set the rotation*/ },
    set hr(v)          { /*TODO: set the hue-rotation*/ },
    set sprite(v)      { console.error("You cannot change the 'sprite' attribute of Sprite, ya twit!"); },
    set wrapper(v)     { console.error("You cannot change the 'wrapper' attribute of Sprite, ya twit!"); },
    set container(v)   { console.error("You cannot change the 'container' attribute of Sprite, ya twit!"); },
    set widget(v)      { this._widget = v; },

    init:function() {
      for (var i = 0; i < this._frameCount; i++) this._frames[i] = i;
      this._animations.default = this._frames;
      if (this.render()) return true;
    },
    render:function() {
      if ($("#" + this.base + "_sp").attr('id') == undefined) {
        //create it from scratch
        this._container = $("<div/>", {id:this.base + "_sc", style:"position:absolute; height:1px; width:1px; overflow:visible;"});
        this._wrapper = $("<div/>", {id:this.base + "_wr", style:"position:absolute; top:-" + (this.height/2) + "px; left:-" + (this.width/2) + "px;"});
        this._sprite = $("<div/>", {id:this.base + "_sp", style:"height:" + this.height + "px; width:" + this.width + "px; background-image:url("+this.src+")"});
        this.wrapper.append(this.sprite);
        this.container.append(this.wrapper);
      } else {
        this._container = $("#" + this.base + "_sc");
        this._wrapper = $("#" + this.base + "_wr");
        this._sprite = $("#" + this.base + "_sp");
      }
      return true;
    },
    appendTo:function(el) {
      el.append(this.container);
    },
    start:function() {
      var me = this;
      if (this.sprite.attr('id') == undefined){
        setTimeout(this.start, 300);
        return;
      }
      if (this.fullInit) {
        console.log("play from Full Initialization");
        this.play(this._animationOnInit);
      } else {
        // console.log("SPRITE_START::not initialized", this);
        this.fullInit = true;
        this.sprite.animateSprite({
          fps: 24,
          animations: this.animations,
          // loop: this._loop,
          loop: false,
          autoplay:false,
          complete: function() {
            if (me._loop) {
              console.log("playing default");
              me.play('default');
            } else {
              if (me.widget != undefined) {
                me.widget.complete();
              } else {
                me.play('default');
                me.frame(0);
              }
            }
          }
        });
        if (this._autoStart) this.play(this._animationOnInit);
      }
    },
    play:function(animationName) {
      this.loop((animationName == 'default') ? true : false);
      this.sprite.animateSprite("play", animationName);
    },
    pause:function() {
      this.sprite.animateSprite('stop');
      this.frame(1);
    },
    setClass:function(c) {
      this._class = c;
      this.container.addClass(c);
    },
    max:function(w, h) {
      if (this.width <= w && this.height <= h) return;
      var wAdjust = w / this.width;
      var hAdjust = h / this.height;

      var pScale = (hAdjust < wAdjust) ? hAdjust : wAdjust;

      var tScale = Math.floor(pScale * 100);
      while(tScale % 10 != 0) {
        tScale--;
      }
      pScale = tScale / 100;

      this.container.css("-webkit-transform","scale("+pScale+")");
      this.container.css("-moz-transform","scale("+pScale+")");
      this.container.css("-ms-transform","scale("+pScale+")");
      this.container.css("-o-transform","scale("+pScale+")");
      this.container.css("transform","scale("+pScale+")");

    },
    loop:function(b) {
      this._loop = b;
      this.sprite.animateSprite("loop", b);
    },
    frame:function(n) {
      this.sprite.animateSprite('frame', n);
    },
    click:function() {
      //nuthin'
    }

  }
  return o;
}
