/*
  constuctor Utility Classes (ScrollPane, ScrollFrame, TextInput)
  Copyright (c) 2017 Flint Anderson (Squishy) for MythPlaced Treasures, LLC (BittyPals)
*/

                                                                                //ScrollPane
function ScrollPane(ob) {
  // console.log("new ScrollPane::",ob);
  this._mainID = "sp_" + Math.floor(Math.random() * 1000000);
  this._height = ob.height || 200;
  this._width = ob.width || 400;
  this._frameWidth = ob.frameWidth || 150;
  this._frameHeight = ob.frameHeight || 150;
  this._title = ob.title || "";
  this._confirmButtonText = ob.confirmButtonText || "OK";
  this._cancelButtonText = ob.cancelButtonText || "Cancel";
  this._showCancelButton = ob.showCancelButton || true;

  this._showVarButton = ob.showVarButton || false;
  this._varButtonText = ob.varButtonText || "";

  this._frameObjects = ob.frames || [];
  this._frameSet = [];
  this._scrollPos = 0;
  this._scrollMin = 0;

  this._selected = undefined;
  this._onConfirm = ob.onConfirm;
  this._onCancel = ob.onCancel;
  this._onVarButton = ob.onVarButton;

  this.construct();
}

ScrollPane.prototype.construct = function () {
  // console.log("ScrollPane::construct", this);
  $("#utilityPane").addClass("mask");
  var me = this;
  $("#utilityPane").on('click', function(){ me.close(me); });
  this._mainContainer = $("<div/>", {id:this._mainID, class:"ScrollContainer centerHV"});
  this._mainContainer.css({
    "height":Number(this._height + 15) + "px",  //footer
    "width":Number(this._width + 2) + "px"  //accomodating borders
  })
  this._scrollContainer = $("<div/>", {class:"ScrollItemContainer", style:"height:"+this._frameHeight+"px;"});

  for (var i=0; i<this._frameObjects.length; i++) this.addFrame(this._frameObjects[i]);
  // this._mainContainer.append(this._scrollContainer);


  var header = $("<div/>", { //header
    style:"width:100%; text-align:center; font-size:1.4em; height:75px; background-color:white; border-top-left-radius:15px;border-top-right-radius:15px; box-shadow:0px 4px 8px #333333;"
  });
  var cButton = $("<button />", { //close button
    style:"position:relative; float:right; margin-right:5px; margin-top:5px;",
    class:"close_button_sprite",
    title:"Close"
  });
  cButton.on('click', function(){ me.cancel(); });
  header.append(cButton);
  header.append(this._title);
  this._mainContainer.append(header);

  this._scrollWindow = $("<div/>", {class:"scrollWindow"});
  this._scrollWindow.css({
    "height":this._frameHeight,
    "width":this._width - 60 + "px"  //accomodate buttons
  })


  //now to the fun stuff...
  this._larrow = $("<div/>", { id:"lArrow", class:"arrow left disabled", style:"border-right:1px solid #acc6ef", title:"Scroll Back", style:"height:"+this._frameHeight+"px"}).html("&#8678;");
  this._rarrow = $("<div/>", { id:"rArrow", class:"arrow right", style:"border-left:1px solid #acc6ef", title:"Scroll Forward", style:"height:"+this._frameHeight+"px"}).html("&#8680;");
  this._larrow.on('click', function() {me.scroll('left')});
  this._rarrow.on('click', function() {me.scroll('right')});

  this._mainContainer.append(this._larrow);
  this._scrollWindow.append(this._scrollContainer);
  this._mainContainer.append(this._scrollWindow);
  this._mainContainer.append(this._rarrow);

  var buttons = $("<div/>", { class:'smooth_btn_container buttons', style:"width:100%; border-top:1px solid black;"});
    var confButton = $("<button/>", { class:"spaced solo shiny", style:"height:20px;width:auto;"}).html(this._confirmButtonText);
    confButton.on('click', function(){ me.confirm(); });
    buttons.append(confButton);
  if (this._showCancelButton) {
    var cancelButton = $("<button/>", { class:"spaced solo shiny", style:"height:20px; width:auto; color:red"}).html(this._cancelButtonText);
    cancelButton.on('click', function(){ me.cancel(); });
    buttons.append(cancelButton);
  }
  if (this._showVarButton) {
    var varButton = $("<button/>", { class:"spaced solo shiny", style:"height:20px; width:auto; float:right"}).html(this._varButtonText);
    varButton.on('click', function(){ me.varButtonClick(); });
    buttons.append(varButton);
  }
  this._mainContainer.append(buttons);



  $('body').append(this._mainContainer);
}

ScrollPane.prototype.scroll = function(dir) {
  var os = (dir == "left") ? this._frameWidth + 4 : Number(this._frameWidth + 4) * -1;
  var newPos = this._scrollPos*1 + os;
  if (newPos <= 0 && newPos > this._scrollMin) {
    this._scrollPos = newPos;
    this._scrollContainer.animate({'left': newPos + "px"}, 200, 'swing');
  }
  //activate/deactivate arrows
  if (newPos*1 + Number(this._frameWidth + 4) > 0) {
    this._larrow.addClass("disabled");
  } else { this._larrow.removeClass("disabled"); }
  if (newPos*1 - Number(this._frameWidth + 4) < this._scrollMin) {
    this._rarrow.addClass("disabled");
  } else { this._rarrow.removeClass("disabled"); }
}


ScrollPane.prototype.frames = function(frameSet) {
  if (frameSet == undefined) { return this._frameObjects; } else {
    this._frameObjects = frameSet;
  }
}

ScrollPane.prototype.addFrame = function(frameOb) {
  // console.log("ScrollPane::addFrame", frameOb);
  var frame = new ScrollFrame(this, frameOb);
  this._frameSet.push(frame);
  this._scrollMin = Number(this._frameSet.length * (this._frameWidth + 6) - Number(this._width-60)) * -1;
  this._scrollContainer.css("width", Number(this._frameSet.length * (this._frameWidth + 6)) + "px");
  this._scrollContainer.append(frame._frame);
}

ScrollPane.prototype.setSelected = function(frame) {
  console.log("ScrollPane::setSelected", frame);
  this._selected = (frame != undefined) ? frame._id : undefined;
  for (var i=0; i<this._frameSet.length; i++) {
    if (this._frameSet[i] != frame)  this._frameSet[i]._frame.removeClass('selected');
  }
}





ScrollPane.prototype.confirm = function() {
  if (this._selected == undefined) {
    // console.error("ScrollPane:ERROR::selected is empty", this);
    popNotify("You have not made a selection yet!");
  } else {
    if (this._onConfirm == undefined) {
      console.error("ScrollPane:ERROR::onConfirm is not defined", this);
    } else {
      this._onConfirm(this._selected);
      this.close(this);
    }
  }
}

ScrollPane.prototype.cancel = function() {
  if (this._onCancel != undefined) {
    this._onCancel();
  }
  this.close(this);  //ScrollPane is ScrollPane's parent...the hillbilly...
}

ScrollPane.prototype.varButtonClick = function() {
  if (this._selected == undefined) {
    // console.error("ScrollPane:ERROR::selected is empty", this);
    popNotify("You have not made a selection yet!");
  } else {
    if (this._onVarButton == undefined) {
      console.error("ScrollPane:ERROR::onVarButton is not defined", this);
    } else {
      this._onVarButton(this._selected);
      this.close(this);
    }
  }
}

ScrollPane.prototype.close = function(parent) {
  //TODO: add destructors
  // console.log("ScrollPane::close");
  $("#utilityPane").removeClass("mask");
  $("#utilityPane").off('click');
  parent._mainContainer.remove();
}




                                                                                  //ScrollFrame
function ScrollFrame(parent, frameOb) {
  console.log("\tnew ScrollFrame", frameOb);
  this._parent = parent;
  this._width = parent._frameWidth;
  this._height = parent._frameHeight;
  this._name = frameOb.name || "";
  this._description = frameOb.description || "";
  this._src = frameOb.src;
  this._id = frameOb.id;
  this._frame = $("<div/>", {title:this._description});
  this._frame.css({
      "border-radius": "5px",
      "height": this._height+"px",
      "width": this._width+"px",
      "display": "inline-block",
      "position":"relative",
      "margin-left":"2px",
      "margin-right":"2px",
      "vertical-align":"top",
      "text-align":"center"
    });
  this._frame.append(this._name);
  this._img = $("<img/>", {src:this._src, class:"centerHV", style:"max-height:"+Number(this._height-4)+"px;max-width:"+Number(this._width-4)+"px;position:absolute;"});
  this._frame.append(this._img);
  var me = this;
  this._frame.on('click', function(e) { me.select(e, me)});
  // return this._frame;
}


ScrollFrame.prototype.select = function(e, me) {
  console.log("ScrollFrame::select:", me._id, e);
  if (me._frame.hasClass("selected")) {
    me._frame.removeClass("selected");
    me._parent.setSelected();
    console.log("unselecting");
  } else {
    me._frame.addClass("selected");
    me._parent.setSelected(me);
  }
}



                                                                                //TextInput
function TextInput(ob) {
  console.log("new TextInput::", ob);
  this._title = ob.title || "";
  this._value = ob.value || "";
  this._width = ob.width || 200;
  this._height = ob.height || 150;
  this._mainContainer = $("<div/>", {class:"TextInput centerHV"});
  this._input = $("<input/>", {value:this._value});
  this._onConfirm = ob.onConfirm;
  this._onCancel = ob.onCancel;
  this._showCancelButton = ob.showCancelButton || true;
  this._confirmButtonText = ob.confirmButtonText || "OK";
  this._cancelButtonText = ob.cancelButtonText || "Cancel";

  this.construct();
}

TextInput.prototype.construct = function() {
  $("#utilityPane").addClass("mask");
  var me = this;
  $("#utilityPane").on('click', function(){ me.close(me); });

  this._mainContainer.css({
    height:this._height + "px",
    width:this._width + "px"
  })

  var header = $("<div/>", { //header
    style:"width:100%; text-align:center; font-size:1.4em; height:75px; background-color:white; border-top-left-radius:15px;border-top-right-radius:15px; box-shadow:0px 4px 8px #333333;"
  });
  var cButton = $("<button />", { //close button
    style:"position:relative; float:right; margin-right:5px; margin-top:5px;",
    class:"close_button_sprite",
    title:"Close"
  });
  cButton.on('click', function(){ me.cancel(); });
  header.append(cButton);
  header.append(this._title);
  this._mainContainer.append(header);

  this._mainContainer.append(this._input);

  var buttons = $("<div/>", { class:'smooth_btn_container buttons', style:"width:100%; border-top:1px solid black;"});
    var confButton = $("<button/>", { class:"spaced solo shiny", style:"height:20px;width:auto;"}).html(this._confirmButtonText);
    confButton.on('click', function(){ me.confirm(); });
    buttons.append(confButton);
  if (this._showCancelButton) {
    var cancelButton = $("<button/>", { class:"spaced solo shiny", style:"height:20px; width:auto; color:red"}).html(this._cancelButtonText);
    cancelButton.on('click', function(){ me.cancel(); });
    buttons.append(cancelButton);
  }
  this._mainContainer.append(buttons);

  $('body').append(this._mainContainer);
}

TextInput.prototype.cancel = function() {
  if (this._onCancel != undefined) {
    this._onCancel();
  }
  this.close(this);
}

TextInput.prototype.confirm = function() {
  if (this._onConfirm == undefined) {
    console.error("TextInput:ERROR::onConfirm is not defined");
  } else {
    this._onConfirm(this._input.val());
  }
  this.close(this);

}

TextInput.prototype.close = function(parent) {
  //TODO: add destructors
  // console.log("ScrollPane::close");
  $("#utilityPane").removeClass("mask");
  $("#utilityPane").off('click');
  parent._mainContainer.remove();
}



////////////////////////////////////////////////////////////////////////////////DropDown
function DropDown(ob) {

}

DropDown.prototype.construct = function() {

}
