class Widget {
  constructor(ob, className) {
    // console.log(`constructing Widget::${className}`, ob);
    this._ob = ob;
    this._className = className;
    this._abstract = "Widget";
  }
  get ob()           { return this._ob; }
  get className()    { return this._className; }
  get abstract()     { return this._abstract; }
  set className(v)   { this._className = v; }

  click() {
    console.error("Click cannot be called on the Widget abstract.");
  }
  complete() {}
  onRemove() { console.error(`No onRemove set for ${this.className}`)};
}


//now for some basic registering toys
var widgets = [];
function registerWidget(name, classCon) {
  console.log(`Registering ${name}`);
  widgets[name] = classCon;
}

function getWidget(name, ob) {
  if (widgets[name] != undefined) {
    return new widgets[name](ob);//...I win.
  }
}


//external controller stuffs
var controllerSubjects = [];
function registerControllerSubject(sub) {
  if (controllerSubjects.indexOf(sub) == -1) controllerSubjects.push(sub);
}

function deregisterControllerSubject(sub) {
  var i = controllerSubjects.indexOf(sub);
  if (sub > -1) controllerSubjects.splice(i, 1);
}
