var preparedSearch = INVENTORY;

var inventoryObjects = [];  //assoc array of item data objects
var binList = [];

var rGoldValue = 0;
var rSilverValue = 0;

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
    if (rowcount == 0) $("#itemBlocks").empty().append("<center>Uh oh!  We didn't find anything matching your search!<br />Maybe check your spelling, or try a different category.</center>");
  } else { return; }
  invItems = ob.items;

  $("#itemBlocks").empty();
  for (var i = 0; i < invItems.length; i++) {
    var item = invItems[i];
    inventoryObjects["item_" + item.item_id] = item; //put it into the data array for use

    $("#itemBlocks").append(new ItemBlock(item).display);
  }
  // console.log("Inventory Objects:\n\t", inventoryObjects);
  return;

  $("#itemBlocks").empty();
  for (var i = 0; i < invItems.length; i++) {
    var item = invItems[i];
    inventoryObjects["item_" + item.item_id] = item; //put it into the data array for use

    $("#itemBlocks").append(new ItemBlock(item).display);


  }
}



function buildBinItem(itemID, itemOB) {
  console.log("buildBinItem::", itemID, itemOB);
  itemOB = itemOB.item;
  if ($("#binItem_" + itemID).attr('id') == undefined) {
    //build it
    if (binList.length == 1) $("#binBlocks").empty();
    var node = $("<li/>", {
      "id":"binItem_" + itemID,
      "class":"item_block gridItem"
    });
    var imgCon = $("<div/>", {
          "class": "item_block_image_container",
          "id": "glic_" + itemOB.id,
          "title": "Remove Item From Recyclotron",
          "onclick": "removeItemFromBin(" +itemID+ ")",
          "style": "cursor:copy"
        });
    if (itemOB.is_sprite == 1) {
      var image = new Sprite({id:"spr_" + itemOB.id, framecount:itemOB.frame_count, src:itemOB.src, width:itemOB.frame_width, height:itemOB.frame_height});
      if (image.init()) {
        image.setClass("centerHV");
        image.appendTo(imgCon);
        image.max(140, 140);
        image.start();
      }
    } else if (itemOB.is_effect == 1) {
      var image = '';
      paramQuery({target:"glic_" + itemOB.id, effectID:itemOB.effect_id}, loadEffectPreview, 'fetch_effect');
    } else {
      var image = $("<img />", {
        "src": itemOB.src,
        "class": "item_block_image centerHV"
      });
    }
    var info = $("<div/>", {"style":"text-align:center; width:100%;"})
        .html("<strong>" + itemOB.name + "<br />");//How Many: <span id=\"binItem_" + itemOB.item_id + "_number\">" + itemOB.available + "</span></strong><br />");
    var infoButtons = $("<ul/>", {class:"smooth_btn_container", style:"width:150px; padding:0px; margin-top:0px;"});

    //'&#x25B2;''&#x25BC;'
    infoButtons.append($("<li/>", {
      title:"Fewer",
      class:"collapsed left min shiny",
      style:"width:15px",
      onclick:"changeNumber('"+itemID+"', 'less', this);"
    }).html('&#x25BC;'));
    infoButtons.append($("<li/>", {
      id:"binItemCount_" + itemID,
      class:"collapsed min shiny",
      style:"width:20px"
    }).html('1'));
    infoButtons.append($("<li/>", {
      id:itemID + "more",
      title:"More",
      class:"collapsed right min shiny",
      style:"width:15px",
      onclick:"changeNumber('"+itemID+"', 'more', this);"
    }).html('&#x25B2;'));

    info.append(infoButtons);

    imgCon.append(image);
    node.append(imgCon);
    node.append(info);
    $("#binBlocks").append(node);
  } else {
    var c = $("#binItemCount_" + itemID);
    var n = Number(c.html())*1 + 1;
    c.html(n);
  }
}

function changeNumber(itemID, dir) {
  if (dir == 'more') {
    if ($('#' + itemID + "more").hasClass('disabled')) { popNotify("You have no more of that item available"); } else {
      addItemToBin(itemID);
    }
  } else if (dir == 'less') {
    //check to see if we're going to hit zero
    var c = $("#binItemCount_" + itemID);
    if (c.html() == 1) {
      swal({
        title:"Remove Item From Recyclotron?",
        text:"If you have more than one of these in the Recyclotron package\nit will remove all of them.\nAre you sure?",
        showCancelButton:true,
        confirmButtonText:"Yep.  Do it",
        cancelButtonText:"Oops! Nope",
        closeOnCancel:true,
        closeOnConfirm:true
      }, function (conf) { if (conf) { removeBinStack(itemID); } });
    } else {
      //find it in the binList and put it back into the inventory
      for (var i=0; i < binList.length; i++) {
        if (binList[i] == itemID) {
          var item = binList.splice(i, 1);
          var iOb = inventoryObjects["item_" + itemID];
          console.log(iOb);
          iOb.available++;
          updateTotals({silver:iOb.item.silver * -1, gold:iOb.item.gold * -1});
          var n = Number(c.html())*1 - 1;
          c.html(n);
          updateInventory(itemID);
          $('#' + itemID + "more").removeClass('disabled');
          return;
        }
      }
      console.error(itemID + " not found in binList", binList);
    }

  } else {
    //actually setting the number?
  }
}

function addItemToBin(itemID) {
  var iOb = inventoryObjects["item_" + itemID];
  if (iOb.item.silver == 0 && iOb.item.gold == 0) {
    popNotify("Whoops! Looks like that item does not have a market value");
    return;
  }

  updateTotals({silver:iOb.item.silver, gold:iOb.item.gold});
  iOb.available--;
  binList.push(Number(itemID));
  buildBinItem(itemID, iOb);
  if (iOb.available == 0) {
    $("#"+itemID + "more").addClass("disabled");
  }
  updateInventory(itemID);
  // console.log("binList", binList);
}
function removeItemFromBin(itemID) {
  // console.log("removeItem ", itemID);
  swal({
    title:"Remove Item From Recyclotron?",
    text:"If you have more than one of these in the Recyclotron\nit will remove all of them.\nAre you sure?",
    showCancelButton:true,
    confirmButtonText:"Yep.  Do it",
    cancelButtonText:"Oops! Nope",
    closeOnCancel:true,
    closeOnConfirm:true
  }, function (conf) { if (conf) { removeBinStack(itemID); } });
}
function removeBinStack(itemID) {
  // console.log("removeStack", itemID, binList);
  var length = binList.length;
  for (var i=binList.length-1; i > -1; i--) {
    if (binList[i] == itemID) {
      var item = binList.splice(i, 1);
      var iOb = inventoryObjects["item_" + itemID];
      // console.log(iOb);
      iOb.available++;
      updateTotals({silver:iOb.item.silver * -1, gold:iOb.item.gold * -1});
    }
  }
  updateInventory(itemID);
  $("#binItem_" + itemID).remove();
  if (binList.length == 0) {
    $("#binBlocks").append($("<li/>").html("Click on items in your inventory to add them to the Recyclotron"));
  }
}

function updateTotals(ob) {
  if (ob.silver != undefined) {
    rSilverValue = rSilverValue + Number(ob.silver /2);
  }
  if (ob.gold != undefined) {
    rGoldValue = rGoldValue + Number(ob.gold /2);
  }

  $("#rSilverDisplay").html(rSilverValue);
  $("#rGoldDisplay").html(rGoldValue);
}

function showMask(id) { if ($("#" + id + "_mask") == undefined) return; $("#" + id + "_mask").show(); }
function hideMask(id) { if ($("#" + id + "_mask") == undefined) return; $("#" + id + "_mask").hide(); }
function updateInventory(id) {  //just the display portion
  if ($("#inv_item_" + id + "_available").attr('id') == undefined) return;
  $("#inv_item_" + id + "_available").html(inventoryObjects["item_" + id].available);
  if (inventoryObjects["item_" + id].available > 0) {
    hideMask("inv_item_" + id);
  } else {
    showMask("inv_item_" + id);
  }
}


function processBin() {
  if (rGoldValue < 1 && rSilverValue < 1) {
    popNotify("You cannot recycle only single items that have a value of less than 1 Coin", 'error');
    return;
  }

  var gVal = Math.ceil(rGoldValue);
  var sVal = Math.ceil(rSilverValue);

  swal({
    title:"Just checking",
    text:'Are you sure you want to recycle all of this?<br />You\'ll get '+sVal+'<img src="assets/site/coin-silver.png" /> and '+gVal+'<img src="assets/site/coin-gold.png" />, but once you recycle the items, they\'re gone forever!',
    html:true,
    showCancelButton:true,
    closeOnCancel:true,
    closeOnConfirm:false,
    confirmButtonText:"Absolutely!",
    cancelButtonText:"Maybe not..."
  },
  function(conf) {
    if (conf) {
      var gVal = Math.ceil(rGoldValue);
      var sVal = Math.ceil(rSilverValue);
      inventoryQuery({pid:playerID, items:binList}, confirmRecycled, 'recycle');
    }
  })
}

function confirmRecycled(r) {
  if (r != 'success') {
    console.error("Failed to recycle", r);
    // showAlert("The Recyclotron broke...", RED);
    popNotify(r, "error");
  } else {
    swal({
      title:"Items recycled!",
      closeOnConfirm:true,
      type:'success',
      confirmButtonText:"Awesome! Thanks!",
      timer:6000
    })
    var gVal = Math.ceil(rGoldValue);
    var sVal = Math.ceil(rSilverValue);
    givePlayerMoney(playerID, {silver:sVal});
    givePlayerMoney(playerID, {gold:gVal});
    rSilverValue = 0;
    rGoldValue = 0;
    binList = [];
    $("#binBlocks").empty();
    $("#binBlocks").append($("<li/>").html("Click on items in your inventory to add them to the Recyclotron"));
    $("#rGoldDisplay").html('0');
    $("#rSilverDisplay").html('0');
  }
}
