class ControllerSubject extends Widget {
  constructor(ob) {
    super(ob, "ControllerSubject");
    // this.className = "ControllerSubject";
    this._sprite = undefined;
    this.animation = ob || {};
    this.controlType = undefined;

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

      //for toggles
      this.controlType = this.animation.controlType;
      this.onControl(0);

      registerControllerSubject(this);
    } else { console.error("Invalid attachment.  Sprite not given: ", sprite)}
  }

  click() {
    // not doing a damn thing...
    // this.sprite.loop(false);
  }

  onControl(frame) {
    switch(this.controlType) {
      case 'toggle':
        this.sprite.pause();
        var tframe = (frame > 0) ? 1 : 0;
        this.sprite.sprite.animateSprite('frame', tframe);
      break;

      default:
        console.log(`Invalid control type: ${this.controlType}`);
      break;
    }
  }

}


registerWidget('ControllerSubject', ControllerSubject);
