class Controller extends Widget {
  constructor(ob) {
    super(ob, 'Controller');
    // this.className = "Controller";
    this._sprite = undefined;
    this.animation = ob || {};
    this.controlType = undefined;

    this.currentLoop = 0;
    this.onListen = (function(fn){this.listener(fn);}).bind(this);  //explicit binding to 'this' scope

    this.sound_loop = ob.sound_loop || undefined;
    this.sound_click = ob.sound_click || undefined;
    this.sound_keyframe = ob.sound_keyframe || undefined;

    if (this.sound_loop != undefined && this.sound_loop != "") this.sound_loop = new Sound(this.sound_loop);
    if (this.sound_click != undefined && this.sound_click != "") this.sound_click = new Sound(this.sound_click);
    if (this.sound_keyframe != undefined && this.sound_keyframe != "") this.sound_keyframe = new Sound(this.sound_keyframe);

    // console.log(this);
  }
  get sprite()    { return this._sprite; }

  attach(sprite) {
    if (sprite.className == 'Sprite') {
      this._sprite = sprite;
      var me = this;
      this.sprite.click = function(){me.click()};
      this.sprite.sprite.animateSprite('addAnimation', this.animation.name, this.animation.frameset);
      this.sprite.widget = this;
      this.controlType = this.animation.controlType;

      this.controlSound('loop','play');
      this.controlSound('loop','loop');

      if (this.animation.frameset.length == 0) {
        console.log("autoController found");
        this.sprite.sprite.animateSprite('verbose', this.onListen, true);
      }

    } else { console.error("Invalid attachment.  Sprite not given: ", sprite)}
  }

  click() {
    // this.sprite.play(this.animation.name);
    if (this.animation.frameset.length == 0) return;
    this.sprite.loop(false);  //this allows it to do smoother looping so that the animation isn't trying to jump in in the middle of a frameset
  }

  complete() { //used for animations only at this time...
    // console.log("Complete", this.currentLoop + "/" + this.animation.loops);
    if(this.currentLoop < this.animation.loops) {
      this.sprite.sprite.animateSprite('verbose', this.onListen, true);

      this.currentLoop++;
      var t = this;
      setTimeout(function(){t.sprite.play(t.animation.name);}, 0);  //okay...now why the hell do I have to do this to get it to work?  I hate hacks...
      //check for a sound and do something cool?
      if (this.sound_click != undefined) {
        this.controlSound('loop','stop');
        this.controlSound('click', 'play');
      }

    } else {
      // console.log("returning to default animation");
      this.sprite.sprite.animateSprite('verbose', false);
      this.currentLoop = 0;
      this.sprite.play('default');
      this.controlSound('loop','play');
    }
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
    for (var i=0; i<controllerSubjects.length; i++) if (controllerSubjects[i].controlType == this.controlType) controllerSubjects[i].onControl(frame);
  }


  controlSound(type, action) {
    var sound = (type == 'loop') ? this.sound_loop : (type == 'click') ? this.sound_click : this.sound_keyframe;
    if (sound != undefined) sound[action]();
  }
}










registerWidget('Controller', Controller);
