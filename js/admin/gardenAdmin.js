var editType = undefined;

var plantObjects = [];
var currentPlant = undefined;
var fauxPlant = { //"blank" plant object for creating new plants.
                id:"000", stage_src:"", src_height:400, src_width:200,
                name:"",
                stages:3,
                stage_increment:12.00,
                stage_names:"Seed,Seedling,Juvenile",
                plant_harvest:0,
                mulch_harvest:0,
                harvest_items:"0:100",
                harvest_count:"0:10,1:50,2:80,3:100",
                level:"silver",
                family:"random",
                plant_type:"Vegetable"
              };


var seedObjects = [];
var currentSeed = undefined;
var fauxSeed = { //"blank" seed object for creating new seeds.
                id:"000", name:"", src:"",
                font_class:"",
                plant_list:"",
                description:"",
                type:"seed",
                rarity:0,
                in_market:0,
                gold:0,
                silver:2,
                plant_type:"All",
                level:"All",
                family:"",
                mutate_chance:"0",
                mutate_level:"gold",
                on_use:"grow"
}

function showPlants() { gQuery({}, buildPlants, 'admin_get_plants'); }
function showSeeds() { gQuery({}, buildSeeds, 'admin_get_seeds'); }
function showGardenStore() { gQuery({}, buildGardenStore, 'admin_get_store'); }


////////////////////////////////////////////////////////////////////////////////PLANT MANAGEMENT
function buildPlants(ob) {
  // console.log("Plants", ob);
  $("#gardenBlocks").empty();
  $("#adminTitle").html("Plant Management");
  if (ob.length == 0) { $("#gardenBlocks").append("No plants in database"); return; }
  for (var i = 0; i < ob.length; i++) {
    var plant = ob[i];

    plantObjects["plant_" + plant.id] = plant; //put it into the data array for use
    var node = $("<li/>", { id:"plant_" + plant.id, class:"item_block gridItem" });
    var imgCon = $("<div/>", {class:"item_block_image_container center", id:"ibic_" + plant.id});


    //TODO: figure out how to only show the final stage of the plant...
    var image = $("<img />", {
      "src": plant.stage_src + "?v=" + Math.random(),
      "class": "item_block_image centerHV"
    });

    var iconBlock = $("<div />", {class:"icon_block"});
    imgCon.append(iconBlock);


    var info = $("<div/>").html(plant.name + "<br />");
    var edit = $("<button/>").text("Edit");
        edit.attr({
          "onclick":"showPlantEditor("+plant.id+");",
          "class":"item_button"
        });
    var foo = $("<button/>").text("Foo?");
        foo.attr({
          "onclick":"alert('I does nothings?');",
          "class":"item_button"
        });
    var retire = $("<button/>").text("Delete");
        retire.attr({
          "onclick":"deletePlant("+plant.id+");",
          "class":"item_button"
        });
    info.append(edit, foo, retire);
    imgCon.append(image);
    node.append(imgCon, info);
    $("#gardenBlocks").append(node);
  }
}

//EDITOR
function showPlantEditor(id) {
  // console.log("showPlantEditor()");
  editType = "plant";
  pageMask.show();
  editor.show();
  editor.css("position", "absolute");
  editor.css("width", "800px");
  var plant = (id != undefined) ? plantObjects["plant_" + id] : fauxPlant;  //data object or faux

  currentPlant = jQuery.extend({}, plant);  //clone the original plant object so that we don't save faux variables
  currentPlant.tmp_src = currentPlant.stage_src;

  var imgCon = $("<div/>").attr({ "class": "item_block_image_container center", "id": "i_" + plant.id });
  var image = $("<img />").attr({ "src": plant.stage_src, "class": "item_block_image centerHV", "id":"i_" + plant.id + "_img" });
  imgCon.append(image);
  //create popup and do something cool...
  editor.append('<span class="edit_title centerH">Editing Plant #'+plant.id+'</span>');  //title
  editor.append('<button id="closeEditorButton" class="close_button" onclick="closePlantEditor();">X</button>');  //close button
  editor.append(imgCon);  //image container

  if (plant.id == "000") {
    var imageUpload = $("<form/>", { id:"imageUpload", action:"", method:"post", enctype:"multipart/form-data"});
    imageUpload.append($("<input/>", { type:"file", name:"file", id:"file", required:"required"}));
    editor.append(imageUpload);
    initPlantFileUpload();
  }

  var formBlock = $("<div/>", {id:"formBlock", "class":"form_block", style:"width:600px"});
  var form = $("<form/>", { id:"editorForm", action:'' });
      form.append($("<input/>", { type:"hidden", id:"form_type", value:"garden/plant"}));  //this determines the path auto-fill

      form.append("<br />Name: ");

      plant.name = demystify(plant.name);  //desanitize the name
      form.append($("<input/>", { id:"form_name", type:'text', placeholder:'I need a name!', name:'name', class:"input_text", value:plant.name, style:'width:318px' }));

      form.append("<br />Image Path: ");
          var srcInput = $("<input/>", { id:"form_src", type:'text', placeholder:'Where am I?!', name:'stage_src', class:"input_text", value:plant.stage_src, style:'width:270px' });
          form.append(srcInput);

      //type/font class/

      //family
      form.append("<br /><strong>Families:</strong>");
      form.append($("<button/>", { type:"button", onclick:"toggleFam()", style:"font-size:.6em;" }).html("Show/Hide Families"));
      var famDiv = $("<div/>", { id:"famDiv", style:"position:relative;display:inline-block;width:100%;height:30px;" });
      form.append(famDiv, "<br />");

      //plant_type
      var ptDD = $("<select/>", {
        id:"plantTypeDD",
        value:plant.plant_type,
        onchange:"setPlantType()"
      });
      ptDD.append($("<option/>", { value:"Vegetable" }).html("Vegetable"));
      ptDD.append($("<option/>", { value:"Flower" }).html("Flower"));
      ptDD.append($("<option/>", { value:"Shrub" }).html("Shrub"));
      ptDD.append($("<option/>", { value:"Tree" }).html("Tree"));
      ptDD.val(plant.plant_type);
      form.append("<strong>Plant Type: </strong>", ptDD);

      //level
      var lDD = $("<select/>", {
        id:"levelDD",
        value:plant.level,
        onchange:"setLevel()"
      });
      lDD.append($("<option/>", { value:"silver" }).html("Silver"));
      lDD.append($("<option/>", { value:"gold" }).html("Gold"));
      lDD.append($("<option/>", { value:"star" }).html("Star"));
      lDD.val(plant.level);
      form.append(" &nbsp; <strong>Level: </strong>", lDD);


      //stages (dropdown)
      form.append("<br />Growth Stages: ");
        var stageCountDD = $("<select/>", { id:"stageCount", value:plant.stages, onchange:"setStageCount(this)" });
        stageCountDD.append($("<option/>", { value:"3"}).html("3"));
        stageCountDD.append($("<option/>", { value:"4"}).html("4"));
        stageCountDD.append($("<option/>", { value:"5"}).html("5"));
        stageCountDD.append($("<option/>", { value:"6"}).html("6"));
        stageCountDD.val(plant.stages);
        form.append(stageCountDD);

      //stage increment (how long does each stage take?)
      form.append("&nbsp; Stage Time: ");
      form.append($("<input/>", {
        type:"input",
        style:"width:40px",
        id:"stageIncrement",
        onchange:"currentPlant.stage_increment = this.value;",
        value:plant.stage_increment,
        title:"How long to grow from one stage to the next"
      }));
      form.append('<span style="font-size:.7em;">(hours in decimal, e.g.: "12.5")');


      //stages
      form.append("<br /><strong>Stages:</strong>");

      // form.append(" Height: ")
      // form.append($("<input/>", {
      //   type:'text',
      //   id:"stageHeight_input",
      //   value:currentPlant.src_height,
      //   placeholder:"height",
      //   style:"width:40px",
      //   title:"Frame height in pixels"
      // }));
      //
      // form.append(" Width: ")
      // form.append($("<input/>", {
      //   type:'text',
      //   id:"stageWidth_input",
      //   value:currentPlant.src_width,
      //   placeholder:"width",
      //   style:"width:40px",
      //   title:"Frame width in pixels"
      // }));

      form.append($("<button/>", {
        type:'button',
        onclick:"toggleSPC()",
        style:"font-size:.6em;"
      }).html("Show/Hide Previews"))

      var spc = $("<div/>", {id:"spc"}); //stagePreviewContainer
      form.append(spc); //this will be populated dynamically


      //water/wither
      //wither item (checkbox for family or standard)
      var familyWithered = $("<input/>", {
        type:"checkbox",
        id:"witherFamily",
        value:1,
        onclick:"setWitherFamily()"
      });
      if (currentPlant.wither_family == 1) familyWithered.attr("checked", "checked");
      form.append('<strong title="Is there a wither graphic for the family?">Wither Family:</strong> ', familyWithered);



      //plant harvest item
        //item that will be harvested if they choose the plant instead of harvest items (item ID)
      var plantSelect = $("<select/>", {
        id:"plantSelect",
        value:currentPlant.plant_harvest,
        onchange:"setHP(this)"
      });
      plantSelect.append($("<option/>",{value:"0"}).html("No Plant"));
      form.append("<br /><strong>Plant Harvest:</strong> ", plantSelect);

      var mulchSelect = $("<select/>", {
        id:"mulchSelect",
        value:currentPlant.mulch_harvest,
        onchange:"setMP(this)"
      });
      mulchSelect.append($("<option/>",{value:"0"}).html("No Mulch"));
      form.append("<br /><strong>Mulch Harvest:</strong> ", mulchSelect);

      form.append("<br /><strong># Items Harvested:</strong> ");
      form.append($("<div/>",{ id:"hCountBlock", style:"display:inline; font-size:.7em;" }));

      form.append("<br /><strong>Harvest Items:</strong><br />");
      form.append($("<button/>", {
        type:"button",
        style:"font-size:.6em",
        onclick:"addHItem()"
      }).html("Add Item"));
      form.append($("<button/>", {
        type:"button",
        style:"font-size:.6em",
        onclick:"subHItem()"
      }).html("Subtract Item"));

      form.append($("<button/>", {
        type:"button",
        style:"font-size:.6em; float:right;",
        onclick:"toggleHItems()"
      }).html("Show/Hide Harvest Block"));

      // form.append("<br />");
      var harvestBlock = $("<div/>", { id:"harvestBlock", style:"width:100%; border:1px solid green;" });
      form.append(harvestBlock);




      //description
      // plant.description = br2nl(demystify(plant.description));  //desanitize the description
      // form.append('<br /><br />Description:<br />');
      //     form.append($("<textarea/>",
      //       { id:"form_description", class:"input_textarea", style:"height:100px;", placeholder:"Feel free to leave this blank", name:"description" }).append(plant.description));






      formBlock.append(form);

      //cancel button
      formBlock.append("<br /><br />");
      formBlock.append($("<button/>", { id:"cancelButton", onclick:"closePlantEditor();" }).html("Cancel"));
      formBlock.append($("<button/>", { id:"saveButton", onclick:"savePlantEditor("+id+");" }).html("Save Changes"));

      editor.append(formBlock);
      var errorMessage = $("<p/>", { id:"errorMessage", class:"error" });
      editor.append(errorMessage);
      errorMessage.hide();


      srcInput.change(function(e) { imageTarget = $(this).val(); });
      srcInput.on("input", function() { imageTarget = $(this).val(); });

      //variable initialization
      setStageCount(stageCountDD);
      setHarvestPlant();
      setMulchHarvest();
      initHarvestList();
      initPlantFamilies();
}






function toggleSPC() {
  $("#spc").toggle();
}
function toggleHItems() {
  $("#harvestBlock").toggle();
}

function setStageCount(dd) {
  var count = $(dd).val();
  currentPlant.stages = count;

  buildStagePreviews();
}


function buildStagePreviews() {
  var spc = $("#spc");
  spc.empty();

  var sCount = $("#stageCount").val();
  // console.log("Building previews for " + sCount + " stages");
  var p = currentPlant;

  var h = p.src_height/2;
  var w = p.src_width/2;
  var stageNames = p.stage_names.split(",");
  // console.log(stageNames);



  for (var i=0; i<p.stages; i++) {
    var d = $("<div/>", {style:"position:relative; border:1px solid silver; display:inline-block;"});
    // d.append($("<div/>", {style:"position:absolute; color:silver;"}).html("<strong>Stage " + (i*1+1) + "</strong>"));
    d.append($("<input/>", {
      type:"text",
      id:"sName_" + i,
      value:stageNames[i],
      placeholder:"Stage Name",
      onchange:"setStageNames()",
      style:"display:inline-block;width:75px; position:absolute; background-color:rgba(0,0,0,0);"
    }));

    var styleBase = "display:inline-block; background-repeat:no-repeat; height:" + h + "px; width:" + w + "px; background-size:" + w + "px " + h + "px;";
    //build the image preview
    var tSrc = (i==0) ? "assets/garden/plot_stage_1.png" : (i==1) ? "assets/garden/plot_stage_2.png" : currentPlant.tmp_src;

    if (i>1 && currentPlant.stage_src == "") tSrc = $('#i_000_img').attr('src');

    var tOff = (i<2) ? 0 : (i - 2) * w ; //stupid math casting
    var bgWidth = w*(p.stages-2);
    var styleFull = (i<2) ? styleBase + "background:url('"+tSrc+"') bottom center no-repeat" : styleBase + "background:url('"+tSrc+"') -" + tOff + "px 0/" + bgWidth + "px " + h + "px no-repeat"

    var con = $("<div/>", { style:styleFull });
    d.append(con);

    spc.append(d);
  }

}


function setStageNames() {
  var snames = [];
  for (var i=0; i<10; i++) {  //if any plant has more than 10 stages...I broke something...
    var input = $("#sName_" + i);
    if (input.val() == undefined) break;
    snames.push(input.val());
  }
  currentPlant.stage_names = snames.join(',');
}

function setHarvestPlant() {
  gQuery({}, buildHarvestPlant, "fetch_plant_list");
}

function buildHarvestPlant(r) {
  for (var i=0; i<r.length; i++) { $("#plantSelect").append($("<option/>",{value:r[i].id}).html(r[i].name)); }
  $("#plantSelect").val(currentPlant.plant_harvest);
}
function setHP(e) { currentPlant.plant_harvest = $(e).val(); }

function setMulchHarvest() {
  gQuery({}, buildMulchHarvest, "fetch_mulch_list");
}
function buildMulchHarvest(r) {
  for (var i=0; i<r.length; i++) { $("#mulchSelect").append($("<option/>",{value:r[i].id}).html(r[i].name)); }
  $("#mulchSelect").val(currentPlant.mulch_harvest);
}
function setMP(e) { currentPlant.mulch_harvest = $(e).val(); }


var harvestItemList = [{value:0, name:"No Item"}];
function initHarvestList() {
  harvestItemList = [{value:0, name:"No Item"}];
  //get the harvest counts from the currentPlant and break them out to display
  var hcArr = currentPlant.harvest_count.split(",");
  for (var k in hcArr) { var hc = hcArr[k].split(":"); hcArr[k] = {count:hc[0], per:hc[1]}; }
  // console.log("harvest count: ", hcArr);
  var hcBlock = $("#hCountBlock");
  var rarr = "";
  for (var i=0; i<hcArr.length; i++) {
    hcBlock.append(rarr, "<strong>" + hcArr[i].count + ":</strong>", $("<input/>", {
      id:"hcbl_" + i,
      class:"hcbl",
      style:"width:25px",
      value:hcArr[i].per,
      onchange:"setHCount()"
    }), "%");
    rarr = "&rarr;";
  }

  gQuery({}, populateHarvestList, "fetch_garden_item_list");
}
function populateHarvestList(r) {
  // console.log(r);
  for (var i=0; i<r.length; i++) {
    harvestItemList.push({value:r[i].id, name:r[i].name});
  }
  //get the harvest list from currentPlant
  var hplist = currentPlant.harvest_items.split(",");
  //rebuild internal structure
  for (var j=0; j<hplist.length; j++) {
    var thing = hplist[j].split(":");
    hplist[j] = {id:thing[0], maxP:thing[1]};
    addHItem(hplist[j]);
  }
}

function createHIDD(thisID, itemID, maxP) {
  var id = itemID || 0;
  var d = $("<div/>", { class:"hib" });
  var s = $("<select/>", {
    class:"hidd",
    id:"hidd_" + thisID,
    value:itemID,
    title:"Harvestable item",
    onchange:"setHItems()"
  });
  for (var i=0; i<harvestItemList.length; i++) {
    s.append($("<option/>", {
      value:harvestItemList[i].value
    }).html(harvestItemList[i].name));
  }
  s.val(itemID);

  var minP = ($(".himp").length > 0) ? $($(".himp")[$(".himp").length - 1]).val() *1 + 1 : 0;
  var hilp = $("<input/>", {
    type:"text",
    class:"hilp",
    style:"width:30px",
    id:"hilp_" + thisID,
    value:minP,
    title:"Minimum harvest percentile (auto-generated)\nThis number can be up to 129, though anything over 100\ncan only be reached by using fertilizer.\nThese should be the super-rare items.",
    disabled:"disabled"
  });

  var himp = $("<input/>", {
    type:"text",
    class:"himp",
    style:"width:30px",
    id:"himp_" + thisID,
    value:maxP,
    title:"Maximum harvest percentile.\nThis number can be up to 130, though anything over 100\ncan only be reached by using fertilizer.\nThese should be the super-rare items.",
    onchange:"setHItems()"
  });


  d.append(s, hilp, "-", himp, "%");
  return d;
}

function addHItem(ob) {
  var target = $("#harvestBlock");
  var hic = $(".hib").length;
  ob = ob || {id:0, maxP:100};
  var b = createHIDD(hic, ob.id, ob.maxP);
  target.append(b);
}
function subHItem() {
  var dds = $(".hib");
  var dd = dds[dds.length - 1];
  dd.remove();
  setHItems();
}
function setHItems() {
  var his = $(".hidd");
  var hip = $(".himp");
  var him = $(".hilp");
  var dbString = "", c = "";
  var pMax = -1;
  for (var i=0; i<his.length; i++) {
    $(him[i]).val(pMax*1+1);
    pMax = $(hip[i]).val();
    dbString += c + $(his[i]).val() + ":" + pMax;
    c = ",";
  }
  currentPlant.harvest_items = dbString;
}
function setHCount() {
  var hcbl = $(".hcbl");
  var dbString = "", c = "";
  for (var i=0; i<hcbl.length; i++) {
    dbString += c + i + ":" + $(hcbl[i]).val();
    c = ",";
  }
  currentPlant.harvest_count = dbString;
}




////////////////////////////////////////////////////////////////////////////////SEED MANAGEMENT
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function buildSeeds(ob) {
  // console.log("buildSeeds", ob);
  $("#gardenBlocks").empty();
  $("#adminTitle").html("Seed/Fertilizer Management");
  if (ob.length == 0) { $("#gardenBlocks").append("No seed or fertilizer records found in database"); return; }
  for (var i = 0; i < ob.length; i++) {
    var seed = ob[i];

    seedObjects["seed_" + seed.id] = seed; //put it into the data array for use
    var node = $("<li/>", { id:"seed_" + seed.id, class:"item_block gridItem" });
    var imgCon = $("<div/>", {class:"item_block_image_container center", id:"ibic_" + seed.id});

    var image = $("<img />", {
      "src": seed.src + "?v=" + Math.random(),
      "class": "item_block_image centerHV"
    });

    var iconBlock = $("<div />", {class:"icon_block"});
    imgCon.append(iconBlock);


    var info = $("<div/>").html(seed.name + "<br />");
    var edit = $("<button/>").text("Edit");
        edit.attr({
          "onclick":"showSeedEditor("+seed.id+");",
          "class":"item_button"
        });
    var foo = $("<button/>").text("Foo?");
        foo.attr({
          "onclick":"alert('I does nothings?');",
          "class":"item_button"
        });
    var retire = $("<button/>").text("Delete");
        retire.attr({
          "onclick":"deleteSeed("+seed.id+");",
          "class":"item_button"
        });
    info.append(edit, foo, retire);
    imgCon.append(image);
    node.append(imgCon, info);
    $("#gardenBlocks").append(node);
  }
}


//EDITOR
function showSeedEditor(id) {
  // console.log("showSeedEditor()");
  editType = "seed";
  pageMask.show();
  editor.show();
  editor.css("position", "absolute");
  editor.css("width", "800px");
  var seed = (id != undefined) ? seedObjects["seed_" + id] : fauxSeed;  //data object or faux

  currentSeed = jQuery.extend({}, seed);  //clone the original seed object so that we don't save faux variables
  currentSeed.tmp_src = currentSeed.src;

  var imgCon = $("<div/>").attr({ "class": "item_block_image_container center", "id": "i_" + seed.id });
  var image = $("<img />").attr({ "src": seed.src, "class": "item_block_image centerHV", "id":"i_" + seed.id + "_img" });
  imgCon.append(image);
  //create popup and do something cool...
  editor.append('<span class="edit_title centerH">Editing Seed #'+seed.id+'</span>');  //title
  editor.append('<button id="closeEditorButton" class="close_button" onclick="closeSeedEditor();">X</button>');  //close button
  editor.append(imgCon);  //image container

  if (currentSeed.id == "000") {
    var imageUpload = $("<form/>", { id:"imageUpload", action:"", method:"post", enctype:"multipart/form-data"});
    imageUpload.append($("<input/>", { type:"file", name:"file", id:"file", required:"required"}));
    editor.append(imageUpload);
    initSeedFileUpload();
  }

  var formBlock = $("<div/>", {id:"formBlock", "class":"form_block", style:"width:600px;"});
  var form = $("<form/>", { id:"editorForm", action:'' });
      form.append($("<input/>", { type:"hidden", id:"form_type", value:"garden/sf"}));  //this determines the path auto-fill

      form.append("<br />Name: ");

      currentSeed.name = demystify(currentSeed.name);  //desanitize the name
      form.append($("<input/>", { id:"form_name", type:'text', placeholder:'I need a name!', name:'name', class:"input_text", value:currentSeed.name, style:'width:318px' }));

      form.append("<br />Image Path: ");
          var srcInput = $("<input/>", { id:"form_src", type:'text', placeholder:'Where am I?!', name:'stage_src', class:"input_text", value:currentSeed.src, style:'width:270px' });
          form.append(srcInput);

      //font class (use this or the level for display purposes)

      //type (seed/fertilizer/other?)
      form.append("<br />Item Type: ");
      var tDrop = $("<select/>", {
        id:"typeDD",
        value:currentSeed.type,
        onchange:"setSeedType()"
      });
      tDrop.append($("<option/>", { value:'seed' }).html("Seed"));
      tDrop.append($("<option/>", { value:'fertilizer' }).html("Fertilizer"));
      tDrop.append($("<option/>", { value:'other' }).html("Other"));
      tDrop.val(currentSeed.type);
      form.append(tDrop, " &nbsp; ");

      //rarity
      form.append("Rarity: ");
      var rDrop = $("<select/>", {
        id:"rarityDD",
        value:currentSeed.rarity,
        onchange:"setSeedRarity()",
        style:"font-weight:bold;"
      });
      rDrop.append($("<option/>", { value:'0', style:"color:gray;font-weight:bold;" }).html("Common"));
      rDrop.append($("<option/>", { value:'1', style:"color:#00dd00;font-weight:bold;" }).html("Uncommon"));
      rDrop.append($("<option/>", { value:'2', style:"color:blue;font-weight:bold;" }).html("Rare"));
      rDrop.append($("<option/>", { value:'3', style:"color:purple;font-weight:bold;" }).html("Epic"));
      rDrop.append($("<option/>", { value:'4', style:"color:gold;font-weight:bold;" }).html("Legendary"));
      rDrop.val(currentSeed.rarity);
      form.append(rDrop, "<br />");

      //plant_type
      var ptDD = $("<select/>", {
        id:"plantTypeDD",
        value:currentSeed.plant_type,
        onchange:"setPlantType();"
      });
      ptDD.append($("<option/>", { value:"All" }).html("All"));
      ptDD.append($("<option/>", { value:"Vegetable" }).html("Vegetable"));
      ptDD.append($("<option/>", { value:"Flower" }).html("Flower"));
      ptDD.append($("<option/>", { value:"Shrub" }).html("Shrub"));
      ptDD.append($("<option/>", { value:"Tree" }).html("Tree"));
      ptDD.val(currentSeed.plant_type);
      form.append("<strong>Plant Type: </strong>", ptDD);



      //level (silver/gold/star/other?)
      var lDD = $("<select/>", {
        id:"levelDD",
        value:currentSeed.level,
        onchange:"setLevel();initSeedPlantList();"
      });
      lDD.append($("<option/>", { value:"All" }).html("All"));
      lDD.append($("<option/>", { value:"silver" }).html("Silver"));
      lDD.append($("<option/>", { value:"gold" }).html("Gold"));
      lDD.append($("<option/>", { value:"star" }).html("Star"));
      lDD.val(currentSeed.level);
      form.append(" &nbsp; <strong>Level: </strong>", lDD);


      //in_market, gold, silver
      form.append("<br /><strong>In Market: ");
      var imCB = $("<input/>", {
        type:"checkbox",
        id:"imCB",
        value:1,
        onchange:"currentSeed.in_market = ($('#imCB').is(':checked')) ? 1 : 0;"
      });
      if (currentSeed.in_market == 1) imCB.prop("checked", "checked");
      form.append(imCB);

      form.append("&nbsp; Gold ", $("<input/>", { id:"seedGold", type:"text", style:"width:45px;", value:currentSeed.gold}));
      form.append("&nbsp; Silver ", $("<input/>", { id:"seedSilver", type:"text", style:"width:45px;", value:currentSeed.silver}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////TYPE FIELDS
////////////////////////////////////////////////////////////////////////////////SEED FIELDS
      //mutate_chance
      var sFields = $("<div/>", { id:"sFields" });
        sFields.append("<strong>Mutate: ", $("<input/>", { id:"mutateChance", type:"text", style:"width:20px", value:currentSeed.mutate_chance, onchange:"currentSeed.mutate_chance = this.value;" }), "% &nbsp;");
        sFields.append(" <strong>Mutate Lvl: ");
        var mLvl = $("<select/>", {
          id:"mutateLevel",
          value:currentSeed.mutate_level,
          onchange:"setMutateLevel()"
        });
        mLvl.append($("<option/>", { value:"silver" }).html("Silver"));
        mLvl.append($("<option/>", { value:"gold" }).html("Gold"));
        mLvl.append($("<option/>", { value:"star" }).html("Star"));
        mLvl.val(currentSeed.mutate_level);
        sFields.append(" ", mLvl);


        //family
        sFields.append("<br /><strong>Families:</strong>");
        sFields.append($("<button/>", { type:"button", onclick:"toggleFam()", style:"font-size:.6em;" }).html("Show/Hide Families"));
        var famDiv = $("<div/>", { id:"famDiv", style:"position:relative;display:inline-block;width:100%;height:30px;" });
        sFields.append(famDiv, "<br />");

        //plant_list
        sFields.append("<strong>Plant List:</strong>");
        var plDrop = $("<select/>", {
          id:"seedPlantSelect",
          value:currentSeed.plant_list,
          onchange:"addSeedPlant()"
        });
        sFields.append(plDrop);
        sFields.append($("<button/>", { id:"explainSPS", type:"button", title:"'Splain Dis!!", onclick:"explain(PLANT_SEED_TYPE);" }).html("??"));
        sFields.append($("<div/>", {
          id:"plantListBlock",
          style:"width:100%; border:1px solid lightgreen;"
        }));

        // plDrop.val(currentSeed.plant_list);

      form.append(sFields);

////////////////////////////////////////////////////////////////////////////////FERTILIZER FIELDS
      var fProps = {};
      if(currentSeed.on_use != 'grow') {
        var os = currentSeed.on_use.split(",");
        for (var i=0; i<os.length; i++) {
          var v = os[i].split(":");
          fProps[v[0]] = v[1];
        }
      }
      console.log(fProps);
      var ff = $("<div/>", { id:"fFields", style:"border:1px solid lightblue; padding:2px;" });
        ff.append("<strong>Fertilizer Properties:<br />");
        //resuscitate
        //add harvest% (rarity)
        ff.append("Harvest Rarity: +", $("<input/>", { type:"text", id:"mod_rarity", placeholder:"0", style:"width:20px", value:fProps.rarity || 0}), "%");
        //add harvest#
        ff.append("<br />Harvest Count: +", $("<input/>", { type:"text", id:"mod_count", placeholder:"0", style:"width:20px", value:fProps.count || 0}));
        //subtract grow time
        ff.append("<br />Grow Time: -", $("<input/>", { type:"text", id:"mod_time", placeholder:"0", style:"width:20px", value:fProps.time || 0}), " hours (per stage)");
        //add/subtract mutate chance
        ff.append("<br />Mutate Chance: +", $("<input/>", { type:"text", id:"mod_mutate", placeholder:"0", style:"width:20px", value:fProps.mutate || 0}), "%");

        ff.append("<br /><br />TODO: add in the on_use options");

      form.append(ff);



      //////////////////////////////////////////////////////////////////////////////////////////////////////END TYPE FIELDS
      // description
      seed.description = br2nl(demystify(seed.description));  //desanitize the description
      form.append('<br /><br />Description:<br />');
          form.append($("<textarea/>",
            { id:"form_description", class:"input_textarea", style:"height:100px;", placeholder:"Feel free to leave this blank", name:"description" }).append(seed.description));



      formBlock.append(form);

      //cancel button
      formBlock.append("<br /><br />");
      formBlock.append($("<button/>", { id:"cancelButton", onclick:"closeSeedEditor();" }).html("Cancel"));
      formBlock.append($("<button/>", { id:"saveButton", onclick:"saveSeedEditor("+id+");" }).html("Save Changes"));

      editor.append(formBlock);
      var errorMessage = $("<p/>", { id:"errorMessage", class:"error" });
      editor.append(errorMessage);
      errorMessage.hide();


      srcInput.change(function(e) { imageTarget = $(this).val(); });
      srcInput.on("input", function() { imageTarget = $(this).val(); });

      //variable initialization
      initSeedPlantList();
      initPlantFamilies();
      setSeedPlantList();
      setSeedType();
      setSeedRarity();
      setFertilizerValues();
}


function setSeedType() {
  var type = $("#typeDD").val();
  var seedFields = ["sFields"];
  var fertFields = ["fFields"];
  switch(type) {
    case 'seed':
      currentSeed.type = type;
      hideFields(fertFields);
      showFields(seedFields);
    break;
    case 'fertilizer':
      currentSeed.type = type;
      hideFields(seedFields);
      showFields(fertFields);

    break;
    case 'other':
      alert("'Other' seed type is not currently defined.\nPlease choose another option or stuff breaks.");
    break;
    default:
      alert("ERROR: Cannot set type to " + type);
    break;
  }
}

function setSeedRarity() {
  var r = $("#rarityDD").val();
  currentSeed.rarity = r;
  var c = 'black';
  c = (r==0) ? "gray" : (r==1) ? "#00dd00" : (r==2) ? "blue" : (r==3) ? "purple" : "gold";
  $("#rarityDD").css('color', c);
}
function hideFields(list) {
  for (var k in list) {
    $("#" + list[k]).hide();
  }
}
function showFields(list) {
  for (var k in list) {
    $("#" + list[k]).show();
  }
}

function initSeedPlantList() {
  $("#seedPlantSelect").children().remove();
  gQuery({type:currentSeed.plant_type, level:currentSeed.level, family:currentSeed.family}, populateSeedPlantList, "get_seed_plant_list");
}

function populateSeedPlantList(r) {
  var plDD = $("#seedPlantSelect");
  // console.log("Plant List For Seed", r);
  var op = $("<option/>", {
    value:0
  }).html("Random");
  plDD.append(op);
  for (var i=0; i<r.length; i++) {
    var op = $("<option/>", {
      value:r[i].id
    }).html(r[i].name);
    plDD.append(op);
  }
}
// $("#plantListBlock");
function setSeedPlantList() {
  var list = currentSeed.plant_list;
  // console.log("setSeedPlantList", list);
  if (list == "") {
    buildSeedPlantList([]);  //clear the block
  } else {
    gQuery({plantList:list}, buildSeedPlantList, "fetch_plant_entries");
  }
}
function buildSeedPlantList(r) {
  if (r == undefined) return;  //if there is nothing, do nothing...this shouldn't happen
  //destroy and build from scratch?
  // console.log("buildSeedPlantList", r);
  var b = $("#plantListBlock");
  b.empty();
  for (var i=0; i<r.length; i++) {
    var plant = r[i];
    // console.log("building plant entry:", plant);
    var title = "Plant Name: " + plant.name
              + "\nLevel: " + plant.level
              + "\nType: " + plant.plant_type
              + "\nFamilies: " + plant.family;
    var d = $("<div/>", {
      style:"display:inline-block;margin:2px;padding:2px;border:2px solid " + levelColor(plant.level) + ";color:" + levelColor(plant.level) + ";",
      title:title

    }).html(plant.name);
    d.append($("<button/>", {
      type:"button",
      style:"background-color:red;color:white;border-radius:4px;height:24px;width:24px;",
      title:"Remove Plant",
      onclick:"removeSeedPlant(" + plant.id + ")"
    }).html("X"));
    b.append(d);
  }
}
function addSeedPlant() {
  var id = $("#seedPlantSelect").val();
  var plants = (currentSeed.plant_list != "") ? currentSeed.plant_list.split(",") : [];
  if (plants.indexOf(id) > -1 || id == 0) return; //don't add it if the plant is already on the list or if it's the placeholder
  // console.log("adding plant:", id);
  plants.push(id);
  currentSeed.plant_list = plants.join(',');
  setSeedPlantList();
}
function removeSeedPlant(id) {
  // console.log("removing:", id);
  var cSL = currentSeed.plant_list.split(",");
  for(var i=cSL.length;i>-1;i--) { if(cSL[i] == id)  cSL.splice(i,1); }
  currentSeed.plant_list = cSL.join(',');
  setSeedPlantList();
}

function setFertilizerValues() {

}

function levelColor(string) {
  return (string == 'silver') ? "silver" : (string == 'gold') ? "gold" : (string == 'star') ? "lightblue" : "purple";
}

////////////////////////////////////////////////////////////////////////////////ABSTRACT METHODS
////////////////////////////////////////////////////////////////////////////////ABSTRACT METHODS
////////////////////////////////////////////////////////////////////////////////ABSTRACT METHODS
////////////////////////////////////////////////////////////////////////////////ABSTRACT METHODS
function cItem() { return (editType == 'plant') ? currentPlant : currentSeed; }

function setLevel() {
  cItem().level = $("#levelDD").val();
  // currentPlant.level = $("#levelDD").val();
}
function setPlantType() {
  cItem().plant_type = $("#plantTypeDD").val();
  if (editType == "seed") initSeedPlantList();
}

function toggleFam() {
  $("#famDiv").toggle();
}
function initPlantFamilies() {
  gQuery({}, loadPlantFamilies, "get_plant_families");
}
function loadPlantFamilies(r) {
  var cItem = (editType == 'plant') ? currentPlant : (editType == 'seed') ? currentSeed : undefined;
  if (editType == undefined) {
    //TODO: throw an error
  }
  // console.log("families:", r);
  var d = $("#famDiv");
  //create new plant family
  var nFam = $("<input/>", {
    type:"text",
    id:"newFamily",
    onchange:"updatePlantFamilies()",
    placeholder:"New Family",
    style:"width:75px;"
  });
  d.append(nFam, " ");
  var cFams = cItem.family.split(",");
  for (var k in cFams) cFams[k] = toTitleCase(cFams[k]);  //capitalizes each word
  for (var i=0; i<r.length; i++) {
    if (r[i] == "") continue;
    var div = $("<div/>", { style:"display:inline-block;border:1px solid lightgreen;" });
    div.append(r[i]);
    var cb = $("<input/>", { id:"famcb_"+i, type:'checkbox', onchange:"updatePlantFamilies()", value:r[i], class:'famcb' });
    div.append(cb);
    if (cFams.indexOf(r[i]) > -1) { cb.prop("checked","checked"); }
    d.append(div);
  }
}


function updatePlantFamilies() {
  // console.log("updatePlantFamilies");
  var famString = "";
  var famC = "";
  var nFam = $("#newFamily");
  if (nFam.val() != "") {
    famString = nFam.val();
    famC = ",";
  }
  var fArr = $(".famcb");
  for (var i=0; i<fArr.length; i++) {
    if (!$(fArr[i]).is(":checked")) continue;
    famString += famC + $(fArr[i]).val();
    famC = ",";
  }
  // console.log("famString", famString);
  cItem().family = famString;
  if (editType == 'seed') initSeedPlantList();
}

////////////////////////////////////////////////////////////////////////////////FINALIZING
////////////////////////////////////////////////////////////////////////////////FINALIZING
////////////////////////////////////////////////////////////////////////////////FINALIZING
////////////////////////////////////////////////////////////////////////////////FINALIZING
function closePlantEditor() {
  pageMask.hide();
  editor.empty();
  editor.hide();

  editType = undefined;
  currentPlant = undefined;  //kill the clone
}

function savePlantEditor(id) {
  setHItems();
  setHCount();

  if (!validatePlantValues()) {
    //something is not valid, so we're throwing an error and halting the save until it's fixed.
    return;
  }

  $("#form_name").val(sanitize($("#form_name").val()));  //sanitize
  // $("#form_description").val(sanitize(nl2br($("#form_description").val())));  //sanitize
  //set the plant values for the database
  currentPlant.name = $("#form_name").val();
  updatePlantFamilies();


  var x = [];
  var skipList = ["tmp_src"];  //skip these values when updating the db
  for (var k in currentPlant) {
    if (skipList.indexOf(k) != -1) continue;
    x.push({name:k, value:currentPlant[k]});
  }

  // var x = $("#editorForm").serializeArray();

  console.log(x); //return;  //TODO: halt for debugging

  if (id == undefined) {  //new Item
    processPlantImage(x);
  } else {  //updating existing item
    paramQuery({"update":"garden_plant", "id":id, "values":x, "garden_admin":true}, validatePlantSave);
  }
}

function validatePlantValues() {
  var errorMsg = "";
  //check to make sure that all fields are filled
  //check to make sure that the hcbl fields are valid
  //do other stuff...

  if (errorMsg == "") { return true; } else {
    //throw the error message
    popNotify(errorMsg, 'error');
    return false;
  }

}

function deletePlant(id) {
  if (confirm("Are you ABSOLUTELY sure you want to delete this plant?\nThis will remove it, and any purchased instances from the game\nas well as removing the image from the server.")) {
    if (confirm("Just double-checking.\nYou're positive you want to delete this plant?")) {
      gQuery({id:id}, confirmPlantDeleted, "delete_plant");
    }
  }
}
function confirmPlantDeleted(r) {
  if (r != 'success') {
    console.error(r);
    alert("There was a problem.  Please see the console for the full error");
  } else {
    // alert("Seed deleted.\nYou'll need to refresh the page to see the change (sorry)");
    location.reload();
  }
}


////////////////////////////////////////////////////////////////////////////////SEED
function closeSeedEditor() {
  pageMask.hide();
  editor.empty();
  editor.hide();

  editType = undefined;
  currentSeed = undefined;  //kill the clone
}


//SAVE
function saveSeedEditor(id) {
  if (!validateSeedValues()) {
    //something is not valid, so we're throwing an error and halting the save until it's fixed.
    return;
  }

  $("#form_name").val(sanitize($("#form_name").val()));  //sanitize
  $("#form_description").val(sanitize(nl2br($("#form_description").val())));  //sanitize
  //set the plant values for the database
  currentSeed.name = $("#form_name").val();
  currentSeed.description = $("#form_description").val();

  currentSeed.silver = ($("#seedSilver").val() != "") ? $("#seedSilver").val() : 0;
  currentSeed.gold = ($("#seedGold").val() != "") ? $("#seedGold").val() : 0;

  //fertilizer properties
  if (currentSeed.type == 'fertilizer') {
    var fMods = ["rarity", "count", "time", "mutate"];
    var fString = "";
    var fsc = "";
    for (var k in fMods) {
      fString += fsc + fMods[k] + ":" + $("#mod_" + fMods[k]).val();
      fsc = ",";
    }
    currentSeed.on_use = fString;
  } else {
    currentSeed.on_use = 'grow';
  }

  updatePlantFamilies();

  var x = [];
  var skipList = ["tmp_src"];  //skip these values when updating the db
  for (var k in currentSeed) {
    if (skipList.indexOf(k) != -1) continue;
    x.push({name:k, value:currentSeed[k]});
  }

  console.log(x); //return;  //TODO: halt for debugging

  if (id == undefined) {  //new Item
    processSeedImage(x);
  } else {  //updating existing item
    paramQuery({"update":"garden_seed", "id":id, "values":x, "garden_admin":true}, validateSeedSave);
  }
}

function validateSeedValues() {
  var errorMsg = "";
  //check to make sure that all fields are filled
  //check to make sure that the hcbl fields are valid
  //do other stuff...

  if (errorMsg == "") { return true; } else {
    //throw the error message
    popNotify(errorMsg, 'error');
    return false;
  }

}


function deleteSeed(id) {
  if (confirm("Are you ABSOLUTELY sure you want to delete this seed?\nThis will remove ONLY the seed record.  It will NOT remove the image or the\nassosciated Item.\nThe image will only be removed after you delete the item\nfrom the Item Management Tab.")) {
    if (confirm("Just double-checking.\nYou're positive you want to delete this seed?")) {
      gQuery({id:id}, confirmSeedDeleted, "delete_seed");
    }
  }
}
function confirmSeedDeleted(r) {
  if (r != 'success') {
    console.error(r);
    alert("There was a problem.  Please see the console for the full error");
  } else {
    // alert("Seed deleted.\nYou'll need to refresh the page to see the change (sorry)");
    location.reload();
  }
}


function setWitherFamily() {
  var wf = $("#witherFamily").is(":checked");
  currentPlant.wither_family = (wf) ? 1 : 0;
}



////////////////////////////////////////////////////////////////////////////////GARDEN STORE
var cso = undefined;//current store object
var storeObjects = [];
var fauxListItem = {
      id:"000",
      active:0,
      title:"",
      src:"",
      special:0,
      description:"",
      items:[],
      gold:0,
      price:5.00
    }

function buildGardenStore(ob) {
  console.log("buildGardenStore: ", ob);
  $("#storeBlocks").empty();
  $("#adminTitle").html("Store Management");
  if (ob.length == 0) { $("#storeBlocks").append("No store entries in database"); return; }
  for (var i = 0; i < ob.length; i++) {
    var record = ob[i];

    storeObjects["store_" + record.id] = ob[i];//put in data array for use
    var node = $("<li/>", { id:"store_" + record.id, class:"item_block gridItem" });
    var imgCon = $("<div/>", {class:"item_block_image_container center", id:"ibic_" + record.id});

    if (record.active == 1) imgCon.addClass("greenglow");


    var image = $("<img />", {
      "src": record.src + "?v=" + Math.random(),
      "class": "item_block_image centerHV"
    });

    var iconBlock = $("<div />", {class:"icon_block"});
    imgCon.append(iconBlock);


    var info = $("<div/>").html(record.title + "<br />");
    var edit = $("<button/>").text("Edit");
        edit.attr({
          "onclick":"showStoreEditor("+record.id+");",
          "class":"item_button"
        });

    var foo = $("<div/>", {style:"width:60px;display:inline-block;text-align:center;font-size:1.2em;font-weight:bold;"}).text((record.active == 1) ? "Active" : "Inactive");
    if (record.active == 1) foo.css("color", "rgb(154,205,50)");

    var retire = $("<button/>").text("Delete");
        retire.attr({
          "onclick":"deleteStore("+record.id+");",
          "class":"item_button"
        });
    info.append(edit, foo, retire);
    imgCon.append(image);
    node.append(imgCon, info);
    $("#storeBlocks").append(node);
  }
}


function showStoreEditor(id) {
  editType = "store";
  pageMask.show();
  editor.show();
  editor.css("position", "absolute");
  editor.css("width", "800px");
  var record = (id != undefined) ? storeObjects["store_" + id] : fauxListItem;  //data object or faux

  cso = jQuery.extend({}, record);  //clone the original object so that we don't save faux variables
  // currentSeed.tmp_src = currentSeed.src;

  var imgCon = $("<div/>").attr({ "class": "item_block_image_container center", "id": "i_" + record.id });
  var image = $("<img />").attr({ "src": record.src, "class": "item_block_image centerHV", "id":"i_" + record.id + "_img" });
  imgCon.append(image);
  //create popup and do something cool...
  editor.append('<span class="edit_title centerH">Editing Store Item #'+record.id+'</span>');  //title
  editor.append('<button id="closeEditorButton" class="close_button" onclick="closeStoreEditor();">X</button>');  //close button
  editor.append(imgCon);  //image container

  if (cso.id == "000") {
    var imageUpload = $("<form/>", { id:"imageUpload", action:"", method:"post", enctype:"multipart/form-data"});
    imageUpload.append($("<input/>", { type:"file", name:"file", id:"file", required:"required"}));
    editor.append(imageUpload);
    initStoreFileUpload();
  }

  var formBlock = $("<div/>", {id:"formBlock", "class":"form_block", style:"width:600px;"});
  var form = $("<form/>", { id:"editorForm", action:'' });
      form.append($("<input/>", { type:"hidden", id:"form_type", value:"garden/store"}));  //this determines the path auto-fill

      form.append("<br /><strong>Title:</strong> ");

      cso.title = demystify(cso.title);  //desanitize the name
      form.append($("<input/>", { id:"form_title", type:'text', placeholder:'I need a title!', name:'title', class:"input_text", value:cso.title, style:'width:318px' }));

      form.append("<br /><strong>Image Path:</strong> ");
          var srcInput = $("<input/>", { id:"form_src", type:'text', placeholder:'Where am I?!', name:'stage_src', class:"input_text", value:cso.src, style:'width:270px' });
          form.append(srcInput);



      //////////////////////////////////////////////////////////////////////////////////////////////////////TYPE FIELDS
      form.append("<br /><strong>Active </strong>(available for purchase): ");
      var activeCB = $("<input/>", {
        type:"checkbox",
        id:"activeCB",
        value:1,
        onchange:"cso.active = ($('#activeCB').is(':checked')) ? 1 : 0;"
      });
      if (cso.active == 1) activeCB.prop("checked", "checked");
      form.append(activeCB);

      form.append("&nbsp; &rarr; &nbsp; <strong>Price: $");
      form.append($("<input/>", {
        type:"number",
        id:"storePrice",
        value:cso.price,
        style:"width:50px;",
        onchange:"cso.price = $('#storePrice').val();"
      }));

      form.append("<br /><strong>Special Offer </strong>: ");
      var specialCB = $("<input/>", {
        type:"checkbox",
        id:"specialCB",
        value:1,
        onchange:"cso.special = ($('#specialCB').is(':checked')) ? 1 : 0;"
      });
      if (cso.special == 1) specialCB.prop("checked", "checked");
      form.append(specialCB);

      form.append("<br /><strong>Gold with Purchase:</strong> ");
      form.append($("<input/>", {
        type:"number",
        id:"recordGold",
        value:cso.gold,
        style:"width:40px;",
        onchange:"cso.gold = $('#recordGold').val();"
      }));


      //////////////////////////////////////////////////////////////////////////ITEMS
      // form.append($("<select/>", { id:"itemPicker", onchange:"addListItem($(this).val());" }));

      form.append(getListItemDisplay());






      //////////////////////////////////////////////////////////////////////////////////////////////////////END TYPE FIELDS
      // description
      cso.description = br2nl(demystify(cso.description));  //desanitize the description
      form.append('<br /><br />Description:<br />');
          form.append($("<textarea/>",
            { id:"form_description", class:"input_textarea", style:"height:100px;", placeholder:"Feel free to leave this blank", name:"description" }).append(cso.description));



      formBlock.append(form);

      //cancel button
      formBlock.append("<br /><br />");
      formBlock.append($("<button/>", { id:"cancelButton", onclick:"closeStoreEditor();" }).html("Cancel"));
      formBlock.append($("<button/>", { id:"saveButton", onclick:"saveStoreEditor("+id+");" }).html("Save Changes"));

      editor.append(formBlock);
      var errorMessage = $("<p/>", { id:"errorMessage", class:"error" });
      editor.append(errorMessage);
      errorMessage.hide();


      srcInput.change(function(e) { imageTarget = $(this).val(); });
      srcInput.on("input", function() { imageTarget = $(this).val(); });

      initPicker();
}




var pickerItems = [];
function initPicker() {
  gQuery({}, populatePicker, 'fetch_seeds_and_fertilizers');
}
function populatePicker(r) {
  console.log("populatePicker", r);
  var picker = $("#itemPicker");
  picker.append($("<option/>", {value:0}).html("Select Item"));
  for (var i=0; i<r.length; i++) {
    picker.append($("<option/>", { value:r[i].id }).html(r[i].name));
    pickerItems[r[i].id] = r[i].name;
  }
  //populate the item list from the cso.items
  displayListItems(cso.items);
}







////////////////////////////////////////////////////////////////////////////////FINALIZING STORE EDITOR
function closeStoreEditor() {
  pageMask.hide();
  editor.empty();
  editor.hide();

  clearListItems();
  editType = undefined;
  cso = undefined;  //kill the clone
}

function saveStoreEditor() {
  if (!validateStoreValues()) {
    //something is not valid, so we're throwing an error and halting the save until it's fixed.
    return;
  }

  $("#form_title").val(sanitize($("#form_title").val()));  //sanitize
  $("#form_description").val(sanitize(nl2br($("#form_description").val())));  //sanitize
  //set the plant values for the database
  cso.title = $("#form_title").val();
  cso.description = $("#form_description").val();

  //get the store items
  var ilist = [];
  for (var i=0; i<listItems.length; i++) {
    ilist.push(listItems[i].getItemString());
  }
  cso.items = ilist.join(",");

  var x = [];
  var skipList = ["tmp_src"];  //skip these values when updating the db
  for (var k in cso) {
    if (skipList.indexOf(k) != -1) continue;
    x.push({name:k, value:cso[k]});
  }

  // console.log(x); return;  //TODO: halt for debugging

  if (cso.id == "000") {  //new Item
    processStoreImage(x);
  } else {  //updating existing item
    paramQuery({"update":"store_item", "id":cso.id, "values":x, "garden_admin":true}, validateStoreSave);
  }
}

function validateStoreValues() {
  return true;
}


function deleteStore(id) {
  if (confirm("Are you sure you want to delete this store?\nNo second chance, because my brain hurts.")) {
    gQuery({id:id}, confirmDeleteStore, 'delete_store');
  }
}
function confirmDeleteStore(r) {
  console.log(r);
  location.reload();
}


function initStoreFileUpload() {
  $(function() {
    $("#file").change(function() {
      // $("#message").empty(); // To remove the previous error message
      var file = this.files[0];
      var imagefile = file.type;
      var match= ["image/jpeg","image/png","image/jpg","image/gif"];
      if(!((imagefile==match[0]) || (imagefile==match[1]) || (imagefile==match[2]) || (imagefile==match[3]))) {
        $('#i_000_img').attr('src','');
        // $("#message").html("<p id='error'>Please Select A valid Image File</p>"+"<h4>Note</h4>"+"<span id='error_message'>Only jpeg, jpg and png Images type allowed</span>");
        return false;
      } else {
        var reader = new FileReader();
        reader.onload = function(e) {
          $('#i_000_img').attr('src', e.target.result);
          var target = "assets/" + $("#form_type").val() + "/" + file.name;
          $("#form_src").attr("value", target);
          imageTarget = target;
          cso.src = target;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });
}
function processStoreImage(ob) {
  $.ajax({
    url: "adminFunctions.php?action=imageUpload&imageTarget=" + imageTarget,
    type: "POST",             // Type of request to be send, called as method
    data: new FormData(document.getElementById("imageUpload")), // Data sent to server, a set of key/value pairs (i.e. form fields and values)
    contentType: false,       // The content type used when sending data to the server.
    cache: false,             // To unable request pages to be cached
    processData:false,        // To send DOMDocument or non processed data file it is set to false
    // contentType: "application/json; charset=utf-8",
    success: function(data) {
      if (data == "success") {
        ob.date_created = "NOW";
        paramQuery({insert:"store_item", values:ob, garden_admin:true}, validateStoreSave);
      } else { //give an error message
        console.error("this is an error?", data);
      }

    },
    error: function(error) {
      console.error(error);
    }
  });
}
function validateStoreSave(r) {
  console.log(r);
  if (r == 'success') { location.reload(); }
}

////////////////////////////////////////////////////////////////////////////////IMAGE PROCESSING

function initPlantFileUpload() {
  $(function() {
    $("#file").change(function() {
      // $("#message").empty(); // To remove the previous error message
      var file = this.files[0];
      var imagefile = file.type;
      var match= ["image/jpeg","image/png","image/jpg","image/gif"];
      if(!((imagefile==match[0]) || (imagefile==match[1]) || (imagefile==match[2]) || (imagefile==match[3]))) {
        $('#i_000_img').attr('src','');
        // $("#message").html("<p id='error'>Please Select A valid Image File</p>"+"<h4>Note</h4>"+"<span id='error_message'>Only jpeg, jpg and png Images type allowed</span>");
        return false;
      } else {
        var reader = new FileReader();
        reader.onload = function(e) {
          $('#i_000_img').attr('src', e.target.result);

          currentPlant.tmp_src = e.target.result;
          buildStagePreviews();

          //set the preview stages the same way...

          var target = "assets/" + $("#form_type").val() + "/" + file.name;
          $("#form_src").attr("value", target);

          currentPlant.stage_src = target;  //set the file path

          imageTarget = target;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });
};


function processPlantImage(ob) {
  $.ajax({
    url: "adminFunctions.php?action=imageUpload&imageTarget=" + imageTarget,
    type: "POST",             // Type of request to be send, called as method
    data: new FormData(document.getElementById("imageUpload")), // Data sent to server, a set of key/value pairs (i.e. form fields and values)
    contentType: false,       // The content type used when sending data to the server.
    cache: false,             // To unable request pages to be cached
    processData:false,        // To send DOMDocument or non processed data file it is set to false
    // contentType: "application/json; charset=utf-8",
    success: function(data) {
      if (data == "success") {
        paramQuery({insert:"garden_plant", values:ob, garden_admin:true}, validatePlantSave);
      } else { //give an error message
        console.error("this is an error?", data);
      }

    },
    error: function(error) {
      console.error(error);
    }
  });
}

function validatePlantSave(r) {
  console.log(r);
  if (r == 'success') { location.reload(); }
}


////////////////////////////////////////////////////////////////////////////////SEED
function initSeedFileUpload() {
  $(function() {
    $("#file").change(function() {
      // $("#message").empty(); // To remove the previous error message
      var file = this.files[0];
      var imagefile = file.type;
      var match= ["image/jpeg","image/png","image/jpg","image/gif"];
      if(!((imagefile==match[0]) || (imagefile==match[1]) || (imagefile==match[2]) || (imagefile==match[3]))) {
        $('#i_000_img').attr('src','');
        // $("#message").html("<p id='error'>Please Select A valid Image File</p>"+"<h4>Note</h4>"+"<span id='error_message'>Only jpeg, jpg and png Images type allowed</span>");
        return false;
      } else {
        var reader = new FileReader();
        reader.onload = function(e) {
          $('#i_000_img').attr('src', e.target.result);

          currentSeed.tmp_src = e.target.result;
          // buildStagePreviews();

          //set the preview stages the same way...

          var target = "assets/" + $("#form_type").val() + "/" + file.name;
          $("#form_src").attr("value", target);

          currentSeed.src = target;

          imageTarget = target;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });
};


function processSeedImage(ob) {
  $.ajax({
    url: "adminFunctions.php?action=imageUpload&imageTarget=" + imageTarget,
    type: "POST",             // Type of request to be send, called as method
    data: new FormData(document.getElementById("imageUpload")), // Data sent to server, a set of key/value pairs (i.e. form fields and values)
    contentType: false,       // The content type used when sending data to the server.
    cache: false,             // To unable request pages to be cached
    processData:false,        // To send DOMDocument or non processed data file it is set to false
    // contentType: "application/json; charset=utf-8",
    success: function(data) {
      if (data == "success") {
        // paramQuery({insert:"garden_seed", values:ob, garden_admin:true}, validateSeedSave);
        gQuery({values:ob}, validateSeedSave, "insert_seed");  //TODO: something?
      } else { //give an error message
        console.error("this is an error?", data);
      }

    },
    error: function(error) {
      console.error(error);
    }
  });
}

function validateSeedSave(r) {
  console.log(r);
  if (r == 'success') {
    // confirm("Seed and linked Item created.\nTo change Item values, use the Item Management tab.\nThis page will reload.");
    location.reload();
  }
}




var PLANT_SEED_TYPE = {
  title:"Plant List Selection",
  text:"Yeah, okay, so this part might seem a little complicated.  I'll 'splain.<br />"
      +""
}
