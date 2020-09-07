var preparedSearch = INVENTORY;

var inventoryObjects = [];  //assoc array of item data objects
var giftList = [];
var giftObjects = [];

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


//TODO: refactor in ob.item changeover


function buildGiftItem(itemID, itemOB) {
  console.log("buildGiftItem::", itemID, itemOB);
  if ($("#giftItem_" + itemID).attr('id') == undefined) {
    //build it
    if (giftList.length == 1) $("#giftBlocks").empty();
    var node = $("<li/>", {
      "id":"giftItem_" + itemID,
      "class":"item_block gridItem"
    });
    var imgCon = $("<div/>", {
          "class": "item_block_image_container",
          "id": "glic_" + itemOB.id,
          "title": "Remove Item From Trade",
          "onclick": "removeItemFromGift(" +itemID+ ")",
          "style": "cursor:copy"
        });
    if (itemOB.item.is_sprite == 1) {
      var image = new Sprite({id:"gift_" + itemOB.item_id, framecount:itemOB.item.frame_count, src:itemOB.item.src, width:itemOB.item.frame_width, height:itemOB.item.frame_height});
      if (image.init()) {
        image.setClass("centerHV");
        image.appendTo(imgCon);
        image.max(140, 140);
        image.start();
      }
    } else if (itemOB.item.is_effect == 1) {
      var image = '';
      paramQuery({target:"glic_" + itemOB.item_id, effectID:itemOB.item.effect_id}, loadEffectPreview, 'fetch_effect');
    } else {
      var image = $("<img />", {
        "src": itemOB.item.src,
        "class": "item_block_image centerHV"
      });
    }
    var info = $("<div/>", {"style":"text-align:center; width:100%;"})
        .html("<strong>" + itemOB.item.name + "<br />");//How Many: <span id=\"giftItem_" + itemOB.item_id + "_number\">" + itemOB.available + "</span></strong><br />");
    var infoButtons = $("<ul/>", {class:"smooth_btn_container", style:"width:150px; padding:0px; margin-top:0px;"});

    //'&#x25B2;''&#x25BC;'
    infoButtons.append($("<li/>", {
      title:"Fewer",
      class:"collapsed left min shiny",
      style:"width:15px; user-select:none",
      onclick:"changeNumber('"+itemOB.item_id+"', 'less', this);"
    }).html('&#x25BC;'));
    infoButtons.append($("<li/>", {
      id:"giftItemCount_" + itemOB.item_id,
      class:"collapsed min shiny",
      style:"width:20px; user-select:none"
    }).html('1'));
    infoButtons.append($("<li/>", {
      id:itemOB.item_id + "more",
      title:"More",
      class:"collapsed right min shiny",
      style:"width:15px; user-select:none",
      onclick:"changeNumber('"+itemOB.item_id+"', 'more', this);"
    }).html('&#x25B2;'));

    infoButtons.append('<br />');

    info.append(infoButtons);

    imgCon.append(image);
    node.append(imgCon);
    node.append(info);
    $("#giftBlocks").append(node);
  } else {
    var c = $("#giftItemCount_" + itemOB.item_id);
    var n = Number(c.html())*1 + 1;
    c.html(n);
  }
}

function changeNumber(itemID, dir) {
  if (dir == 'more') {
    if ($('#' + itemID + "more").hasClass('disabled')) { popNotify("You have no more of that item available"); } else {
      addItemToGift(itemID);
    }
  } else if (dir == 'less') {
    //check to see if we're going to hit zero
    var c = $("#giftItemCount_" + itemID);
    if (c.html() == 1) {
      swal({
        title:"Remove Item From Gift?",
        text:"If you have more than one of these in this gift package\nit will remove all of them.\nAre you sure?",
        showCancelButton:true,
        confirmButtonText:"Yep.  Do it",
        cancelButtonText:"Oops! Nope",
        closeOnCancel:true,
        closeOnConfirm:true
      }, function (conf) { if (conf) { removeGiftStack(itemID); } });
    } else {
      //find it in the giftList and put it back into the inventory
      for (var i=0; i < giftList.length; i++) {
        // if (giftList[i].itemID == itemID) {
        if (giftList[i] == itemID) {
          var gift = giftList.splice(i, 1);
          // inventoryObjects["item_" + itemID].ids.push(gift[0].invID);
          inventoryObjects["item_" + itemID].available++;
          var n = Number(c.html())*1 - 1;
          c.html(n);
          updateInventory(itemID);
          $('#' + itemID + "more").removeClass('disabled');
          return;
        }
      }
      console.error(itemID + " not found in giftList", giftList);
    }

  } else {
    //actually setting the number?
  }
}

function addItemToGift(itemID) {
  // var inventoryID = inventoryObjects["item_" + itemID].ids.pop();
  // giftList.push({invID:Number(inventoryID), itemID:Number(itemID)});
  giftList.push(Number(itemID));
  buildGiftItem(itemID, inventoryObjects["item_" + itemID]);
  // if (inventoryObjects["item_" + itemID].ids.length == 0) {
  inventoryObjects["item_" + itemID].available--;
  if (inventoryObjects["item_" + itemID].available == 0) {
    $("#"+itemID + "more").addClass("disabled");
  }
  updateInventory(itemID);
  // console.log("giftList", giftList);
}
function removeItemFromGift(itemID) {
  swal({
    title:"Remove Item From Gift?",
    text:"If you have more than one of these in this gift package\nit will remove all of them.\nAre you sure?",
    showCancelButton:true,
    confirmButtonText:"Yep.  Do it",
    cancelButtonText:"Oops! Nope",
    closeOnCancel:true,
    closeOnConfirm:true
  }, function (conf) { if (conf) { removeGiftStack(itemID); } });
}
function removeGiftStack(itemID) {
  // console.log("removeStack", giftList);
  var length = giftList.length;
  for (var i=giftList.length-1; i > -1; i--) {
    // if (giftList[i].itemID == itemID) {
    if (giftList[i] == itemID) {
      var gift = giftList.splice(i, 1);
      // inventoryObjects["item_" + itemID].ids.push(gift[0].invID);
      inventoryObjects["item_" + itemID].available++;
    }
  }
  updateInventory(itemID);
  $("#giftItem_" + itemID).remove();
  if (giftList.length == 0) {
    $("#giftBlocks").append($("<li/>").html("Click on items in your inventory to add them to the gift package"));
  }
}

function showMask(id) { if ($("#" + id + "_mask") == undefined) return; $("#" + id + "_mask").show(); }
function hideMask(id) { if ($("#" + id + "_mask") == undefined) return; $("#" + id + "_mask").hide(); }
function updateInventory(id) {  //just the display portion
  if ($("#inv_item_" + id + "_available").attr('id') == undefined) return;
  // console.log("UI", inventoryObjects["item_" + id].ids);
  // $("#inv_item_" + id + "_available").html(inventoryObjects["item_" + id].ids.length);
  $("#inv_item_" + id + "_available").html(inventoryObjects["item_" + id].available);
  // if (inventoryObjects["item_" + id].ids.length > 0) {
  console.log(inventoryObjects["item_" + id].available);
  if (inventoryObjects["item_" + id].available > 0) {
    hideMask("inv_item_" + id);
  } else {
    showMask("inv_item_" + id);
  }
}


function sendGift() {
  var gVal = $("#giftGold").val() || 0;
  var sVal = $("#giftSilver").val() || 0;
  var pGold = Number($("#playerGold").html());
  var pSilver = Number($("#playerSilver").html());
  var msg = $("#giftMessage").val();
  if (gVal < 0 || sVal < 0) {
    swal({
      title:"Invalid Coin amount",
      text:"You cannot send negative coins",
      closeOnConfirm:true,
      confirmButtonText:"I'll fix that"
    })
  } else if (gVal > pGold || sVal > pSilver) {
    swal({
      title:"Whoa there, Moneybags!",
      text:"You don't have that many Coins to send",
      closeOnConfirm:true,
      confirmButtonText:"I'll fix that"
    })
  } else {
    swal({
      title:"Just checking",
      text:"Are you sure you want to send all of this\nto " + rname + "?",
      showCancelButton:true,
      closeOnCancel:true,
      closeOnConfirm:false,
      confirmButtonText:"Absolutely!",
      cancelButtonText:"Maybe not..."
    },
    function(conf) {
      if (conf) {
        console.log(conf);
        $("#sgButton").attr('onclick', '#');
        giftQuery({pid:playerID, rid:rid, gold:gVal, silver:sVal, message:encodeURIComponent(msg), sender:playerUsername, gifts:giftList}, confirmGifted, 'send_gift');
      }
    })
  }
}

function confirmGifted(r) {
  $("#sgButton").attr('onclick', 'sendGift()');
  if (r != 'success') {
    console.error("Failed to send gift", r);
    // showAlert("Something went wrong...", RED);
    popNotify(r, "error");
  } else {
    swal({
      title:"Gift Package Sent!",
      closeOnConfirm:true,
      type:'success',
      confirmButtonText:"Awesome! Thanks!",
      timer:6000
    })
    var gVal = $("#giftGold").val() || 0;
    var sVal = $("#giftSilver").val() || 0;
    sVal = sVal * -1;
    gVal = gVal * -1;
    givePlayerMoney(playerID, {silver:sVal});
    givePlayerMoney(playerID, {gold:gVal});
    giftList = [];
    $("#giftBlocks").empty();
    $("#giftBlocks").append($("<li/>").html("Click on items in your inventory to add them to the gift package"));
    $("#giftGold").val('');
    $("#giftSilver").val('');
    $("#giftMessage").val('');
  }
}
