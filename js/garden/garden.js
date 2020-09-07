var garden = undefined;
var plots = [];
var ownedSeeds = [];
var wheelVisible = false;
var currentSelections = {};
var currentPlot = undefined;
var editable = false;
var gSettingsShown = false;
var waterTimer = undefined;
var waterOb = {h:0, m:0, s:0};

//gQuery defined in utils


function fetchGarden() {
  if (userID == playerID) getGardenItems();
  gQuery({pid:userID, visitorID:playerID}, loadGarden, "fetch_garden");
}
function loadGarden(r) {
  //reset vars
  $("#innerHab").empty();
  plots = [];
  // ownedSeeds = [];
  // if (userID == playerID) getGardenItems();
  garden = undefined;

  if (typeof(r) == "string") { alert(r);return;} //ERROR catcher
  // console.log("Garden", r);
  garden = r;//just to make my brain hurt less
  setGardenTips(true);
  setGardenPrivacy(true);

  //add them to #innerHab
  var es = $("#innerHab").width() - 205*garden.plots.length;//remaining space

  //set private notification
  if (userID != playerID && garden.privacy == 'private') {
    var h = $("#innerHab");
    var pNote = $("<div/>", {
      style:"position:absolute;width:100%;text-align:center;top:410px;color:cyan;"
    }).html("This is a private garden, but you may still view the information on the plots.");
    h.append(pNote);
  }

  //initialize the plots
  for (var i=0;i<garden.plots.length;i++) {
    var p = new Plot(garden.plots[i], i);
    // console.log("plot", p);
    plots.push(p);
    var wrapper = $("<div/>", {
      class:"plot_wrapper",
      style:"left:" + (i*205 + (es/2)) + "px;"
    });

    var pc = $("<div/>", {
      class:"plot_container",
      id:"plotContainer_" + i,
      title:"Click to Show/Hide info panel",
      onclick:"plots["+i+"].click()"
    });
    wrapper.append(pc);



    var waterLevel = $("<div/>", {
      id:"waterLevel_" + i,
      class:"water_display centerH"
    });
    wrapper.append(waterLevel);
    if (userID != playerID) {
      switch (garden.privacy) {
        case 'private':
          waterLevel.hide();
        break;
        case 'friends':
          if (garden.isFriend == 0) waterLevel.hide();
        break;
        case 'set':
          //TODO:
        break;
        case 'public':
          //TODO: nothing...this should be fine
        break;
        default:
          console.error("Unknown privacy -> ", garden.privacy);
        break;
      }
    }
    p.waterPanel = waterLevel;

    if (p.plantID == 0) waterLevel.hide();


    $("#innerHab").append(wrapper);
    p.init(pc, wrapper);
  }



}

function showGuestWaterCountdown(cd) {
  if(waterTimer != undefined) return;//already initialized, so we're not doing it again
  // console.log("showing guest watering countdown", cd);
  waterOb = cd;
  var h = $("<span/>", { id:"gWater_h" }).html((cd.h < 10) ? "0" + cd.h : cd.h);
  var m = $("<span/>", { id:"gWater_m" }).html((cd.m < 10) ? "0" + cd.m : cd.m);
  var s = $("<span/>", { id:"gWater_s" }).html((cd.s < 10) ? "0" + cd.s : cd.s);

  var gWaterBar = $("<div/>", {
    id:"guestWaterBar",
    style:"position:absolute;width:100%;background-color:rgb(176,224,230);color:gray;font-weight:bold;top:410px;height;20px;"
  });
  gWaterBar.append("Time until you can water this garden again: ", h, ":", m, ":", s);
  $("#innerHab").append(gWaterBar);
  waterTimer = setInterval(guestWaterTick, 1000);
}
function guestWaterTick() {
  waterOb.s--;
  if (waterOb.s == -1) {
    waterOb.s = 59;
    waterOb.m--;
    if (waterOb.m == -1) {
      waterOb.m = 59;
      waterOb.h--;
    }
  }
  if (waterOb.h == -1) {
    clearInterval(waterTimer);
    fetchGarden();
    return;
  }
  $("#gWater_h").html((waterOb.h < 10) ? "0" + waterOb.h : waterOb.h);
  $("#gWater_m").html((waterOb.m < 10) ? "0" + waterOb.m : waterOb.m);
  $("#gWater_s").html((waterOb.s < 10) ? "0" + waterOb.s : waterOb.s);
}


function getGardenItems() {
  gQuery({pid:userID}, function(r) { ownedSeeds = r;}, "get_garden_items");
}

function showPlantingPanel(plot) {
  // console.log("showing planting panel for ", plot);
  currentPlot = plot;
  for (var k in plots) if (plots[k].showingInfo) plots[k].showInfo();//close all of the info panels that are open (if any)
  var pp = $("#plantingPanel");
  pp.empty();
  pp.css("visibility", "visible");
  pp.append('<button id="closeEditorButton" style="z-index:20000" class="close_button" title="Close" onclick="closePlantingPanel();">X</button>');//close button

  pp.append('<header>Choose Seed and Extras<br /><span style="font-size:.7em;font-weight:normal;">Drag and drop seeds/fertilizers</span></header><br />');

  //seed drop
  var seedDrop = $("<div/>", {
    id:"seedDrop",
    class:"dropContainer greenglow",
    style:"margin-bottom:4px;",
    title:"Drop a seed here"
  }).html("Seed");
  seedDrop.droppable({
    drop:onSeedDrop
  });
  pp.append(seedDrop, "<br />");

  //fertilizer drops
  var fBreaks = [25,50,100];
  for (var f=0;f<3;f++) {
    var left = f * 60 + 215;
    var fDrop = $("<div/>", {
      id:"f_drop_" + f,
      class:"dropContainer",
      style:"border:1px solid lightblue;position:absolute;left:"+left+"px;",
      title:"Drop fertilizer here"
    }).html("");
    if (playerOb.level >= fBreaks[f]) {
      fDrop.droppable({
        drop:onFertDrop
      });
      fDrop.addClass("blueglow");
    } else {
      fDrop.css("background-color", "#aa0000");
      fDrop.html("lvl " + fBreaks[f]);
      fDrop.attr("title", "This fertilizer slot unlocks at Player level " + fBreaks[f]);
    }
    pp.append(fDrop);
  }

  var seedContainer = $("<div/>", {
    class:"seedContainer",
    style:"top:60px;"
  });
  var seedTrack = $("<div/>", {
    id:"seedTrack"
  });
  seedContainer.append(seedTrack);
  pp.append(seedContainer);

  showAvailableSeeds(seedTrack);

  //build info boxes
  var sInfoBox = $("<div/>", {
    id:"infoBox_seed",
    style:"position:absolute;top:0px;left:0px;padding:4px;width:150px;height:183px;border-right:1px solid lightgreen;font-size:.8em;text-align:left;user-select:none;"
  }).html('<div style="color:lightgreen;width:100%;text-align:center;">Seed</div>');
  var fInfoBox = $("<div/>", {
    id:"infoBox_fert",
    style:"position:absolute;top:0px;left:450px;padding:4px;width:150px;height:183px;border-left:1px solid lightblue;font-size:.8em;text-align:left;user-select:none;"
  }).html('<div style="color:lightblue;width:100%;text-align:center;">Fertilizer</div>');

  pp.append(sInfoBox, fInfoBox);

  //plant button
  var pBD = $("<div/>", {id:"plantButtonDiv"});
  var pButton = $("<button/>", {
    id:"plantButton",
    onclick:"plantSeed()"
  }).html("Plant!");
  var cButton = $("<button/>", {
    id:"clearButton",
    onclick:"clearSeed()"
  }).html("Reset");
  pBD.append(pButton, cButton);
  pBD.hide();
  pp.append(pBD);

  //show panels
  $("#pageMask").show();
  pp.show();
}


function showAvailableSeeds(target) {
  target.empty();
  var flag = true;
  console.log("Show Available Seeds", ownedSeeds);
  for (var s=0;s<ownedSeeds.length;s++) {
    // console.log(ownedSeeds[s]);
    for (var i=0; i<ownedSeeds[s].in_storage; i++) {
      flag = false;
      var seedDrag = $("<img/>", ownedSeeds[s]);
      seedDrag.attr("seedID", s);
      seedDrag.attr("title", ownedSeeds[s].name);
      seedDrag.addClass("border_rarity_" + ownedSeeds[s].rarity);
      seedDrag.addClass("seedIcon");
      seedDrag.draggable({
        containment:"#plantingPanel",
        cursor:"move",
        // snap:".dropContainer",
        stack:"img",
        revert:true,
        stop:onSeedDrop,
        helper:itemHelper
      });

      if (ownedSeeds[s].item_type == 'fertilizer') {
        var f = ownedSeeds[s];
        var title = "--"+f.name+"--";
        var ouv = f.on_use.split(',');
        var ou = {};
        for (var k in ouv) {
          ou[ouv[k].split(":")[0]] = ouv[k].split(":")[1];
        }
        if (ou.mutate > 0) title += "\nMutate Chance: +" + ou.mutate + "%";
        if (ou.count > 0) title += "\nHarvest Count: +" + ou.count;
        if (ou.rarity > 0) title += "\nHarvest Rarity: +" + ou.rarity + "%";
        if (ou.time > 0) title += "\nGrowth Time: -" + ou.time + " hours/stage";
        seedDrag.attr("title", title);

      } else if (ownedSeeds[s].item_type == 'seed') {
        var f = ownedSeeds[s];
        var title = "--"+f.name+"--";

        var fam = (f.family == "") ? "none" : f.family;
        title += "\nFamily: " + fam;
        title += "\nLevel: " + f.level;
        title += "\nMutate Chance: " + f.mutate_chance + "%";


        seedDrag.attr("title", title);
      }


      target.append(seedDrag);
    }
  }
  if (flag) {
    target.append('<div style="width:550px;text-align:center;font-weight:bold;color:silver;">No seeds in inventory</div>');
  }
}


//might have to leverage this one...
var original;
function itemHelper(event) {
  original = $(event.currentTarget);
  var clone = $(event.currentTarget).clone();
  clone = clone.detach();
  clone.appendTo($("#plantingPanel"));
  return clone;
  // return $(event.currentTarget).clone();
}

function onSeedDrop(event, ui) {
  var thing = original;
  if (ui.draggable == undefined) return;
  if (thing.attr("item_type") != 'seed') {
    console.log("Not a seed.  Reverting");
    popNotify("This slot requires a seed", 'error');
  } else {
    setSelectionOb(thing.attr("seedID"));
    thing.draggable( 'disable' );
    $(this).droppable( 'disable' );
    thing = thing.detach();
    $(this).empty();
    thing.appendTo($(this));
    thing.css("margin", "0px");

    thing.draggable( 'option', 'revert', false );

    // showAvailableFerts($("#seedTrack"));
    $("#plantButtonDiv").show();

    var seed = ownedSeeds[thing.attr('seedID')];
    //set the info in the infoBox_seed div
    var fam = (seed.family == "") ? "none" : seed.family;
    var a = '<strong class="color_rarity_' + seed.rarity + '">' + seed.name + "</strong><br />";
    var b = "Family: " + fam + "<br />";
    var c = "Level: " + seed.level + "<br />";
    var d = "Mutate Chance: " + seed.mutate_chance + "%<br />"
    var e = 'Rarity: <strong class="color_rarity_' + seed.rarity + '">' + getRarString(seed.rarity) + "</strong>";

    $("#infoBox_seed").append(a,b,c,d,e);

  }
}
function onFertDrop(event, ui) {
  var thing = original;
  if (ui.draggable == undefined) return;
  if (thing.attr("item_type") == 'seed') {
    console.log("Is a seed.  Reverting");
    popNotify("This slot requires a fertilizer", 'error');
  } else {
    setSelectionOb(thing.attr("seedID"));
    thing.draggable( 'disable' );
    thing.draggable( 'disable' );
    $(this).droppable( 'disable' );
    thing = thing.detach();
    $(this).empty();
    thing.appendTo($(this));
    thing.css("margin", "0px");

    thing.draggable( 'option', 'revert', false );
    // $(this).droppable( 'disable' );
    // ui.draggable.position( { of: $(this), my: 'left top', at: 'left+1 top+1' } );
    // ui.draggable.draggable( 'option', 'revert', false );

    //set the info in the infoBox_seed div
    var ouv = thing.attr("on_use").split(',');
    var ou = {};
    for (var k in ouv) {
      ou[ouv[k].split(":")[0]] = ouv[k].split(":")[1];
    }
    setFertInfo("mutate", ou.mutate);
    setFertInfo("count", ou.count);
    setFertInfo("rarity", ou.rarity);
    setFertInfo("time", ou.time);
    var title = "";
    if (ou.mutate > 0) title += "\nMutate Chance: +" + ou.mutate + "%";
    if (ou.count > 0) title += "\nHarvest Count: +" + ou.count;
    if (ou.rarity > 0) title += "\nHarvest Rarity: +" + ou.rarity + "%";
    if (ou.time > 0) title += "\nGrowth Time: -" + ou.time + " hours/stage";
    console.log(title);
  }
}

function setFertInfo(title, val) {
  if ($("#f_infoBox_" + title).attr("id") == undefined){
    var titleString = "None";
    var operator = "+";
    var tailString = "";
    var desc = "";
    switch (title) {
      case "mutate":
        titleString = "Mutate Chance: ";
        tailString = "%";
        desc = "'Mutate Chance' is the chance that your seed will\nmutate into a higher level when it is planted.\nSeeds with a 0% mutate will never mutate, even\nif fertilizers are used.";
      break;
      case "count":
        titleString = "Harvest Count: ";
        desc = "'Harvest Count' modifiers add to the number of items\nthat will be harvested from a fully-matured plant.\nThis is a guaranteed addition to the number of items\nnormally harvested, but it does not apply if you choose\nto harvest the Plant instead of Items";
      break;
      case "rarity":
        titleString = "Harvest Rarity: ";
        tailString = "%";
        desc = "'Harvest Rarity' applies to the rarity of the items\nharvested from a plant, and applies to each one if\nyou harvest more than one item.";
      break;
      case "time":
        titleString = "Growth: ";
        operator = "-";
        tailString = "h/stage";
        desc = "The 'Growth' modifier speeds up how fast your plant\ngrows by reducing the time it takes to reach each\nstage in the plant's life cycle";
      break;
      default: console.error("Invalid switch: " + title);break;
    }
    var container = $("<div/>", {
      id:"f_infoCon_" + title,
      title:desc
    }).html(titleString);
    var wrapperCon = $("<span/>", { class:"mod_text" }).html(operator);
    var valCon = $("<span/>", {
      id:"f_infoBox_" + title
    }).html(val);
    container.append(wrapperCon.append(valCon,tailString));
    $("#infoBox_fert").append(container);
  } else {
    //add to the value and set the html
    var box = $("#f_infoBox_" + title);
    var current = box.html();
    var sum = current*1+val*1;
    box.html(sum);
  }
}

function setSelectionOb(id) {
  var thing = ownedSeeds[id];
  var c = currentSelections;
  if (thing.item_type == 'seed') {
    c.seed = thing;
  } else {
    if (c.ferts == undefined) c.ferts = [];
    c.ferts.push(thing);
  }
  console.log(c);
}

function closePlantingPanel() {
  $("#pageMask").hide();
  $("#plantingPanel").hide();
  $("#plantingPanel").empty();
  currentSelections = {};
  currentPlot = undefined;
}

function plantSeed() {
  currentSelections.plot = currentPlot;
  console.log("PlantSeed", currentSelections);
  //push it to the database, and update the plot
  if (currentSelections.ferts == undefined) currentSelections.ferts = [];
  currentSelections.gid = garden.id;
  currentSelections.pid = playerID;
  gQuery(currentSelections, validatePlanting, "plant_garden_seed");

}
function clearSeed() {
  currentSelections = {};
  showPlantingPanel(currentPlot);
}

function validatePlanting(r) {
  console.log(r);
  // if (r == "success") location.reload();
  if (r == "success") {
    fetchGarden();
    closePlantingPanel();
  }
}


function getHarvest(items, plotID, src) {
  console.log("getHarvest", items, plotID);
  var wSrc = src || "";
  gQuery({items:items, plotID:plotID, pid:playerID, witherSrc:wSrc}, showHarvest, "get_harvest");
}
function showHarvest(r) {
  console.log(r);
  var itemHTML = "";
  for (var k in r.items) {
    itemHTML += '<img src="'+r.items[k].src+'" style="height:75px;width:75px;margin:2px;" class="border_rarity_'+r.items[k].rarity+'" title="'+r.items[k].name+'"/>';
  }
  if (r.items.length == 0) {
    itemHTML = "No items were harvested.<br />Better luck next time!";
    if (r.message != undefined) {
      itemHTML = r.message;
    }
  }
  swal({
      title: "Harvest Results",
      text: itemHTML,
      // imageUrl: r.src,
      html: true,
      animation: "slide-from-top",
      confirmButtonColor: "#acc6ef",
      confirmButtonText: "Spiffy!",
      closeOnConfirm: true,
    },
    function(isConfirm) {
      if (isConfirm) {
        // checkTrophyNotification();
        fetchGarden();
      }
    }
  );
}

function mulchedPlant(r) { setTimeout(() => {delayedMulch(r)}, 500);}
function delayedMulch(r) {  //this is to prevent the swals from interfering with each other
  console.log("mulched plant", r);
  var itemHTML = "";
  for (var k in r.items) {
    itemHTML += '<img src="'+r.items[k].src+'" style="height:75px;width:75px;margin:2px;" title="'+r.items[k].name+'"/>';
  }
  if (r.items.length == 0) {
    itemHTML = "Nothing gotten from mulching.<br />Better luck next time!";
  }
  swal({
      title: "Mulching Results",
      text: itemHTML,
      // imageUrl: r.src,
      html: true,
      animation: "slide-from-top",
      confirmButtonColor: "#acc6ef",
      confirmButtonText: "Groovy!",
      closeOnConfirm: true,
    },
    function(isConfirm) {
      if (isConfirm) {
        // checkTrophyNotification();
        fetchGarden();
      }
    }
  );
}



function waterLevel(hours, increment) {
  var i = 1;
  var inc = 0;
  var blocks = 24/increment;
  var blockrange = 24/blocks;
  for (var i = 1;i < blocks;i++) {
    if (hours < i*blockrange) {
      var per = 100 - ((i-1)*blockrange / 24 * 100);
      if (i <= 1) per = 100;
      return {p:per, warn:(per < 30)};
    }
  }
  return {p:1, warn:true};
}

function waterPlot(id) {
  // console.log("waterPlot", id);
  plots[id].water((userID == playerID));
}

function plotWatered(r) {
  console.log("plotWatered:", r);

  if (r.canwater == 0) {
    var message = "";
    switch (r.reason) {
      case "noPlant":
        message = "Whoops! Looks like someone harvested this plant before you could water it!";
      break;
      case "alreadyWatered":
        message = "Whoops!  Looks like someone got to the watering before you did!";
        if (r.owner == 1) message += "<br />(If you don't want this to happen again, you can set your garden to 'private')";
      break;

      default: message = "Could not water plant: " + r.message;break;
    }
    popNotify(message);
    fetchGarden();//rebuild the garden to show all updates
  } else {
    if (r.owner == 1) {
      givePlayerXP(playerID, 10);
      popNotify("You have earned 10 XP<br />for tending your garden");
    } else {
      givePlayerMoney(playerID, {silver:10});
      popNotify("You have earned 10 <img src=\"assets/site/coin-silver.png\" /> for<br />watering your friend's garden");
    }

    callPlot(r.divID, "setWaterLevel", {p:100, warn:false});
  }

}



function callPlot(id, method, ...args) {
  Plot.prototype[method].apply(plots[id], args);
}

function toggleGardenSettings() {
  if (gSettingsShown) {
    $("#gardenSettingsDiv").animate({height:"70px", width:"70px", 'background-color':"rgba(154,205,50,0)"}, 250);
    gSettingsShown = false;
  } else {
    $("#gardenSettingsDiv").animate({height:"90px", width:"300px", 'background-color':"rgba(154,205,50,.5)"}, 250);
    gSettingsShown = true;
  }
}

function setGardenTips(fromInit) {
  if (fromInit == true) {
    var st = (garden.show_tips == 1) ? true : false;
    $("#g_showTips_cb").attr("checked", st);
  } else {
    var ud = ($("#g_showTips_cb").is(":checked")) ? 1 : 0;
    garden.show_tips = ud;
    paramQuery({update:"garden", id:garden.id, values:{show_tips:ud}});
  }
  if (garden.show_tips == 1) {
    $("#helpSpan").addClass("whiteglow");
    if (!helpShown) toggleHelp();
  } else {
    $("#helpSpan").removeClass("whiteglow");
    if (helpShown) toggleHelp();
  }
}
function setGardenPrivacy(fromInit) {
  if (fromInit == true) {
    $("#g_privacySelect").val(garden.privacy);
  } else {
    console.log("setting privacy to", $("#g_privacySelect").val());
    paramQuery({update:"garden", id:garden.id, values:{privacy:$("#g_privacySelect").val()}});
    if ($("#g_privacySelect").val() == 'set') {
      //set up the list...this is going to be hellish...

    }
  }
}


function getRarString(r) {
  var rar = (r==0) ? "Common" : (r==1) ? "Uncommon" : (r==2) ? "Rare" : (r==3) ? "Epic" : "Legendary";
  return rar;
}

var helpShown = !1;
function toggleHelp() {
  var span = $("#helpSpan");
  var div = $("#helpDiv");
  if (helpShown) {
    helpShown = !1;
    span.html("Need help with the garden? Click here :)");
    div.animate({width:"350px", 'background-color':'rgba(255,255,255,0);', height:"28px"});
    // div.css("height", "28px");
  } else {
    helpShown = !0;
    span.html("Click here to close the help");
    div.animate({width:"1118px", 'background-color':'rgba(180,220,180,.9);'});
    div.css("height", "auto");
  }
}

function hideButton(b) {
  if (typeof(b) == 'string') {
    $("#" + b).css("visibility", "collapse");
  } else if (typeof(b) == 'object') {
    for (var i=0;i<b.length;i++) {
      $("#" + b[i]).css("visibility", "collapse");
    }
  }
}
function showButton(b) {
  if (typeof(b) == 'string') {
    $("#" + b).css("visibility", "visible");
  } else if (typeof(b) == 'object') {
    for (var i=0;i<b.length;i++) {
      $("#" + b[i]).css("visibility", "visible");
    }
  }
}
