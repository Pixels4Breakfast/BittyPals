function Plot(ob, divID) {
  this.divID = divID;
  this.id = ob.id;//do I actually need to do this?
  this.gid = ob.gid;
  this.pid = ob.pid;//don't really need this, do we?
  this.seedID = ob.seed_id || 0;
  this.plantID = ob.plant_id;
  this.currentStage = ob.stage || 0;
  this.nextStage = ob.next_stage || 0;
  this.watered = ob.watered || 0;
  this.withered = ob.withered || 0;
  this.witherFamily = ob.plant.wither_family || 0;
  this.harvestReady = ob.harvest_ready;
  this.fertilizer = ob.fertilizer;
  this.fertilizers = ob.fertilizers || [];
  this.mutated = ob.mutated || 0;
  this.planterID = ob.planter_id;
  this.diff = ob.diff || false;
  this.wDiff = ob.wdiff || "0:0:0";
  this.mods = ob.mods || {};

  //Plant info
  this.stages = ob.plant.stages || 0;
  this.stageNames = ob.plant.stage_names || [];
  this.src = ob.plant.stage_src || undefined;
  this.src_height = ob.plant.src_height || 400;
  this.src_width = ob.plant.src_width || 200;
  this.plantHarvest = ob.plant.plant_harvest || 0;
  this.harvestCount = ob.plant.harvest_count || [];//this...will be fun
  this.harvestItems = ob.plant.harvest_items || [];//more "fun"
  this.stageIncrement = ob.plant.stage_increment || 0;
  this.plantType = ob.plant.plant_type || "none";
  this.level = ob.plant.level || "silver";
  this.family = ob.plant.family || "none";

  //seed
  this.seed = ob.seed || {};


  //plot devices ...hahahahahah!!
  this.target = undefined;
  this.wrapper = undefined;
  this.waterPanel = undefined;
  this.waterDisplay = undefined;
  this.infoPanel = undefined;
  this.showingInfo = false;
  this.countdown = {h:0, m:0, s:0};
  this.timeout = undefined;
  this.waterCountdown = {h:0, m:0, s:0};
  this.waterTimeout = undefined;
  this.sound = ob.sound;//??
}

Plot.prototype = {
  set stage(v)    {
    this.currentStage = v;
    var tOff = 0;
    var src = this.src;
    var tOff = 0;
    var bgWidth = 200;
    if (this.currentStage < 3) {
      src = "assets/garden/plot_stage_" + this.currentStage + ".png";
    } else {
      tOff = (this.currentStage - 3) * 200;
      bgWidth = 200*(this.stages-2);
    }

    this.target.css({
      display:"inline-block",
      background:"url('"+src+"') -" + tOff + "px 0/"+bgWidth+"px 400px no-repeat"
    })
  },
  get stage()     {
    return this.currentStage;
  }
}

Plot.prototype.init = function(target, wrapper) {  //target needs to be sent as jQuery object of div
  this.target = target;
  this.wrapper = wrapper;
  this.waterDisplay = $("#waterLevel_" + this.divID);
  // console.log("Initializing", this);
  this.stage = this.currentStage;//using the setter

  if (this.currentStage == this.stages && this.stages > 0) {
    this.harvestReady = 1;
  }

  //set the info panel
  this.infoPanel = $("<div/>", {
    id:"ip_" + this.divID,
    class:"plot_info_panel"
  });

  this.setInfo();

  if (this.withered == 1) {


    var rButton = $("<button/>", {
      type:"button",
      class:"resuscitate_button",
      style:"margin-right:10px;",
      onclick:"callPlot("+this.divID+", 'resuscitate')"
    }).html("Resuscitate");

    var mButton = $("<button/>", {
      type:"button",
      class:"mulch_button",
      onclick:"callPlot("+this.divID+", 'mulch')"
    }).html("Mulch");

    var bBlock = $("<div/>", {
      style:"text-align:center;width:100%;position:absolute;top:15px;",
      id:"buttonBlock"
    }).append(rButton,mButton);
    if (userID == playerID) this.wrapper.append(bBlock);

  } else
  if (this.harvestReady == 1) {
    if (userID == playerID) this.wrapper.append(this.createHarvestButtons());
  } else if (this.diff != 0) {
    //set up the countdown
    var diff = this.diff.split(":");
    this.countdown.h = diff[0];
    this.countdown.m = diff[1];
    this.countdown.s = diff[2];

    var hDisp = $("<span/>", {id:"countdown_h_" + this.divID}).html(this.countdown.h);
    var mDisp = $("<span/>", {id:"countdown_m_" + this.divID}).html(this.countdown.m);
    var sDisp = $("<span/>", {id:"countdown_s_" + this.divID}).html(this.countdown.s);
    var cDisp = $("<div/>", {
      id:"countdown_div_" + this.divID,
      class:"countdown_div centerH border_rarity_" + this.seed.rarity,
      title:"Countdown to next stage of plant growth"
    });
    cDisp.append(hDisp, ":", mDisp, ":", sDisp);
    this.wrapper.append(cDisp);

    this.timeout = setInterval(() => { this.timerTick(this);}, 1000);
  }

  //water levels
  if (this.withered == 1) {
    if (this.stages > 0) {
      this.setWithered();
    }
  } else {
    if (this.stages > 0) {
      var w = this.waterPanel;
      // console.log("WaterDiff", this.wDiff);
      if (this.wDiff.d > 0) this.wDiff.h = 50;
      if (userID == playerID) {
        this.setWaterLevel(waterLevel(this.wDiff.h, 1));
      } else {
        var showWater = false;
        var cd = {};//placeholder
        switch(garden.privacy) {
          case 'private':
            //do nothing and let it default
          break;
          case 'friends':
            if (garden.isFriend == 1) {
              if (garden.canWater == 1) {
                showWater = true;
              } else {
                showWater = true;
                cd = garden.fWaterCountdown;
              }
            }
          break;
          case 'set':
            //TODO: get the selected tenders thingy working
          break;
          case 'public':
            if (garden.canWater == 1) {
              showWater = true;
            } else {
              showWater = true;
              cd = garden.fWaterCountdown;
            }
          break;
          default:

          break;
        }

        if (showWater) {
          this.setWaterLevel(waterLevel(this.wDiff.h, 1), 'guest', cd);
        } else {
          this.setWaterLevel(false);
        }
      }
    }
  }

  this.wrapper.append(this.infoPanel);
}

Plot.prototype.createHarvestButtons = function() {
  var hButton = $("<button/>", {
    type:"button",
    class:"harvest_button greenglow",
    title:"Harvest the items from this plant",
    onclick:"callPlot("+this.divID+", 'harvest')"
  }).html("Harvest Items");

  var pButton = "";
  if (this.plantHarvest != 0) {
    pButton = $("<button/>", {
      type:"button",
      class:"harvest_button greenglow",
      title:"Harvest this plant for your habitat",
      onclick:"callPlot("+this.divID+", 'harvestPlant')"
    }).html("Harvest Plant");
  }

  var bBlock = $("<div/>", {
    style:"text-align:center;width:100%;position:absolute;top:15px;"
  }).append(hButton,pButton);
  return bBlock;
}

Plot.prototype.setWithered = function() {
  // console.log("Withered...");
  // console.log(this.witherFamily);
  if (this.witherFamily == 1) {
    this.target.css("background", "url(assets/garden/wither/"+ this.family.toLowerCase() + "_withered.png)");
  } else {
    this.target.css("background", "url(assets/garden/wither/"+ this.plantType.toLowerCase() + "_withered.png)");
  }
  this.waterPanel.css({
    // "border-color": "red",
    border:"1px solid gray",
    color:"rgb(200,100,100)",
    // color:"red",
    "font-weight":"bold",
    "user-select":"none"
  });
  this.waterPanel.append("Withered");
  this.waterPanel.attr("title", "Your plant has withered :(");

  if (this.harvestReady == 1) {
    //add in the harvest button for the withered plant
    if ($("#witherButton").attr('id') != undefined) return;
    var wButton = $("<button/>", {
      type:"button",
      id:"witherButton",
      onclick:"callPlot(" + this.divID + ", 'harvestWithered')",
      class:"harvest_wither_button"
    }).html("Harvest Withered");
    $("#buttonBlock").append(wButton);
  }
}

Plot.prototype.setWaterLevel = function(ob, fType, countDown) {
  var bar = $("#waterBar_" + this.divID);

  if (ob == false) {  //not showing the water bar at all (garden privacy)
    this.waterDisplay.hide();
    return;
  } else {
    this.waterDisplay.show();
  }

  if (fType != undefined) {
    if (countDown.h == undefined) {
      // console.log("no countdown defined");
    } else {
      this.waterDisplay.hide();
      showGuestWaterCountdown(countDown);
    }
  }

  var perString = (this.withered == 0) ? Math.floor(ob.p) + "%" : "<strong style=\"color:red;\">Withered</strong>";
  if (bar.attr("id") == undefined) {
    var waterTrack = $("<div/>", {
      id:"waterTrack_" + this.divID,
      class:"water_track",
      onclick:"waterPlot(" + this.divID + ")",
      title:"Click to water"
    }).html("Water Level <span id=\"wPer_"+this.divID+"\">" + perString + "</span>");
    bar = $("<div/>", {
      id:"waterBar_" + this.divID,
      style:"position:absolute;z-index:-1;left:0px;top:0px;height:100%;"
    }).html("&nbsp;");
    waterTrack.append(bar);
    this.waterPanel.append(waterTrack);
  }
  var bgc = (ob.warn) ? "orange" : "lightblue";
  $("#wPer_" + this.divID).html(perString);
  bar.css({
    "background-color":bgc,
    width:ob.p + "%"
  })
  if (ob.p == 100) {
    $("#waterTrack_" + this.divID).removeAttr("onclick");
  }
}


Plot.prototype.click = function() {
  this.showInfo();
}

Plot.prototype.showInfo = function() {
  if (this.showingInfo) {
    this.infoPanel.animate({top:"430px"}, 250);
    this.showingInfo = false;
  } else {
    this.infoPanel.animate({top:"100px"}, 250);
    this.showingInfo = true;
  }
}

Plot.prototype.setInfo = function() {
  var p = this.infoPanel;//just saving headaches
  p.empty();
  if (this.plantID == 0) {
    if (userID == playerID) {
      p.append($("<div/>", { style:"position:relative;width:100%;text-align:center;top:25px;"}).append($("<button/>", {
        type:"button",
        class:"plant_button",
        onclick:"showPlantingPanel(plots["+this.divID+"])"
      }).html("Plant<br />Seed")));
    } else {
      //visitor
      p.css("text-align", "center");
      p.append("Nothing planted here");
    }
  } else {
    p.append("Seed: ");
    p.append($("<span/>",{ style:"font-weight:bold;", class:"color_rarity_"+this.seed.rarity }).html(this.seed.name));
    var sName = (this.withered == 0) ? this.stageNames[this.currentStage-1] : "<span style=\"color:sienna;font-weight:bold;\">Withered</span>";
    p.append("<br />Current Stage: " + sName, "<hr />");



    var imgBlock = $("<div/>", {
      style:"width:100%;text-align:center"
    });
    var seedIcon = $("<img/>", {
      title:this.seed.name,
      class:"seed_icon border_rarity_" + this.seed.rarity,
      src:this.seed.src
    });
    imgBlock.append(seedIcon);

    for (var i=0;i<this.fertilizers.length;i++) {
      var f = this.fertilizers[i];
      var title = f.name;
      var fIcon = $("<img/>", {
        class:"seed_icon border_rarity_" + f.rarity,
        src:f.src
      });
      var ouv = f.on_use.split(',');
      var ou = {};
      for (var k in ouv) {
        ou[ouv[k].split(":")[0]] = ouv[k].split(":")[1];
      }
      if (ou.mutate > 0) title += "\nMutate Chance: +" + ou.mutate + "%";
      if (ou.count > 0) title += "\nHarvest Count: +" + ou.count;
      if (ou.rarity > 0) title += "\nHarvest Rarity: +" + ou.rarity + "%";
      if (ou.time > 0) title += "\nGrowth Time: -" + ou.time + " hours/stage";
      fIcon.attr("title", title);
      imgBlock.append(" &nbsp;", fIcon);
    }
    p.append(imgBlock);


    if (this.withered == 0) {
      var statBlock = $("<div/>", {
        style:"width:100%;text-align:left;font-size:.8em;"
      });

      if (this.seed.mutate_chance > 0) {
        statBlock.append("<strong>Mutate Chance: ", this.seed.mutate_chance);
          if (this.mods.mutate > 0 && this.seed.mutate_chance > 0) statBlock.append('<span class="mod_text"> +'+ this.mods.mutate+ "</span>");
        statBlock.append("%");
        statBlock.append("<br /><strong>Mutated:</strong> ", (this.mutated == 1) ? '<span class="mod_text">Yes</span>' : "No");
        statBlock.append("<br />");
      }
      statBlock.append("<strong>Stage: </strong", this.stage + "/" + this.stages, "<br />");
      statBlock.append("<strong>Growth: </strong>", this.stageIncrement);
        if (this.mods.time > 0) statBlock.append('<span class="mod_text"> -'+ this.mods.time+ "</span>");
      statBlock.append(" hours/stage");
        if (this.mods.count > 0) statBlock.append('<br /><strong>Items Harvested:</strong><span class="mod_text"> +' + this.mods.count + "</span>");
        if (this.mods.rarity > 0) statBlock.append('<br /><strong>Harvest Rarity:</strong><span class="mod_text"> +' + this.mods.rarity + "%</span>");

      p.append(statBlock);

      var kButton = $("<button/>", {
        type:"button",
        class:"mulch_button",
        style:"width:100%;margin-top:5px;",
        onclick:"callPlot("+this.divID+", 'mulch')"
      }).html("Mulch");

      if (userID == playerID) p.append(kButton);

    } else {
      var infoBlock = 'Oh no!  Your plant has withered!<br />You can either mulch your plant into simple fertilizer, or you can resuscitate it for 1000<img src="assets/site/coin-gold.png" style="height:15px" />';
      p.append(infoBlock);
    }

  }
}

Plot.prototype.resuscitate = function() {
  var me = this;
  swal({
      title: "Resuscitate this plant?",
      text: "Are you sure that you would like to pay 1000 <img src=\"assets/site/coin-gold.png\" /> to bring this plant back to life?",
      html: true,
      animation: "slide-from-top",
      confirmButtonColor: "gold",
      confirmButtonText: "Resuscitate",
      showCancelButton:true,
      closeOnCancel:true,
      cancelButtonText:"Nope",
      cancelButtonColor:"sienna",
      closeOnConfirm: true,
    },
    function(isConfirm) {
      if (isConfirm) {
        console.log("confirmed resuscitate", me);
        if(getPlayerMoney().gold < 1000) {
          popNotify("Oops!  You do not have enough money to resuscitate your plant!");
        } else {
          givePlayerMoney(playerID, {gold:-1000});
          var increment = me.stageIncrement*1-me.mods.time*1;
          gQuery({plotID:me.id, stageIncrement:increment}, fetchGarden, "resuscitate_plot");
        }
      }
    }
  );
}

Plot.prototype.mulch = function() {
  var me = this;
  swal({
      title: "Mulch this plant?",
      text: 'Are you sure you want to mulch this plant?<br />You will lose the seed and any fertilizers that you have<br />used with it, but you will get a <span style="color:sienna;font-weight:bold;" title="Mulch fertilizers are simple fertilizers that add small bonuses when planting">"Mulch"</span> fertilizer in return.<br /><br />Mulching clears this plot for replanting.',
      // imageUrl: r.src,
      html: true,
      animation: "slide-from-top",
      confirmButtonColor: "sienna",
      confirmButtonText: "Mulch",
      showCancelButton:true,
      closeOnCancel:true,
      cancelButtonText:"Nope",
      cancelButtonColor:"sienna",
      closeOnConfirm: true,
    },
    function(isConfirm) {
      if (isConfirm) {
        console.log("confirmed mulch", me);
        clearInterval(this.timeout);
        this.timeout = undefined;
        gQuery({pid:playerID, plotID:me.id, rarity:me.seed.rarity}, mulchedPlant, "mulch_plant");
      }
    }
  );
}


Plot.prototype.doMulch = function() {

}

Plot.prototype.timerTick = function() {
  // console.log(this.stageIncrement);
  this.countdown.s--;
  if (this.countdown.s == -1) {
    this.countdown.s = 59;
    this.countdown.m--;
    if (this.countdown.m == -1) {
      this.countdown.m = 59;
      this.countdown.h--;
    }
  }
  if (this.countdown.h == -1) {
    this.currentStage++;
    this.stage = this.currentStage;

    if (this.stage == this.stages) {

      //harvest is ready
      this.harvestReady = 1;
      if (playerID == userID) {
        $("#countdown_div_" + this.divID).replaceWith(createHarvestButtons());
      } else {
        $("#countdown_div_" + this.divID).remove();//just remove it if in guest view
      }
      clearInterval(this.timeout);
      this.timeout = undefined;

    } else {
      this.countdown.h = Math.floor(this.stageIncrement);
      this.countdown.m = Math.round(this.stageIncrement.split(".")[1] /100 * 60);
      this.countdown.s = 0;
      console.log("new countdown", this.countdown);
    }

  }
  var h = (this.countdown.h < 10) ? "0" + this.countdown.h : this.countdown.h;
  var m = (this.countdown.m < 10) ? "0" + this.countdown.m : this.countdown.m;
  var s = (this.countdown.s < 10) ? "0" + this.countdown.s : this.countdown.s;
  $("#countdown_h_" + this.divID).html(h);
  $("#countdown_m_" + this.divID).html(m);
  $("#countdown_s_" + this.divID).html(s);
}

Plot.prototype.water = function(owner) {
  if (owner) {
    gQuery({plotID:this.id, divID:this.divID}, plotWatered, "water_plot");
  } else {
    gQuery({plotID:this.id, divID:this.divID, guest:1, pid:playerID, fid:userID}, plotWatered, "water_plot");
  }
}



Plot.prototype.harvest = function() {
  // console.log("Harvesting Items", this);
  var countRange = Math.round(Math.random() * 100);
  var count = 0;
  for (var k in this.harvestCount) {
    count = this.harvestCount[k].split(":")[0];
    if (countRange < this.harvestCount[k].split(":")[1]) break;
  }

  var addCount = this.mods.count || 0;
  count = count*1+addCount*1;//stupid javascript string casting...

  var hItems = [];
  for (var i=0;i<count;i++) {
    var iRange = Math.round(Math.random() * 100);
    var addRare = this.mods.rarity || 0;
    iRange = iRange*1+addRare*1;
    var itemID = 0;
    for (var k in this.harvestItems) {
      itemID = this.harvestItems[k].split(":")[0];
      if (iRange < this.harvestItems[k].split(":")[1]) break;
    }
    hItems.push(itemID);
  }
  console.log("Harvest Results", hItems);
  getHarvest(hItems, this.id);
}

Plot.prototype.harvestPlant = function() {
  console.log("Harvesting Plant");
  getHarvest([this.plantHarvest], this.id);
}

Plot.prototype.harvestWithered = function() {
  console.log("Harvesting Withered Plant");
  var src = "assets/item/";
  if (this.witherFamily == 1) {
    src += this.family.toLowerCase() + "_withered_item.png";
  } else {
    src += this.plantType.toLowerCase() + "_withered_item.png";
  }
  getHarvest([], this.id, src);
}

Plot.prototype.showWheel = function() {
  // console.log("showWheel");
  if (this.plantID == 0) {
    //show the planting options

  } else {
    //show the watering/info/uproot uptions

  }
}

Plot.prototype.hideWheel = function() {
  // console.log("hideWheel");
}

Plot.prototype.empty = function() {
  //do stuff...
}
