class ClickAnimate extends Widget {
  constructor(ob) {
    super(ob, 'ClickAnimate');
    this._sprite = undefined;
    this.animation = ob || {};

    this.currentLoop = 0;
  }
  get sprite()    { return this._sprite; }
  attach(sprite) {
    if (sprite.className == 'Sprite') {
      this._sprite = sprite;
      var me = this;
      this.sprite.click = function(){me.click()};
      this.sprite.sprite.animateSprite('addAnimation', this.animation.name, this.animation.frameset);
      this.sprite.widget = this;
    } else { console.error("Invalid attachment.  Sprite not given: ", sprite)}
  }

  click() {
    // this.sprite.play(this.animation.name);
    this.sprite.loop(false);  //this allows it to do smoother looping so that the animation isn't trying to jump in in the middle of a frameset
  }

  complete() { //used for animations only at this time...
    // console.log("Complete", this.currentLoop + "/" + this.animation.loops);
    if(this.currentLoop < this.animation.loops) {
      this.currentLoop++;
      var t = this;
      setTimeout(function(){t.sprite.play(t.animation.name);}, 0);  //okay...now why the hell do I have to do this to get it to work?  I hate hacks...
    } else {
      // console.log("returning to default animation");
      this.currentLoop = 0;
      this.sprite.play('default');
    }
  }
}


registerWidget('ClickAnimate', ClickAnimate);
