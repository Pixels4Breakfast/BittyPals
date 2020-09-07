class ParallaxHabby extends Widget {
  constructor(ob) {
    super(ob);

    //binding
    this.doTick = (function(fn) {
      this.tick(fn);
    }).bind(this);

    this.timer = undefined;
    this.direction = ob.direction || 'right';
    this.speed = ob.speed || 2; //this should be the max foreground speed
    this.wrapper = $("<div/>", {
      style: "position:absolute; height:430px; width:1126px; overflow:hidden;"
    });

    this.depth = ob.depth || 1; //number of parallax images
    this.imageName = ob.imageName || undefined; //prefix for images
    this.staticLayers = (ob.static != undefined && ob.static != "") ? ob.static.split(',').map(Number) : [];
    this.overlayers = (ob.over != undefined && ob.over != "") ? ob.over.split(',').map(Number) : [];


    this.images = []; //these are the parallax images
    this.partners = []; //cloned images for smooth looped scrolling


    //preview vars
    this.isPreview = ob.isPreview || false;
    this.readers = ob.readers || undefined;
    this.foreground = $("#habOverlay");

    this.previewType = ob.previewType || false;

  }


  init(target, fore) {
    //TODO: allow for overwide images
    if (fore != undefined) this.foreground = fore;

    target.empty();
    this.foreground.empty();
    // if (playerID < 148) console.warn("initializing parallax", this);
    //set the images
    for (var i = 0; i < this.depth; i++) {
      var imgSrc = "";
      if (this.isPreview) {
        for (var r = 0; r < this.readers.length; r++) {
          if (this.readers[i].fileName == `${this.imageName + r}.png`) {
            imgSrc = this.readers[i].result;
            continue;
          }
        }
      } else {
        imgSrc = `assets/parallax/${this.imageName + i}.png`;
      }

      var image = $("<div/>", {
        style: `background-image:url("${imgSrc}"); position:absolute; background-repeat:repeat-x; height:430px; width:1127px; user-select:none;margin:0px;padding:0px;`,
        id: `parallaxLayer_${i}`
      });
      if (this.staticLayers.indexOf(i) == -1) {
        //create partner for moving images
        var p_image = $("<div/>", {
          style: `background-image:url("${imgSrc}"); position:absolute; background-repeat:repeat-x; height:430px; width:1127px; user-select:none;margin:0px;padding:0px;`,
          id: `parallaxLayer_${i}`
        });
        p_image.css('left', (this.direction == 'right') ? -1126 : 1126);
        this.partners[i] = p_image;
        if (this.overlayers.indexOf(i) > -1) {
          this.foreground.append(p_image);
        } else {
          this.wrapper.append(p_image);
        }
      }
      this.images.push(image);
      if (this.overlayers.indexOf(i) > -1) {
        this.foreground.append(image);
      } else {
        this.wrapper.append(image);
      }
    }

    var pScale = 1;
    switch(this.previewType) {
      case "small": pScale = 140/1126; break;
      case "large": pScale = 800/1126; break;
      default:break;
    }
    if (pScale < 1) {
      this.wrapper.css({ transform: `scale(${pScale})`, transformOrigin:"0px 0px" });
      if (this.previewType == 'small') {
        this.wrapper.css({ left: '4px', top:'calc(50% + 50px)'})
      }
    }

    target.append(this.wrapper);

    this.timer = setInterval(this.doTick, 20);

    return this;
  }
  tick() {

    // TODO: set max front speed instead of building incrementally

    // console.log("Tick", this);
    var sM = (this.direction == 'right' || this.direction == 'down') ? 1 : -1;
    var resetPoint = (this.direction == 'right') ? 1126 : -1126; //TODO: make this dynamic to accomodate multiple directions
    for (var i = 0; i < this.images.length; i++) {
      if (this.staticLayers.indexOf(i) > -1) continue;
      var move = this.speed / (this.images.length / (i + 1));//for even parallaxing.  'Parallaxing?'  Can I verbify that?  'Verbify...?'
      var layer = this.images[i];
      var cx = Number(layer.css('left').split('px')[0]);//current x value
      var nx = .5 * sM + cx + move * sM * i;
      var reset = (this.direction == 'right') ? (nx >= resetPoint) : (nx <= resetPoint);
      if (reset) nx = nx - 2252 * sM;
      layer.css('left', nx);
      //partner
      var partner = this.partners[i];
      if (partner != undefined) {
        var pcx = Number(partner.css('left').split('px')[0]);
        var pnx = .5 * sM + pcx + move * sM * i;
        var pReset = (this.direction == 'right') ? (pnx >= resetPoint) : (pnx <= resetPoint);
        if (pReset) pnx = pnx - 2252 * sM;
        partner.css('left', pnx);
      }
    }
  }
  click() {} //empty method
  pause() {
    removeInterval(this.timer);
    this.timer = undefined;
  }
  resume() {
    this.timer = setInterval(this.doTick, 40);
  }

  onRemove() {
    //cleanup
    console.log("onRemove");
    this.timer = undefined;
    this.wrapper.remove();
    this.partners.forEach(function(p) {
      p.remove()
    });
    this.images.forEach(function(l) {
      l.remove()
    });
  }
}

registerWidget('ParallaxHabby', ParallaxHabby);
