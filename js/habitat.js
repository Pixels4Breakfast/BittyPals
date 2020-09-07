var NEWHAB = 'create_new_hab';
var SWAPHAB = 'swap_habitat';
var GETAVAILABEHABS = 'get_available_habitats';
var ACCEPTGIFT = 'accept_gift';

var GIFTBOX = 'random_gift';
var MONEYBAG = 'money_bag';
var ITEMPACK = 'item_pack';
var PETSWAP = 'pet_swap_token';

var fxList = [];

function hideAndShow(h, s) {
  $("#"+h).fadeTo("100", 0, function() {
    $("#"+h).css("visibility", "hidden");
    $("#"+s).css("visibility", "visible");
    $("#"+s).fadeTo("100", 1);
  });
}

function itemInteraction(baseId, onActivate, src) {
  var type = onActivate.split(":")[0];
  switch(type){
    case "changeusername":
    swal({
        title: "Change Username",
        text: "This item will change your username.<br />BE AWARE that you will have to either sign in with your email <br />address or your new username after changing it.",
        imageUrl: src,
        html: true,
        animation: "slide-from-top",
        showCancelButton: true,
        confirmButtonColor: "#acc6ef",
        confirmButtonText: "Change Username",
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true
      },
      function(isConfirm){
        if (isConfirm) {
          //this is where it gets wonky...
          var iid = inventoryObjects["item_" + baseId].item_id;  //send this for deletion
          updateInventory(baseId);  //and we'll probably rebuild the inventory after this is all said and done...
          var gParams = onActivate.split(":");
          openChangeUsername(baseId);
        }
      }
    );
    break;
    case "gift":
      swal({
          title: "You can open this gift!",
          text: "What's inside?  We don't know!  If you decide to open it, you'll get to keep whatever's<br /> inside, but you'll lose the gift box.<br />Do you want to open it?",
          imageUrl: src,
          html: true,
          animation: "slide-from-top",
          showCancelButton: true,
          confirmButtonColor: "#acc6ef",
          confirmButtonText: "Yes, open it!",
          cancelButtonText: "No, I want to keep the pretty box!",
          closeOnConfirm: false,
          closeOnCancel: true
        },
        function(isConfirm){
          if (isConfirm) {
            //this is where it gets wonky...
            var iid = inventoryObjects["item_" + baseId].item_id;  //send this for deletion
            updateInventory(baseId);  //and we'll probably rebuild the inventory after this is all said and done...
            var gParams = onActivate.split(":");
            paramQuery({pid:playerID, max:gParams[1], coin:gParams[2], extra:gParams[3], itemID:iid}, giftResult, GIFTBOX);
          }
        }
      );
    break;
    case "moneybag":
      var gParams = onActivate.split(":");
      var capCoin = gParams[1][0].toUpperCase() + gParams[1].substring(1);
      swal({
          title: "Cash this in?",
          text: "If you open this, you will get " + gParams[2] + " " + capCoin + " Coins\nbut you will lose the item.\nAre you sure?",
          imageUrl: src,
          html: true,
          animation: "slide-from-top",
          showCancelButton: true,
          confirmButtonColor: "#acc6ef",
          confirmButtonText: "Yes, open it!",
          cancelButtonText: "Not right now",
          closeOnConfirm: false,
          closeOnCancel: true
        },
        function(isConfirm){
          if (isConfirm) {
            var iid = inventoryObjects["item_" + baseId].item_id;  //send this for deletion
            updateInventory(baseId);  //and we'll probably rebuild the inventory after this is all said and done...
            paramQuery({pid:playerID, coin:gParams[1], amount:gParams[2], itemID:iid}, moneyBagResult, MONEYBAG);
          }
        }
      );
    break;
    case "transmog":
      swal({
          title: "Pal Transmogrification",
          text: "Drinking this enchanted elixer will allow your Pal to transform into<br />a Pal of another type, along with changing their name.<br />This action cannot be reveresed, except with another<br />Potion of Transmogrification.  Your Pal will keep their Level and XP.<br /><br />Are you sure you want your Pal to drink it?",
          imageUrl: src,
          html: true,
          animation: "slide-from-top",
          showCancelButton: true,
          confirmButtonColor: "#acc6ef",
          confirmButtonText: "Yes, drink it!",
          cancelButtonText: "Wait! I changed my mind!",
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm){
          if (isConfirm) {
            var gid = inventoryObjects["item_" + baseId].item_id;  //pass this on for deletion
            updateInventory(baseId);
            openTransmog(baseId);
          }
        }
      );

    break;
    default:
      console.log("Broken interaction: ", arguments);
    break;
  }
}

function unpackItem(baseId, list, src) {
  // console.log("opening item pack", baseId, list, src);
  swal({
      title: "You can unpack this item!",
      text: "There's a whole bunch of stuff in here...",
      imageUrl: src,
      html: true,
      animation: "slide-from-top",
      showCancelButton: true,
      confirmButtonColor: "#acc6ef",
      confirmButtonText: "Yes, open it!",
      cancelButtonText: "No, I want to keep the packaging!",
      closeOnConfirm: true,
      closeOnCancel: true
    },
    function(isConfirm){
      if (isConfirm) {
        //this is where it gets wonky...
        var packID = inventoryObjects["item_" + baseId].item_id;
        updateInventory(baseId);  //and we'll probably rebuild the inventory after this is all said and done...
        var pList = list.split(",");
        var pObs = [];
        for (var i=0; i<pList.length; i++) {
          var thing = pList[i].split(":");
          pObs.push({id:thing[0], count:thing[1]});
        }
        paramQuery({pid:playerID, itemID:packID, packList:pObs}, packResult, ITEMPACK);
      }
    }
  );
}

function giftResult(response) {
  // console.log(response);

  if (response == "noitem") {
    swal({
      title:"Whoops!",
      html:true,
      text:"It looks like that item you just opened doesn't exist!<br />This is likely caused by opening the last of this item in another browser tab.",
      closeOnConfirm:true
    })
  } else {
    swal({
      title:"You got a " + response['name'] + "!",
      imageUrl:response['src'],
      confirmButtonColor: "#acc6ef",
      confirmButtonText: "Awesome!",
      closeOnConfirm:true
    })
  }

  searchInventory(false);
}

function moneyBagResult(r) {
  // if (r != 'success') console.log(r);
  var capCoin = r.coin[0].toUpperCase() + r.coin.substring(1);
  if (r.coin == 'gold') givePlayerMoney(playerID, {gold:r.amount}); else givePlayerMoney(playerID, {silver:r.amount});
  swal({
    title:"You got " + r.amount + " " + capCoin + " Coins!",
    imageUrl:r.src,
    confirmButtonColor: "#acc6ef",
    confirmButtonText: "Thanks!",
    closeOnConfirm:true
  })
  searchInventory(false);
}

function packResult(r) {
  // if (r != 'success') console.log(r);
  swal({
    title:"You got stuff!",
    text:"The unpacked items have been added to your inventory",
    confirmButtonColor: "#acc6ef",
    confirmButtonText: "Thanks!",
    closeOnConfirm:true
  })
  searchInventory(false);
}



var itemToDelete;
function openTransmog(itemID) {
  var pob = petOb;
  itemToDelete = {itemID:itemID};
  paramQuery({select:["id","name","src","description"], table:"item", where:"type='pet'"}, loadTransmog);
}
function loadTransmog(r) {
  // console.log(r);
  var frames = [];
  for (var i=0; i<r.length; i++) frames.push(r[i]);
  var tPane = new ScrollPane({
    title:"Choose Transmogrification Result",
    onConfirm:confirmTransmog,
    onCancel:cancelTransmog,
    confirmButtonText:"Transmogrify Pal",
    cancelButtonText:"Wait! I changed my mind!",
    frames:frames,
    frameHeight:200,
    frameWidth:180,
    height:300,
    width:600
  });
}

var transmogID;
function confirmTransmog(newPalID) {
  // console.log("confirmTransmog", newPalID);
  var pal = petOb;
  if (pal.item_id != newPalID) {
    //do stuff
    transmogID = newPalID;
    var nameChange = new TextInput({
      title:"Change Pal's Name",
      value:pal.name,
      onConfirm:confirmTransmogName,
      onCancel:cancelTransmog,
      confirmButtonText:"Change Name",
      cancelButtonText:"Cancel"
    })
  } else {
    inventoryObjects["item_" + itemToDelete.itemID].available++;
    updateInventory(itemToDelete.itemID);
    itemToDelete = undefined;
  }
}
function cancelTransmog() {
  // console.log("cancelTransmog");
  inventoryObjects["item_" + itemToDelete.itemID].available++;
  updateInventory(itemToDelete.itemID);
  itemToDelete = undefined;
}
function confirmTransmogName(name) {
  // console.log("confirmTransMogName", name, transmogID);
  //this is where the magic happens...well, okay, no, not really.  This is where we call the magic, and it happens somewhere else -.-
  inventoryObjects["item_" + itemToDelete.itemID].available--;
  updateInventory(itemToDelete.itemID);
  paramQuery({pid:playerID, petID:petOb.id, invID:petOb.inv_id, newItemID:transmogID, name:name, delete:itemToDelete.itemID}, verifyTransmog, 'mod_pal');
}
function verifyTransmog(r) {
  // console.log(r);
  var pal = getItemById("item_" + r.invID);
  // console.log("pal: ", pal);
  petOb.name = r.name;
  petOb.item_id = r.itemID;
  pal.image.attr('src', r.src);
  pal.hr = 0;
  pal.src = r.src;
  pal.clearPalette();
  if (r.palette == 1) pal.createPalette();

}


function renameHabby() {
  //habitatID
  paramQuery({select:['name'], table:'habitat', where:'id=' + habitatID}, showHabbyRename);
}
function showHabbyRename(r) {
  // console.log(r[0].name);
  var nameChange = new TextInput({
    title:"Change Habitat Name",
    value:r[0].name,
    onConfirm:confirmHabbyName,
    onCancel:function(){},
    confirmButtonText:"Change Name",
    cancelButtonText:"Cancel"
  })
}
function confirmHabbyName(name) {
  // console.log("confirming: ", name);
  if (name == '') name = "Unnamed";
  name = sanitize(name);
  paramQuery({query:"UPDATE habitat SET name = '" + name + "' WHERE id = " + habitatID}, habbyRenamed, 'string');
}
function habbyRenamed(r) {
  console.log("habby Renamed", r);
}

function openChangeUsername(itemID) {
  itemToDelete = {itemID:itemID};
  var unChange = new TextInput({
    title:"Change Username",
    value:playerUsername,
    onConfirm:confirmUsernameChange,
    onCancel:cancelUsernameChange,
    confirmButtonText:"Change Name",
    cancelButtonText:"Cancel"
  })
}
function confirmUsernameChange(name) {
  if (name == '') { popNotify("You can't not have a name, silly.", "error"); return; }
  paramQuery({pid:playerID, newName:name}, verifyUsernameChange, "username_change");
}
function verifyUsernameChange(r) {
  if (r.status == 'success') {
    inventoryObjects["item_" + itemToDelete.itemID].available--;
    updateInventory(itemToDelete.itemID);
    itemToDelete = undefined;
  } else if (r.status == "error") {
    console.error("ERROR::username_change", r.message);
    popNotify("WHOOPS!<br />"+r.message, "error");
    openChangeUsername(itemToDelete);
  } else {
    //unknown error
    popNotify("Unknown error", "error");
    console.log(r);
    openChangeUsername(itemToDelete);
  }
}
function cancelUsernameChange() {
  console.log("itemToDelete", itemToDelete);
  inventoryObjects["item_" + itemToDelete.itemID].available++;
  updateInventory(itemToDelete.itemID);
  itemToDelete = undefined;
}




function playOtherPet() {
  paramQuery({pid:playerID, fid:petOb.pid}, verifyPlayOtherPet, "can_play");
}
function verifyPlayOtherPet(r) {
  if (r == 'valid') {
    disablePlayOther();
    givePetXP(petID, 10, true);
    givePlayerXP(playerID, 10);
    givePlayerMoney(playerID, {silver:10});
    popNotify("Whee!<br /><strong>" + petOb.name + '</strong> has earned 10 XP<br />You have earned 10 XP<br />You have earned 10 <img src="assets/site/coin-silver.png" />');
  } else {
    popNotify("You have already played with " + petOb.name + " today.<br />Come back tomorrow!");
  }
}







var selectedHabitat;
var habs;
var nhPos = 0;
var nhMin = 0;
function startNewHabitat() {
  //get available habitatas
  paramQuery({pid:playerID}, loadAvailableHabs, GETAVAILABEHABS);
}
function loadAvailableHabs(r) {
  //open pane and check for available habitats
  // console.log(r);
  habs = r;
  if (r.length == 0) {
    swal({
      title:"Oops!",
      text:'You don\'t have any available habitats to start a new one with!<br />You can buy new habitats in the <a href="market">Marketplace</a>',
      html:true,
      closeOnConfirm:true,
      confirmButtonText:"Okay"
    })
  } else {
    $("#utilityPane").addClass("mask");
    $("#utilityPane").on('click', closeNewHabitatPane);
    var nhp = $("<div/>",{id:"nhp"});
    nhp.addClass("new_hab_pane");
    nhp.addClass("centerHV");
    var header = $("<div/>", { //header
      style:"width:100%; text-align:center; font-size:1.4em; height:75px; background-color:white; border-top-left-radius:15px;border-top-right-radius:15px; box-shadow:0px 4px 8px #333333;"
    });
    header.append($("<button />", { //close button
      style:"position:relative; float:right; margin-right:5px; margin-top:5px;",
      class:"close_button_sprite",
      onclick:"closeNewHabitatPane()",
      title:"Close"
    }));
    header.append("Select a New Habitat");
    nhp.append(header);


    //now to the fun stuff...
    var con = $("<div/>", { class:"container" });
    con.append($("<div/>", { id:"lArrow", class:"arrow left disabled", style:"border-right:1px solid #acc6ef", onclick:"nhpScroll('left')", title:"Scroll Back"}).html("&#8678;"));  //replace with image

    var selector = $("<div/>", { class:"selector" });
    var pWidth = r.length * 230;
    nhMin = pWidth * -1 + 460;
    var previews = $("<ul/>", { id:"nhPreviews", class:"previews", style:"width:" + pWidth + "px" });

    for (var i=0; i<r.length; i++) {
      previews.append($("<li/>", { class:"hab", style:"background-image:url("+r[i].src+")", onclick:"selectHab("+i+", this)"}).html('<span class="h_name">'+r[i].name+'</span>'));
    }

    selector.append(previews);
    con.append(selector);

    con.append($("<div/>", { id:"rArrow", class:"arrow right", style:"border-left:1px solid #acc6ef", onclick:"nhpScroll('right')", title:"Scroll Forward"}).html("&#8680;"));  //replace with image
    var buttons = $("<div/>", { class:'smooth_btn_container buttons'});
      buttons.append($("<button/>", { class:"spaced solo shiny", style:"height:20px", onclick:"chooseNewHabitat()"}).html("OK"));
      buttons.append($("<button/>", { class:"spaced solo shiny", style:"height:20px; width:auto; color:red", onclick:"closeNewHabitatPane()"}).html("Cancel"));
    nhp.append(con);
    nhp.append(buttons);
    $('body').append(nhp);
    if (pWidth <= 460) $("#rArrow").addClass("disabled");
  }

}

function selectHab(index, li) {
  selectedHabitat = habs[index];
  console.log("selectedHabitat: ", selectedHabitat);
  $(".hab").each(function() { $(this).css('border', "1px solid #acc6ef"); });  //bad form, but it won't be getting used heavily...
  $(li).css("border", "1px solid blue");
}

function nhpScroll(dir) {
  var os = (dir == "left") ? 222 : -222;
  var newPos = nhPos*1 + os;
  if (newPos <= 0 && newPos > nhMin) {
    nhPos = newPos;
    $("#nhPreviews").animate({'left': newPos + "px"}, 200, 'swing');
  }
  //activate/deactivate arrows
  if (newPos*1 + 222 > 0) {
    $("#lArrow").addClass("disabled");
  } else { $("#lArrow").removeClass("disabled"); }
  if (newPos*1 - 222 < nhMin) {
    $("#rArrow").addClass("disabled");
  } else { $("#rArrow").removeClass("disabled"); }

}

function closeNewHabitatPane() {
  $("#utilityPane").removeClass("mask");
  $("#utilityPane").unbind('click');
  $("#nhp").empty();
  $("#nhp").remove();
}

function chooseNewHabitat(swap, hid) {
    // console.log("selectedHabitat",selectedHabitat);
    //now for the insanity...
    var qType = (swap == undefined) ? NEWHAB : SWAPHAB;
    swal({
      title:"Are you sure?",
      text:"This will put your current habitat into storage.\nYou will not be able to access the items that are used in this habitat\nunless you take it out of the Toy Box.",
      showCancelButton:true,
      closeOnConfirm:true,
      closeOnCancel:true,
      confirmButtonText:"Yep, I'm sure",
      cancelButtonText:"Wait, not yet"
    },
    function(conf) {
      if (conf) {
        // console.log("ConfirmNewHabitat >> habID: " + habitatID + ", petIID: " + petOb.inv_id + ", newHabID: " + hid);
        if (swap == undefined) {
          //Creating new habitat
          paramQuery({pid:playerID, petIID:petOb.inv_id, habID:habitatID, habSrc:selectedHabitat.src, habName:selectedHabitat.name, newHab:selectedHabitat.item_id, hid:selectedHabitat.hid}, verifyNewHab, qType);
        } else {
          //Swapping with ToyBox habitat
          paramQuery({pid:playerID, petIID:petOb.inv_id, habID:habitatID, hid:hid}, verifyNewHab, qType);
        }
      }
    })
}

function verifyNewHab(r) {
  if (r == 'success') {
    window.location = 'habitat';
  } else {
    console.error(r);  //shit done broke
  }
}


function openStorage() {
  // paramQuery({pid:playerID}, loadStorage, "fetch_storage");
  paramQuery({pid:playerID}, loadToybox, "fetch_storage");
}

function loadToybox(r) {
  // console.log("LoadToyBox:", r);
  if (r.length == 0) {
    swal({
      title:"Nothing in the Toy Box :(",
      text:"You don't have any saved habitats",
      closeOnConfirm:true
    })
  } else {
    habs = r;
    $("#utilityPane").addClass("mask");
    $("#utilityPane").on('click', closeNewHabitatPane);

    var frames = r;
    var tPane = new ScrollPane({
      title:"Choose Which Habby to Load",
      onConfirm:conToy,
      confirmButtonText:"Load Habby",
      cancelButtonText:"Cancel",
      showVarButton:true,
      varButtonText:"Delete",
      onVarButton:deleteHabitat,
      frames:frames,
      frameHeight:200,
      frameWidth:300,
      height:300,
      width:600
    });
  }
}

function conToy(hid) {
  chooseNewHabitat(true, hid);
}


function deleteHabitat(hid) {
  swal({
    title:"Are you sure?",
    text:"This will delete this habitat's settings and put all of the\nitems back into your inventory",
    type:'warning',
    closeOnCancel:true,
    closeOnConfirm:false,
    showCancelButton:true,
    confirmButtonText:"Yep.  Do it.",
    cancelButtonText:"Wait! No! Not that!"
  },
  function(conf) {
    if (conf) {
      paramQuery({pid:playerID, hid:hid}, onDeleteHab, 'delete_hab');
    }
  })
}

function onDeleteHab(r) {
  if (r == 'success') {
    searchInventory();
    selectedHabitat = undefined;
    habs = undefined;
    closeNewHabitatPane();
    swal({
      title:"Habitat Deleted",
      text:"All of the items in that habitat have been put back into your inventory",
      closeOnConfirm:true,
      type:'success'
    })
  }
}











                                                                                  //GIFTS

var gifts = [];
function openGifts() {
  // console.log("openGifts...");
  giftQuery({pid:playerID}, loadGifts, 'get_gifts');
}
function loadGifts(r) {
  // console.log("loadGifts", r);
  gifts = r;
  $("#utilityPane").addClass("mask");
  $("#utilityPane").on('click', closeGiftWindow);
  var m = $("#mailPane");
  m.addClass("gift_pane");
  m.addClass("centerHV");
  var header = $("<div/>", { //header
      style:"width:100%; text-align:center; font-size:1.4em; height:50px; background-color:white; border-top-left-radius:15px;border-top-right-radius:15px; box-shadow:0px 4px 8px #333333;"
    });
  header.append($("<button />", { //close button
    style:"position:relative; float:right; margin-right:5px; margin-top:5px;",
    class:"close_button_sprite",
    onclick:"closeGiftWindow()",
    title:"Close Gifts"
  }));
  header.append("Unopened Gifts");
  m.append(header);

  var con = $("<ul/>",{ id:"giftContent"});

  for (var i=0; i<r.length; i++) {
    var gb = $("<li/>", {
      id:"giftBox_" + r[i].id,
      class:"gift_box",
      title:"Open Gift",
      onclick:"acceptGift("+i+")"
    });
    var giftImage = $("<div/>", {class:"img"});
    var gisrc = 'gift.png';
    switch(r[i].type) {
      case 'level':
      case 'admin':
      case 'award':
      case 'store':
      case 'garden':
        gisrc = r[i].type + 'Gift.png';
      break;
      default: gisrc = 'gift.png';
    }
    // console.log("gift type: " + r[i].type + ", src: " + gisrc);
    giftImage.css("background-image", "url(assets/site/" + gisrc + ")");
    gb.append(giftImage);
    gb.append("<br />");
    gb.append($("<span/>",{class:"sender"}).html("From: " + r[i].sender));
    con.append(gb);
  }

  m.append(con);
}
function acceptGift(index) {
  var gift = gifts[index];
  // console.log("accepting", gift);
  var queryList = [];

  var gpp = showGiftListPane(gift.sender);
  var giftBlocks = $("<ul/>",{id:"giftBlocks", style:"overflow-y:scroll"});
  if (gift.gold != 0 || gift.silver != 0) {
    var coinBox = $("<div/>",{style:"width:100%; top:0px; height:75px; display:inline-block;text-align:left; font-size:2em;"});
    if (gift.gold != 0) {
      coinBox.append(gift.gold + '<img src="assets/site/coin-gold.png" style="display:inline-block; margin-left:20px;" />');
      givePlayerMoney(playerID, {gold:gift.gold});  //uncomment
    }
    if (gift.silver != 0) {
      coinBox.append(gift.silver + '<img src="assets/site/coin-silver.png" style="display:inline-block; margin-left:20px;" />');
      givePlayerMoney(playerID, {silver:gift.silver});  //uncomment
    }
    giftBlocks.append(coinBox);
  }


  var stacks = {};
  for (var i=0; i<gift.list.length; i++) {
    var thisGift = gift.list[i];
    var stacking = false;
    if (queryList.indexOf(thisGift.id) > -1) stacking = true;
    queryList.push(thisGift.id);
    if (stacking) {
      stacks[thisGift.id]++;
    } else {
      stacks[thisGift.id] = 1;
      var block = $("<li/>",{class:'gift'});
      block.append($("<span/>").html(thisGift.name + ' (<span id="giftStack_'+thisGift.id+'">1</span>)'));
      var imgCon = $("<div/>", {
        class: "item_block_image_container",
        cursor:'arrow'
      });
      if (thisGift.is_sprite == 0) {
        var image = $("<img />", {
          src: thisGift.src,
          class: "item_block_image centerHV"
        });
        imgCon.append(image);
      } else {
        var image = new Sprite({id:thisGift.id, framecount:thisGift.frame_count, src:thisGift.src, width:thisGift.frame_width, height:thisGift.frame_height});
        if (image.init()) {
          image.setClass("centerHV");
          image.appendTo(imgCon);
          image.max(140, 140);
          image.start();
        }
      }
      block.append(imgCon);
      giftBlocks.append(block);
    }
  }

  var thanks = '<div class="blue_button" style="padding:10px; border-radius:10px; position:relative;cursor:pointer; vertical-align:middle; text-align:center;" onclick="showMessagePrompt('+gift.sid+', \'Thank you for the gift!\')"> Send a Thank You Message to '+gift.sender+' </div>';
  gpp.append(thanks);
  var msg = '<div style="margin:10px;">' + gift.message + "</div>";
  gpp.append(msg);

  gpp.append(giftBlocks);

  gift.opened = true;
  $("#giftBox_" + gift.id).remove();
  // console.log("queryList", queryList);
  // console.log("stacks", stacks);
  for (var k in stacks) $("#giftStack_" + k).html(stacks[k]);
  giftQuery({pid:playerID, giftID:gift.id, items:queryList.join(',')}, verifyGiftsGotten, ACCEPTGIFT);  //uncomment
}

function verifyGiftsGotten(r) {
  // console.log(r);
}

function showGiftListPane(sender) {
  var gpp = $("<div/>",{id:"gpp"});
  gpp.addClass("gift_pane");
  gpp.addClass("centerHV");
  var header = $("<div/>", { //header
      style:"width:100%; text-align:center; font-size:1.4em; height:75px; background-color:white; border-top-left-radius:15px;border-top-right-radius:15px; box-shadow:0px 4px 8px #333333;"
    });
  header.append($("<button />", { //close button
    style:"position:relative; float:right; margin-right:5px; margin-top:5px;",
    class:"close_button_sprite",
    onclick:"closeGiftListPane()",
    title:"Close"
  }));
  header.append(sender + "'s Gift");
  header.append('<br /><span style="font-size:20px;">These items have been added to your inventory</span>');
  gpp.append(header);
  $('body').append(gpp);
  return gpp;
}
function closeGiftListPane() {
  $("#gpp").empty();
  $("#gpp").remove();
  var uoCount = 0;
  for (var i=0; i<gifts.length; i++) if (gifts[i].opened != true) uoCount++;
  if (uoCount == 0) $("#giftContent").append("You have no unopened gifts");
}

function closeGiftWindow() {
  $("#utilityPane").removeClass("mask");
  $("#utilityPane").unbind('click');
  $("#mailPane").removeAttr('class');
  $("#mailPane").empty();
  // console.log("closing", gifts);
  //if there are no more gifts...
  for (var i=gifts.length-1; i>-1; i--) { if (gifts[i].opened == true) { gifts.splice(i,1); } }
  if (gifts.length == 0) $("#giftNotify").hide();

  gifts = undefined;  //reset it for reinitialization
  searchInventory();
}







function setConstruction(cb) {
  var uc = ($(cb).is(':checked')) ? 1 : 0;
  paramQuery({update:'habitat', id:habitatID, values:{under_construction:uc}}, validateUnderConstruction);
}
function validateUnderConstruction(r) {
  if (r != 'success') console.error(r);
  var vis = $("#constructionCheckbox").is(":checked");
  var title = (!vis) ? "Grand Unveiling!" : "Habitat Under Wraps";
  var text = (!vis) ? "Your habitat is now visible to the public!" : "Your habitat is now hidden from everyone but you.\nTo unveil your habitat to the public, uncheck this box";
  var type = (!vis) ? 'success' : 'warning';
  swal({
    title:title,
    text:text,
    type:type,
    closeOnConfirm:true,
    confirmButtonText:"OK"
  })
}

function showQuoteEditor() {
  $("#centerCenter").off('click');
  var block = $("#centerCenter");
  //create quote form and set value to current quote
  var pQuote = block.html();
  pQuote = pQuote.replace(/<br>/g,"");  //stupid
  pQuote = pQuote.replace(/<br \/>/g,"");  //even stupider...
  var f = '<form onsubmit="saveQuote()">';
  f += '<textarea id="quoteText" style="width:90%;height:60px;" maxlength="200" title="There is a maximum of 200 characters that can fit here (or five lines of text)">'+pQuote+'</textarea></form>';
  f += '<button onclick="saveQuote()">Save</button><button onclick="hideQuoteEditor()">Cancel</button>';
  block.html(f);

}
function hideQuoteEditor() {
  var block = $("#centerCenter");
  loadQuote();
  enableQuote();
}
function saveQuote() {
  var qt = $("#quoteText").val();
  paramQuery({pid:playerID, quote:qt}, validateQuoteSaved, 'set_quote');
}
function validateQuoteSaved(r) {
  if (r == 'success') {
    hideQuoteEditor();
  } else {
    //err...something went wrong.  What the hell should I do with these errors?
  }
}
function loadQuote() {
  paramQuery({pid:playerOb.id}, displayQuote, 'get_quote');
}
function displayQuote(r) {
  if (r.quote == "") { r.quote = "No Current Quote"; }
  $("#centerCenter").html(r.quote);
}
function enableQuote() { setTimeout(function() {$("#centerCenter").on('click', showQuoteEditor)}, 300);} //this...is stupid

////////////////////////////////////////////////////////////////////////////////Room Controller
//At the moment, we're only allowing for a maximum of 4 rooms in different configurations.  This may be revisited in the future.

function initRoomController() {
  var hi = habitatItem;
  // console.log(hi);
  if (Number(hi.rooms) == 1) {
    disableRoomController();
    return;
  }
  switch(currentRoom) {
    case 1:
      if (hi.roomDir == 'hv') {
        toggleRoomArrows({u:0, d:1, r:1, l:0});
      } else if (hi.roomDir == 'h') {
        toggleRoomArrows({u:0, d:0, r:1, l:0});
      } else if (hi.roomDir == 'v') {
        toggleRoomArrows({u:0, d:1, r:0, l:0});
      }
    break;
    case 2:
      if (hi.roomDir == 'hv') {
        toggleRoomArrows({u:0, d:1, r:0, l:1});
      } else if (hi.roomDir == 'h') {
        toggleRoomArrows({u:0, d:0, r:0, l:1});
        if (hi.rooms > 2) toggleRoomArrow("r", 1);
      } else if (hi.roomDir == 'v') {
        toggleRoomArrows({u:1, d:0, r:0, l:0});
        if (hi.rooms > 2) toggleRoomArrow("d", 1);
      }
    break;
    case 3:
      if (hi.roomDir == 'hv') {
        toggleRoomArrows({u:1, d:0, r:1, l:0});
      } else if (hi.roomDir == 'h') {
        toggleRoomArrows({u:0, d:0, r:0, l:1});
        if (hi.rooms > 3) toggleRoomArrow("r", 1);
      } else if (hi.roomDir == 'v') {
        toggleRoomArrows({u:1, d:0, r:0, l:0});
        if (hi.rooms > 3) toggleRoomArrow("d", 1);
      }
    break;
    case 4:
      if (hi.roomDir == 'hv') {
        toggleRoomArrows({u:1, d:0, r:0, l:1});
      } else if (hi.roomDir == 'h') {
        toggleRoomArrows({u:0, d:0, r:0, l:1});
      } else if (hi.roomDir == 'v') {
        toggleRoomArrows({u:1, d:0, r:0, l:0});
      }
    break;
    default:
      alert("Umm...you shouldn't have that many rooms. Squishy did something wrong...");
    break;
  }

  if (editing) {
    //set the current room in the database
    paramQuery({update:'habitat', id:habitatID, values:{current_room:currentRoom}}, validateRoomUpdate);
  }
}
function validateRoomUpdate(r) {
  // if (r != 'success') console.log(r);
}

function disableRoomController() {
  // console.log("disableRoomController");
  $(".rooms").hide();
}
function enableRoomController() {
  // console.log("enableRoomController");
  $(".rooms").show();
}

function toggleRoomArrows(ob) {
  for (var e in ob) {
    toggleRoomArrow(e, ob[e]);
  }
}
function toggleRoomArrow(which, enabled) {
  var a = $("#rc_" + which);
  if (enabled == 1) {
    a.removeClass('disabled');
  } else {
    a.addClass('disabled');
  }
}

function toggleRoomController() {
  var rc = $("#roomController");
  if (rc.hasClass('offscreen')) {
    $("#roomController").removeClass('offscreen');
    $("#roomController").addClass('centerHV');
  } else {
    $("#roomController").removeClass('centerHV');
    $("#roomController").addClass('offscreen');
  }
}

function slideRoom(e) {
  var arrow = $(e);
  var hi = habitatItem;
  if (arrow.hasClass('disabled')) return;

  var ih = $("#innerHab");
  var ihl = ih.css("left").split("px")[0];
  var iht = ih.css("top").split("px")[0];

  //remember that everything is reversed...
  switch (arrow.attr('id')) {
    case 'rc_u':
      ih.animate({top: (Number(iht) + 430) + 'px'}, 300);
      currentRoom = (hi.roomDir == 'hv') ? currentRoom - 2 : currentRoom - 1;
    break;
    case 'rc_d':
      ih.animate({top: (Number(iht) - 430) + 'px'}, 300);
      currentRoom = (hi.roomDir == 'hv') ? currentRoom + 2 : currentRoom +1;
    break;
    case 'rc_l':
      ih.animate({left: (Number(ihl) + 1126) + 'px'}, 300);
      currentRoom = currentRoom - 1;
    break;
    case 'rc_r':
      ih.animate({left: (Number(ihl) - 1126) + 'px'}, 300);
      currentRoom = currentRoom + 1;
    break;
    default:
      alert("You can't do that...");
    break;
  }
  initRoomController();  //reset the arrow buttons
}

function centerPal() {
  var bx = 563;
  var by = 230;
  // console.log("Center pal", habitatItem.roomDir);
  switch(habitatItem.roomDir) {
    case "hv":
      bx += (currentRoom == 2 || currentRoom == 4) ? 1126 : 0;
      by += (currentRoom == 3 || currentRoom == 4) ? 430 : 0;
    break;
    case "v":
      by += 430 * (currentRoom - 1);
    break;
    case "h":
      // console.log("Centering horizontal layout in room " + currentRoom);
      bx += 1126 * (currentRoom - 1);
    break;
    default:
      console.error("Something went wrong when centering Pal: INVALID ROOM DIR");
    break;
  }
  var pal = getItemById(Number(petOb.inv_id));
  pal.x = bx;
  pal.y = by;
  // pal.activate();
  if ($("#roomController").hasClass('centerHV')) toggleRoomController();
}


function showInteractive() {
  var items = $(".item");
  // console.log(items);
  for (var i=0; i<items.length; i++) {
    var jqi = getItemById($(items[i]).attr("id"));
    if (jqi != undefined) if (jqi.wid > 0) jqi.highlight();
  }
}

////////////////////////////////////////////////////////////////////////////////FX
function showFXButton() {
  $("#fxButton").show();
}
function hideFXButton() {
  $("#fxButton").hide();
}
function removeFX() {
  for (var i=fxList.length-1; i>-1; i--) {
    fxList[i].toInventory();
  }

  $("#fxLayer").remove();
  $("#fxLayer_back").remove();
  hideFXButton();
}
