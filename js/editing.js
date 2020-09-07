var cItem = null; //direct handle to currently active item
var cPalette = null; //current options and palette
var clu = {};


//IMAGE ROTATION VARS
var cDegrees = null;
var rotating = false,
    o_x, o_y, h_x, h_y;



function getItemByName(sName) {
  var i = $("#" + sName);
  return (i != undefined) ? i : false;
}
function getIndex(ts) {  //simple
  var split = ts.split("_")[0].split("item")[1];
  return split;
}



          //PALETTE
function showPalette(item) {
  if (item == undefined) { item = cItem; } else { item = habitatItem; }
  // console.log("showPalette", item.palette);
  $("#controlBar").animate({height:"75px"}, 100, function() {
    item.palette.css("visibility", "visible");
    $("#cbPalette").fadeTo("250", 1);
  });
}
function hidePalette() { //hiding all palettes
  // console.log("hidePalette");
  $("#cbPalette").fadeOut(100, function(){
    $("#controlBar").animate({height:"55px"},100);
  });
  cPalette = null;
}
function rotatePalette(e) {
  var m = e.id.split("p")[1];
  var r = paletteIncrement * m;
  var item = (cItem != null) ? cItem : habitatItem;
  item.hr = r;
}

function mirror() {
  if (cItem == null) return;
  cItem.mirror();
}

function getItemById(id) {
  if (typeof id == 'number') {
    baseID = id;
  } else {
    var baseID = id.split("_")[1];
  }
  for (var i = 0; i < zArray.length; i++) {
    if (zArray[i].id == baseID) return zArray[i];
  }
}

          //DRAGGING
var moX, moY, mpX, mpY = 0;  //mousex, mousey, mousepreviousx, mousepreviousy
var minFrame = 5;  //edge buffer so players don't lose their items offscreen
function startDrag(e) {
  e.preventDefault(); e.stopPropagation();
  if (!editing) {
    getItemById(e.target.id).click();
    return;
  }
  if (getItemById(e.target.id)) {
    var readyFlag = false;
    // var oItem = zArray[getIndex(e.target.item_id)];
    var oItem = getItemById(e.target.id);
    if (cItem != null) {
      if (cItem.id != oItem.id) {
        if (cItem.deactivate()) {
          if (oItem.activate()) {
            cItem = oItem;
            readyFlag = true;
          }
        }
      } else {
        readyFlag = true;
      }
    } else {
      cItem = oItem;
      if (cItem.activate()) readyFlag = true;
    }
    if (readyFlag) {
      //get the mouse offsets
      var iOff = cItem.container.offset();
      var iSrc = e;
      if (e.targetTouches != undefined) {
        iSrc = e.targetTouches[0];
      }
      moX = iSrc.pageX - iOff.left;
      moY = iSrc.pageY - iOff.top;

      $(document).on('mousemove touchmove', function(a){dragItem(a);});
      $(document).on('mouseup touchend', function(a){endDrag(a);});
      hideRotate();
    }
  }
}
function dragItem(e) {
  e.preventDefault(); e.stopPropagation();
  var offset = $("#habitat").offset();

  var iSrc = e;
  if (e.targetTouches != undefined) {
    iSrc = e.targetTouches[0];
  }
  var rX = iSrc.pageX - offset.left - moX;
  var rY = iSrc.pageY - offset.top - moY;

  var w = Math.round(cItem.container.width() * cItem.scale);
  var h = Math.round(cItem.container.height() * cItem.scale);
  var tAngle = cItem.rotate;
  tAngle = (tAngle < 0) ? tAngle + 360 : tAngle;  //remove negative rotation
  var bWidth = Math.abs(Math.cos(tAngle) * w) + Math.abs(Math.sin(tAngle) * h);
  var bHeight = Math.abs(Math.cos(tAngle) * h) + Math.abs(Math.sin(tAngle) * w);
  // console.log(w + 'x'+h+" bw: " + bWidth + ", bh: " + bHeight + ", angle: " + tAngle);

  var addX = 0;
  var addY = 0;
  if (currentRoom != 1) {
    switch(habitatItem.roomDir) {
      case "hv":
        if (currentRoom == 2 || currentRoom == 4) addX = 1126;
        if (currentRoom == 3 || currentRoom == 4) addY = 430;
      break;
      case "v":
        addY = (currentRoom - 1) * 430;
      break;
      case "h":
        addX = (currentRoom - 1) * 1126;
      break;
      default:
        console.error("WTF?");
      break;
    }
  }
  var newX = rX + addX;
  var newY = rY + addY;


  if ((cItem.image.width() > minFrame) && (rX < ($("#habitat").width() - minFrame)) && (rX > 0)) cItem.x = Math.round(newX);
  if ((cItem.image.height() > minFrame) && (rY < ($("#habitat").height() - minFrame)) && (rY > 0)) cItem.y = Math.round(newY);
}
function endDrag(e) {
  e.preventDefault(); e.stopPropagation();
  $(document).unbind("mousemove touchmove");
  $(document).unbind("mouseup touchend");
  moX, moY = 0;

  showRotate();
}

function getRWH(item) {  //TODO: remember how to do trig...
  var ob = {};
  var w = Math.round(item.image.width() * item.scale);
  var h = Math.round(item.image.height() * item.scale);
  var tAngle = item.rotate * Math.PI/180;
  tAngle = (tAngle < 0) ? tAngle + 360 : tAngle;  //remove negative rotation
  var bWidth = Math.abs(Math.cos(tAngle) * w) + Math.abs(Math.sin(tAngle) * h);
  var bHeight = Math.abs(Math.cos(tAngle) * h) + Math.abs(Math.sin(tAngle) * w);
  ob.w = bWidth;
  ob.h = bHeight;
  return ob;
}

                //IMAGE ROTATION
function showRotate() { //places and shows the rotate handle
    var img = cItem.image;
    //console.log(img);
    var x = img.offset().left;
    var y = img.offset().top;
    var w = img.width();
    var h = img.height(); //not sure I'll actually be using this...

    if (cItem.rotate != null || cDegrees != null) {
      var rwh = getRWH(cItem);
      w = rwh.w;
      h = rwh.h;
    }

    if (cItem.scale != undefined) {
      w = w * cItem.scale;
    }

    var rb = $("#rotateBox");
    rb.css("top", y);
    rb.css("left", x + w + 10);
    rb.show(); //show the rotate handle elements
}
function hideRotate() {  //so much bloody simpler
    $("#rotateBox").hide();
};


function startRotate(e) {
    cItem.data.ox = cItem.container.position().x;
    cItem.data.oy = cItem.container.position().y;
    // console.log("\tvs item: y: " + cItem.y + ", x: " + cItem.x);
    //bind the mousemove and mouseup to the draggable handle and the image until the save is hit
    $(document).on('mousemove touchmove',function(a){rotate(a)});
    $(document).on('mouseup touchend',function(a){stopRotate (a)});

    var iSrc = e;
    if (e.targetTouches != undefined) iSrc = e.targetTouches[0];
    h_x = iSrc.pageX;
    h_y = iSrc.pageY; // clicked point
    e.preventDefault();
    e.stopPropagation();
    rotating = true;
    cItem.data.origin = {
      left: cItem.image.offset().left,
      top: cItem.image.offset().top
    };
    o_x = cItem.data.origin.left;
    o_y = cItem.data.origin.top; // origin point

    cItem.data.last_angle = cItem.data.last_angle || cItem.rotate * Math.PI / 180;
};

function rotate(e) {
    if (rotating) {
      var iSrc = e;
      if (e.targetTouches != undefined) iSrc = e.targetTouches[0];
        var s_x = iSrc.pageX,
            s_y = iSrc.pageY; // start rotate point
        if (s_x !== o_x && s_y !== o_y) { //start rotate
            var s_rad = Math.atan2(s_y - o_y, s_x - o_x); // current to origin
            s_rad -= Math.atan2(h_y - o_y, h_x - o_x); // handle to origin
            s_rad += cItem.data.last_angle; // relative to the last one
            var degree = (s_rad * (360 / (2 * Math.PI)));
            // if (degree < 0) { while(degree < 0) degree += 360; }  //this is stupid...
            // if (degree > 360) { while(degree > 360) degree -= 360; }  //this is also stupid...
            cItem.container.css('-moz-transform', 'rotate(' + degree + 'deg)');
            cItem.container.css('-moz-transform-origin', '50% 50%');
            cItem.container.css('-webkit-transform', 'rotate(' + degree + 'deg)');
            cItem.container.css('-webkit-transform-origin', '50% 50%');
            cItem.container.css('-o-transform', 'rotate(' + degree + 'deg)');
            cItem.container.css('-o-transform-origin', '50% 50%');
            cItem.container.css('-ms-transform', 'rotate(' + degree + 'deg)');
            cItem.container.css('-ms-transform-origin', '50% 50%');
        }
    }
}; // end mousemove

function stopRotate(e) {
    rotating = false
    var iSrc = e;
    if (e.targetTouches != undefined) iSrc = e.targetTouches[0];
    var s_x = iSrc.pageX, s_y = iSrc.pageY;

    // Saves the last angle for future iterations...I hope
    var s_rad = Math.atan2(s_y - o_y, s_x - o_x); // current to origin
    s_rad -= Math.atan2(h_y - o_y, h_x - o_x); // handle to origin
    s_rad += cItem.data.last_angle;
    cItem.data.last_angle = s_rad;
    $(document).unbind("mouseup touchend");
    $(document).unbind("mousemove touchmove");


        //all of the following shite is to get the actual rotation angle...and my squishy hates me...
    var el = document.getElementById("item_" + cItem.id);  //this is stupid...but it works
    var st = window.getComputedStyle(el, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
             st.getPropertyValue("-moz-transform") ||
             st.getPropertyValue("-ms-transform") ||
             st.getPropertyValue("-o-transform") ||
             st.getPropertyValue("transform") ||
             "f*@%stix...what browser are you using???";
            //check this whole thing for real browser compatibility...
    //console.log('Matrix: ' + tr);
    //rotation matrix squishy-killer: http://en.wikipedia.org/wiki/Rotation_matrix

    var values = tr.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    var scale = Math.sqrt(a*a + b*b);
    //math...pain...ow...
    var sin = b/scale;
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    cDegrees = angle;
    cItem.rotate = angle;
};



                //LAYERING
function compareZ(a,b) { if (Number(a.z) < Number(b.z)) return -1; if (Number(a.z) > Number(b.z)) return 1; return 0; }  //just for cleaning up the array on init
function layer(type) { //going to be doing this with some sneaky array work.
  if (cItem == null) return;
  var cZ = zArray.indexOf(cItem); //cItem.z;
  var nZ = -1;  //this will be the new z-index, as well as the array index...cheeky
  var temp = zArray.splice(cZ, 1)[0];
  switch(type) {
    case 'ceiling':  //push
      zArray.push(temp);
      if (cZ == zArray.length) return;  //was already at top.  Don't bother sorting.
      nZ = zArray.length - 1;
    break;
    case 'up':
      if (cZ == zArray.length) { zArray.push(temp); return; } //already at the top.  Just put it back.
      nZ = cZ+1;
      zArray.splice(nZ, 0, temp);
    break;
    case 'down':
      if (cZ == 0) { zArray.unshift(temp); return; } //already at the bottom.  Just put it back.
      nZ = cZ-1;
      zArray.splice(nZ, 0, temp);
    break;
    case 'floor':
      zArray.unshift(temp);
      if (cZ == 0) return; //was already at bottom.  Don't bother sorting.
      nZ = 0;
    break;
    default:
      console.log("something went wrong with layering.  Type sent: ", type);
    break;
  }
  var sortStart = (nZ < cZ) ? nZ : cZ;
  sortLayers(sortStart);
}

function removeFromZ(item, sort) {
  // console.log("RFZ->sort: " + sort);
  zArray.splice(zArray.indexOf(item), 1)[0];
  if (sort) sortLayers();
}

function sortLayers(ss, save) { //make sure everything is at the z-index it's supposedly supposed to be at...yeah...hah...
  if (save == undefined) save = true;
  // console.log("sorting from " + ss, save, zArray);
  var sortOb = [];
  for (var i = ss || 0; i < zArray.length; i++) {
    if (zArray[i] == undefined) {
      console.error("sortLayers broke on index "+ i, zArray);
      continue;
    }
    if (zArray[i].z != i) {
      // console.log("This thing...", zArray[i]);
      if (save) sortOb.push({id:zArray[i].id, z:i, pid:zArray[i].pid, item_id:zArray[i].baseId});
      zArray[i].z = i;
    }
  }
  if (sortOb.length == 0) {
  } else {
    if (save) paramQuery({layers:sortOb}, verifyLayers, "update_layers");
  }
}
function verifyLayers(r) {
  if (r != 'success') console.log(r);
}

          //SCALING
function setSlider(value) {
  var realVal = Math.floor(value *100) / 1000;
  $("#scaleSlider").val(realVal);
  // console.log("setting slider: ", realVal);
}
function changeScale(s) { if (!cItem) return; cItem.scale = s; }


                //SAVING
function saveChanges() {
  if (cItem == null) return;  //no current item to save
  // console.log("saving changes for item: " + getContainerBaseId(cItem));
  // console.log("saving changes for item: " + cItem.id);
  cItem.commitTemp();
  hideRotate();
  cItem.image.unbind("mousedown touchstart");
}
function saveAndDeactivate() {
  if (cItem != null) {
    cItem.deactivate();
  } else {
    habitatItem.commitTemp();
  }
  hidePalette();
  saveChanges();
}
function doneEditing() {
  if (cItem != null) {
    cItem.deactivate();
  } else {
    habitatItem.commitTemp();
  }
  hidePalette();
  saveChanges(); //this actually only saves the changes to the last item if it is still active.  Everything else is saved on the fly.
  if ($("#roomController").hasClass("centerHV")) toggleRoomController();
  closeEditor();
}


                                                                  //INVENTORY
var inventoryObjects = [];  //assoc array of item data objects



function buildInventory(ob) {
  // console.log("build: ", ob);
  if (ob.items.length == 0) {
    $("#itemBlocks").empty();
    $("#itemBlocks").append("<center>Uh oh!  We didn't find anything matching your search!<br />Maybe check your spelling, or try a different category.</center>");
    return;
  }

  var invItems = [];

  if (ob.rowcount != undefined && ob.rowcount > 0) {
    rowcount = ob.rowcount;
    setBreadcrumbs();
    if (rowcount == 0) $("#itemBlocks").append("<center>Uh oh!  We didn't find anything matching your search!<br />Maybe check your spelling, or try a different category.</center>");
  } else { return; }
  invItems = ob.items;

  $("#itemBlocks").empty();
  for (var i = 0; i < invItems.length; i++) {
    var item = invItems[i];
    inventoryObjects["item_" + item.item_id] = item; //put it into the data array for use

    $("#itemBlocks").append(new ItemBlock(item).display);
  }
  // console.log("Inventory Objects:\n\t", inventoryObjects);

}




function addItemToHabitat(itemID) {
  if (!editing) {
    showAlert("Whoops!  You're not in decorate mode o.O\nHow'd you do that???", RED);
    return;
  }

  // console.log("about to add:", inventoryObjects["item_" + itemID]);
  // console.log(inventoryObjects["item_" + itemID]);
  var io = inventoryObjects["item_" + itemID];
  if (io.type == 'habitat' && io.rooms != habitatItem.rooms) {
    swal({
      title:"Are you sure?",
      text:"If you change to a habitat with a different number of rooms, it may put all of your placed items back in your inventory.\nMaybe you want to store your habitat instead of just swapping it?",
      closeOnConfirm:true,
      closeOnCancel:true,
      showCancelButton:true,
      confirmButtonText:"Yep, I'm sure",
      cancelButtonText:"Whoops!  Lemme think about that.",
      type:"warning"
    }, function(isConfirm) {
      if (isConfirm) {
        finishAddItem(itemID);
        if (io.rooms < habitatItem.rooms) centerPal();
      }
    });
  } else {
    finishAddItem(itemID);
  }
}
function finishAddItem(itemID) {
  // console.log("addItemToHabitat: " + itemID);
  if (cItem != null) cItem.deactivate();
  //grab item from database and send it to processing
  inventoryQuery({id:itemID, pid:playerID, hid:habitatID}, processAddedItem, "inventory_item_to_habby");
}
function processAddedItem(o) {
  var item = new Item(o[0]);
  item.init(false);
  cItem = item;
}

function emptyHabitat() {
  swal({
    title:"Are you sure?",
    text:"Emptying your habitat will put all of your items (except for your Pal) back into your inventory",
    closeOnConfirm:true,
    closeOnCancel:true,
    showCancelButton:true,
    confirmButtonText:"Yep, I'm sure",
    cancelButtonText:"Whoa! Nuh-uh! I was kidding!",
    type:"warning"
  }, function(isConfirm) {
    if (isConfirm) confirmEmptyHabitat();
  });
}
function confirmEmptyHabitat() {
  console.log("Clearing Habby 'n' stuff");
  var p;
  while (zArray.length > 0) {
    var item = zArray.pop();
    if (item.type == 'pet') {
      item.z = 0;
      item.commitTemp();
      p = item;
    } else {
      item.toInventory(false);
    }
  }
  zArray.push(p);
  sortLayers();
}

function removeItemFromHabitat() {
  if (cItem == null) return;
  cItem.toInventory();
}

function showMask(id) {
  if ($("#" + id + "_mask") == undefined) return;
  $("#" + id + "_mask").show();
}
function hideMask(id) {
  if ($("#" + id + "_mask") == undefined) return;
  $("#" + id + "_mask").hide();
}
function updateInventory(id) {  //just the display portion
  // console.log("updateInventory: ", id, inventoryObjects);
  if ($("#inv_item_" + id + "_available").attr('id') == undefined) return;
  $("#inv_item_" + id + "_available").html(inventoryObjects["item_" + id].available);
  if (inventoryObjects["item_" + id].available > 0) {
    hideMask("inv_item_" + id);
  } else {
    showMask("inv_item_" + id);
  }
}
