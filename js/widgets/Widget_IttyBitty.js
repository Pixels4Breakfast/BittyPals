class IttyBitty extends Widget {
  constructor(ob) {
    super(ob, 'IttyBitty');
    // this.className = "Controller";
    this._sprite = undefined;
    this.sounds = {};

    // this.onListen = (function(fn){this.listener(fn);}).bind(this);  //explicit binding to 'this' scope


    console.log(this);
  }
  //getters and setters
  get sprite()    { return this._sprite; }



  attach(sprite) {
    if (sprite.className == 'Sprite') {
      this._sprite = sprite;
      var me = this;
      this.sprite.click = function(){me.click()};
      this.sprite.sprite.animateSprite('addAnimation', this.animation.name, this.animation.frameset);  //TODO: extend to include actions
      this.sprite.widget = this;




    } else { console.error("Invalid attachment to IttyBitty.  Sprite not given: ", sprite)}
  }

  animate(name) {
    //play registered animation
  }

  spriteMethod(name) {
    //apply sprite.sprite.animateSprite([name], ...args)
  }

  click() {
    // open dialog box for IttyBitty
    return;
    this.sprite.loop(false);  //this allows it to do smoother looping so that the animation isn't trying to jump in in the middle of a frameset
  }

  complete() { //used for animations only at this time...
    // console.log("IttyBitty animation complete");

  }

  listener(frameNumber) {
    // console.log(`Listening: ${frameNumber}`);
    if (this.animation.keyframes.indexOf(frameNumber) > -1) {
      this.onKeyframe(frameNumber);
    } else {
      this.onKeyframe(0);
    }
  }

  onKeyframe(frame) {
    // console.log(`keyframe: ${frame}`);
    // for (var i=0; i<controllerSubjects.length; i++) if (controllerSubjects[i].controlType == this.controlType) controllerSubjects[i].onControl(frame);
  }


  controlSound(type, action) {
    var sound = this.sounds[type];
    if (sound != undefined) sound[action]();
  }
}



registerWidget('IttyBitty', IttyBitty);
