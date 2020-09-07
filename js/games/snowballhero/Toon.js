//TODO: abstract the Toon class out so that I can create more versatile concrete classes that extend it.

//I'm going to hate myself for doing this, but let's do this whole things with Canvases...fuckstix.


function Toon(ob) {
  var o = {
    _initialized:false,
    _src:ob.src,
    _height:ob.height,
    _width:ob.width,
    _x:ob.x,
    _y:ob.y,
    _z:ob.z,


    _id:undefined,
    _con:undefined,

    get initialized()     { return this._initialized; },
    get src()             { return this._src; },
    get height()          { return this._height; },
    get width()           { return this._width; },
    get x()               { return this._x; },
    get y()               { return this._y; },
    get z()               { return this._z; },
    get id()              { return this._id; },
    get con()             { return this._con; },

    set initialized(v)    { this.initialized = v; },
    set src(v)            { this.src = v;
      //TODO: set the actual image src
    },
    set height(v)            { this.height = v;

    },
    set width(v)            { this.width = v;

    },
    set x(v)            { this.x = v;

    },
    set y(v)            { this.y = v;

    },
    set z(v)            { this.z = v;

    }
  }
  return o;
}

Toon.prototype.setLevel = function(lvl) {

}

Toon.prototype.init = function() {
  console.log("initializing toon");
}
Toon.prototype.remove = function() {

}

//play functions/animations
Toon.prototype.show = function() {

}
Toon.prototype.duck = function() {

}
Toon.prototype.throw = function() {

}
Toon.prototype.pause = function() {

}
Toon.prototype.hit = function() {

}

Toon.prototype.victory = function() {
  //happy-dance
}



console.log("Toon module loaded");
