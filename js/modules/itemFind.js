//This is for the Item-Finder quest/events that we'll be putting up.

//TODO: I should really be doing this with abstract classes...but fuck OOP in JavaScript...for the moment.  Just too damn tired.
var ifModuleName = "";
var ifModuleDescription = "";

var loadChance = .3;  //lower this
var ifData;

var dbItems;
var dbPrizes;

function initItemFind() {
  console.log("Initializing itemFind module");
  if (currentPage == 'habitat') {
    mQuery({}, ifInitValues, "get_item_hunt");
  } else if (currentPage == 'admin') {
    mQuery({}, ifInitAdmin, "get_item_hunt");
  }
}

function ifInitValues(d) {
  ifData = d;
  ifModuleName = d.name;
  ifModuleDescription = nl2br(demystify(d.description));

  var trackingContainer = $("<div/>", {
    id:"ihtc",
    class:"site_content static_content",
    style:"position:relative; height:auto; margin-top:10px; padding:5px;"
  });
  trackingContainer.append('<strong style="font-size:1.5em; color:blue;">EVENT! -- ' + ifModuleName + "</strong><br />" + ifModuleDescription);
  trackingContainer.insertBefore($("#lowerPane"));
  mQuery({pid:playerID, type:"itemFind"}, showItemFindTracking, "get_quest_progress");
}

var currentIHCount = 0;
function showItemFindTracking(r) {
  r = r*1;  //force it to be a number
  ifData.goal = ifData.goal*1;  //force it to be a number
  currentIHCount = r;
  var per = r/ifData.goal;
  var width = 300 * per;
  var progText = (r >= ifData.goal) ? "Complete!" : r + "/" + ifData.goal;

  var trackingBar = $("<div/>", {
    id:"ihtb",
    style:"position:relative; border:2px solid silver; border-radius:8px; padding:-1px; height:30px; width:300px; font-size:1.5em; color:silver;"
  });
  var counter = $("<div/>", {
    id:"ihtt",
    style:"position:relative; z-index:100000;"
  }).html(progText);
  trackingBar.append(counter);
  var trackingMeter = $("<div/>", {
    id:"ihtm",
    style:"position:absolute; top:0px;left:0px;border-radius:6px;height:100%; background-color:green; width:" + width + "px;"
  })
  trackingBar.append(trackingMeter);
  $("#ihtc").append("Progress:", trackingBar);

  //if they're in their own habitat or the habby is under construction, stop here.
  if (editable == 1 || underConstruction == 1 || underConstruction == true) {
    return;
  } else if (r >= ifData.goal) {
    paramQuery({select:["pid"], table:"trophies", where:"tid = " + ifData.trophy + " AND pid = " + playerID}, verifyHasTrophy);  //double check that the bug didn't get them
  } else if (Math.random() < loadChance) {  //give them a percentage chance of the item being generated in the habitat they're looking at.
    var index = Math.round(Math.random() * (ifData.items.length - 1));
    // console.log("Gen item " + index);
    generateItemFindItem(index);
  }
}

//redundancy sucks...
function verifyHasTrophy(r) {
  if (r.length == 0) {
    givePlayerTrophy(playerID, ifData.trophy);
    var pids = [];
    for (var i=0; i<ifData.prize_items.length; i++) pids.push(ifData.prize_items[i].id);
    var ob = {message:"Congratulations!<br />You've completed the Item Find Challenge!", items:pids};
    sendSystemGift(playerID, ob);
    checkTrophyNotification();
    paramQuery({update:"quest_tracking", values:{count:25}, where:"pid = playerID"});
  }
}

function incrementItemFindTracking(r) {
  if (r != 'success') {
    console.error(r);
  } else {
    $("#ihi").remove();
    currentIHCount++;
    var per = currentIHCount/ifData.goal;
    var width = 300 * per;
    $("#ihtm").css("width", width+"px");
    if (currentIHCount < ifData.goal) {
      $("#ihtt").html(currentIHCount+"/"+ifData.goal);
    } else {
      $("#ihtt").html("Complete!");

      givePlayerTrophy(playerID, ifData.trophy);
      var pids = [];
      for (var i=0; i<ifData.prize_items.length; i++) pids.push(ifData.prize_items[i].id);
      var ob = {message:"Congratulations!<br />You've completed the Item Find Challenge!", items:pids};
      sendSystemGift(playerID, ob);
      checkTrophyNotification();
    }
  }
}

function generateItemFindItem(index) {
  // console.log("generating item: ", ifData.items[index].src);
  //set random variables...
  var ix = Math.round(Math.random() * 1116);
  var iy = Math.round(Math.random() * 420);
  var degree = Math.round(Math.random() * 360);
  var item = $("<img/>",{
    id:"ihi",
    src:ifData.items[index].src,
    onclick:"ifClickItem()",
    style:"position:absolute; z-index:10000; top:" + iy + "px; left:" + ix + "px;"
  });
  item.css('-moz-transform', 'rotate(' + degree + 'deg)');
  item.css('-moz-transform-origin', '50% 50%');
  item.css('-webkit-transform', 'rotate(' + degree + 'deg)');
  item.css('-webkit-transform-origin', '50% 50%');
  item.css('-o-transform', 'rotate(' + degree + 'deg)');
  item.css('-o-transform-origin', '50% 50%');
  item.css('-ms-transform', 'rotate(' + degree + 'deg)');
  item.css('-ms-transform-origin', '50% 50%');
  $("#habitat").append(item);
}

function ifClickItem() {
  popNotify("You've found a hidden item!");
  mQuery({pid:playerID, type:"itemFind"}, incrementItemFindTracking, "add_quest_count");
}




////////////////////////////////////////////////////////////////////////////////ADMIN

function ifInitAdmin(d) {
  console.log("ifInitAdmin");
  ifData = d;
  ifModuleName = d.name;
  ifModuleDescription = br2nl(demystify(d.description));

  //adminTarget
  //id, name, description, items, goal, prize
  //build base, then pull stuffs from ifDatabase, and populate fields?
  var t = $("<table/>", {
    id:"ihTable",
    style:"width:100%; margin:5px;"
  })
  var tr = $("<tr/>");


  var nameTD = $("<td/>", { style:"vertical-align:top;" });
  var nameField = $("<input/>", {
    id:"ifName",
    type:"text",
    value:ifModuleName
  })
  var goalField = $("<input/>", {
    id:"ifGoal",
    type:"text",
    value:ifData.goal
  })
  var itemField = $('<select/>', {
    id:"ifItemList",
    multiple:"multiple",
    style:"height:200px; vertical-align:top; min-width:200px;"
  })
  nameTD.append("Name: ", nameField, "<br />Goal:&nbsp;&nbsp;&nbsp; ", goalField, "<br />Items: ", itemField);


  var descTD = $("<td/>");
  var descField = $("<textarea/>", {
    id:"ifDesc",
    style:"height:200px; width:500px; vertical-align:top;"
  }).html(ifModuleDescription);
  descTD.append("Description: ", descField);


  var prizeTD = $("<td/>");
  var prizeField = $('<select/>', {
    id:"ifPrizeList",
    multiple:"multiple",
    style:"height:150px; vertical-align:top; min-width:200px;"
  })
  prizeTD.append("Prizes:<br />", prizeField);

  var trophyField = $('<select/>', {
    id:"ifTrophy",
    style:"vertical-align:top; min-width:200px;"
  })
  prizeTD.append("<br />Trophy:<br />", trophyField);



  tr.append(nameTD, descTD, prizeTD);
  t.append(tr);

  var t2 = $("<tr/>");
  var td2 = $("<td/>", {
    colspan:3
  })
  var ifSave = $("<button/>", {
    onclick:"ifSave()"
  }).html("Save");
  var ifReset = $("<button/>", {
    onclick:"ifReset()"
  }).html("Reset Item Hunt Progress");
  t.append(t2.append(td2.append(ifSave, ifReset)));
  $("#eventAdminContent").append(t);


  $("#eventAdminContent").append($("<button/>",{type:'button', onclick:'changeIFStatus(0)'}).html("Deactivate Hunt"));
  $("#eventAdminContent").append($("<button/>",{type:'button', onclick:'changeIFStatus(1)'}).html("Activate Hunt"));


  paramQuery({select:["id", "name", "src"], table:"item", where:"keywords like '%itemfind%'"}, ifPopulateItems);
}

function ifPopulateItems(r) {
  console.log(r);
  dbItems = r;
  var ifil = $("#ifItemList");
  for (var i=0; i<r.length; i++) {
    var op = $("<option/>", { value:r[i].id }).html(r[i].name);
    for (var j=0; j<ifData.items.length; j++) {
      if (ifData.items[j].id == r[i].id) {
        op.attr("selected", "selected");
        break;
      }
    }
    ifil.append(op);
  }
  paramQuery({select:["id", "name", "src"], table:"item", where:"keywords like '%prize%'"}, ifPopulatePrizes);
}

function ifPopulatePrizes(r) {
  dbPrizes = r;
  var ifp = $("#ifPrizeList");
  for (var i=0; i<r.length; i++) {
    var op = $("<option/>", { value:r[i].id }).html(r[i].name);
    for (var j=0; j<ifData.prize_items.length; j++) {
      if (ifData.prize_items[j].id == r[i].id) {
        op.attr("selected", "selected");
        break;
      }
    }
    ifp.append(op);
  }
  paramQuery({select:["id", "name", "src"], table:"trophy"}, ifPopulateTrophies);
}

function ifPopulateTrophies(r) {
  var ift = $("#ifTrophy");
  for (var i=0; i<r.length; i++) {
    var op = $("<option/>", { value:r[i].id }).html(r[i].name);
    if (r[i].id == ifData.trophy) op.attr("selected", "selected");
    ift.append(op);
  }
}



function ifSave() {
  //ifName, ifGoal, ifDesc, ifTrophy, ifPrizeList, ifItemList
  var vals = {};
  vals.name = $("#ifName").val();
  vals.description = nl2br(sanitize($("#ifDesc").val()));
  vals.goal = $("#ifGoal").val();
    var itemIDs = $("#ifItemList").val();
    var items = [];
    for (var i=0; i<itemIDs.length; i++) {
      for (var j=0; j<dbItems.length; j++) {
        if (dbItems[j].id == itemIDs[i]) {
          items.push(dbItems[j].id);
          break;
        }
      }
    }
    vals.items = items;

    var prizeIDs = $("#ifPrizeList").val();
    var prizes = [];
    for (var i=0; i<prizeIDs.length; i++) {
      for (var j=0; j<dbItems.length; j++) {
        if (dbItems[j].id == prizeIDs[i]) {
          prizes.push(dbItems[j].id);
          break;
        }
      }
    }
    vals.prize_items = prizes;
  vals.trophy = $("#ifTrophy").val();

  console.log(vals);


  mQuery({vals:vals}, ifConfirmSave, "update_item_find_vars");

}
function ifConfirmSave(r) {
  if (r!='success') {
    console.error(r);
  } else {
    popNotify("Item Find variables updated");
  }
}

function ifReset() {
  if (confirm("This will reset ALL players' Item Find progress.\nAre you sure?  This cannot be undone.")) {
    mQuery({type:"itemFind"}, ifConfirmReset, "reset_quest_tracking");
  }
}
function ifConfirmReset(r) {
  if (r!='success') {
    console.error(r);
  } else {
    popNotify("Quest tracking for Item Find reset");
  }
}

function changeIFStatus(b) {
  mQuery({activate:b, module:"itemFind"}, verifyHuntStatus, 'change_if_status');
}
function verifyHuntStatus(r) {
  console.log(r);
  if (r == 'success') {
    popNotify("Item Hunt status changed");
  } else {
    popNotify("There was an error.  Please see the console for details", "ERROR");
  }
}


console.log("itemFind module loaded");
initItemFind();
