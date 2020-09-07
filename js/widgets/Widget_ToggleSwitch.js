class ToggleSwitch extends Widget {
  constructor(ob) {
    super(ob, "ToggleSwitch");
    // this.className = "ControllerSubject";
    this._sprite = undefined;
    this.animation = ob || {};
    this.controlType = undefined;
    this.toggleOn = false;

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
      // this.onControl(0);

    } else { console.error("Invalid attachment.  Sprite not given: ", sprite)}
  }

  click() {
    this.toggleOn = !this.toggleOn;
    var f = (this.toggleOn) ? 1 : 0;
    for (var i=0; i<controllerSubjects.length; i++) if (controllerSubjects[i].className == 'ControllerSubject' && controllerSubjects[i].controlType == 'toggle') controllerSubjects[i].onControl(f);
    this.sprite.pause();
    this.sprite.sprite.animateSprite('frame', f);
  }
}


registerWidget('ToggleSwitch', ToggleSwitch);
