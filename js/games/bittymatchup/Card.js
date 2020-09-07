function Card(ob) {
  this.id = ob.id;  //do I actually need to do this?
  this.cardID = ob.cardID;
  this.src = ob.src;
  this.backer = ob.backer || imgPath + cardBacker;
  this.showing = false;
  this.class = ob.class;
  this.gridID = undefined;
  this.container = undefined;
  this.animating = false;
  this.currentScale = 1;
  this.contracting = true;

  this.sound = ob.sound;
}

Card.prototype = {
  set scale(v)   {
    //TODO: make sure that the transform-origin is set to the middle so that cards flip over their centers
    var scale = Number(v); //Math.round( v /10 * 10 ) / 10;  //computers are incredibly stupid at times...and they need a little help
    this.innerImg.css({
      '-webkit-transform': 'scaleX(' + scale + ')', // Chrome 4+, Op 15+, Saf 3.1, iOS Saf 3.2+
      '-moz-transform': ' scaleX(' + scale + ')', //FX 3.5-15
      '-ms-transform': 'scaleX(' + scale + ')', //IE 9
      '-o-transform': 'scaleX(' + scale + ')', //Op 10.5-12
      'transform': 'scaleX(' + scale + ')', //Fx 16+, IE10+
      '-moz-transform-origin': '50% 50%',
      '-webkit-transform-origin': '50% 50%',
      '-o-transform-origin': '50% 50%',
      '-ms-transform-origin': '50% 50%',
      'transform-origin': '50% 50%'
    });
    this.backImg.css({
      '-webkit-transform': 'scaleX(' + scale + ')', // Chrome 4+, Op 15+, Saf 3.1, iOS Saf 3.2+
      '-moz-transform': ' scaleX(' + scale + ')', //FX 3.5-15
      '-ms-transform': 'scaleX(' + scale + ')', //IE 9
      '-o-transform': 'scaleX(' + scale + ')', //Op 10.5-12
      'transform': 'scaleX(' + scale + ')', //Fx 16+, IE10+
      '-moz-transform-origin': '50% 50%',
      '-webkit-transform-origin': '50% 50%',
      '-o-transform-origin': '50% 50%',
      '-ms-transform-origin': '50% 50%',
      'transform-origin': '50% 50%'
    });
  },
  set size(v)   {
    var size = v + "px";
    this.innerImg.css({
      'height': size,
      'width' : size
    })
  },
  set margin(v) {
    var p = v + "px";
    this.innerImg.css({
      'margin': p
    })
  }
}

Card.prototype.init = function(target) {  //target needs to be sent as jQuery object of div
  this.container = target;
  this.gridID = target.attr('id').split("_")[1];
  this.img = $("<div/>", {class:this.class});
  this.innerImg = $("<img/>", {class:this.class, src:this.src});
  this.backImg = $("<img/>", {class:this.class, src:this.backer});
  this.img.append(this.innerImg);
  this.img.append(this.backImg);
  this.innerImg.hide();

  this.img.attr("onclick", "flipCard(" + this.gridID + ")");  //this...is dumb.  Damnit, jQuery.  Be smarter about 'this' stuff.

  target.append(this.img);
}

Card.prototype.flip = function() {
  //just the animation
  // sounds.cardFlip.play();
  this.sound.play();
  if (this.showing) {
    this.showing = false;
    this.contracting = true;
    this.animate();
  } else {
    this.showing = true;
    this.contracting = true;
    this.animate();
  }
}



Card.prototype.animate = function() {  //I'll clean this up later...prototyping time right now...
  if (this.contracting) {
    if (this.currentScale > 0) {
      this.currentScale = Math.round((this.currentScale - .1) * 10) / 10;  //damnit, computers.  Just do basic friggin' math!
      this.scale = this.currentScale;
      var me = this;
      setTimeout((function() {
        me.animate();
      }), 10);
    } else {
      this.contracting = false;
      if (this.showing) {
        this.innerImg.show();
        this.backImg.hide();
      } else {
        this.innerImg.hide();
        this.backImg.show();
      }
      var me = this;
      setTimeout((function() {
        me.animate();
      }), 10);
    }
  } else {  //expanding image
    if (this.currentScale < 1) {
      this.currentScale = Math.round((this.currentScale + .1) * 10) / 10;  //damnit, computers.  Just do basic friggin' math!
      this.scale = this.currentScale;
      var me = this;
      setTimeout((function() {
        me.animate();
      }), 10);
    }
  }
}

Card.prototype.click = function() {
  if (this.showing) return;
  this.flip();
}

Card.prototype.remove = function() {
  this.container.empty();
}
