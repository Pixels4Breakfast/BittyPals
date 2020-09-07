var temp;
var fauxItem = {id:"000", src:"", name:"", type:"item", palette:0, release_date:Date.now(), keywords:""};  //"blank" item object for creating new items.
var DELETEITEM = "delete_item";
var preparedSearch = ADMIN_ITEMS;
var activePlayer = 0;
var mute = 0;


                                                                                //ITEM MANAGEMENT


var itemObjects = [];  //assoc array of item data objects
var widgetObjects = undefined;
// var clu = {}; //category lookup
function initItemManagement(c) {  //DEPRACATED
  // clu = {};
  // for (var i in c) clu[c[i].id] = c[i].name;
  paramQuery(iParams, buildInventory);
}

function catchWidgetList(r) {
  console.log("WidgetList", r);
  widgetObjects = r;
}

function buildWidgetSelect(wid) {
  var s = $("<select/>", {
    id:"widgetSelect"
  });
  s.append('<option value="0">None</option>');
  for (var i=0; i<widgetObjects.length; i++) {
    var w = widgetObjects[i];
    s.append(`<option value="${w.id}">[${w.type}] ${w.data.name}</option>`);
  }
  s.val(wid);
  return s;
}

function buildInventory(ob) {
  aQuery({}, catchWidgetList, 'fetch_widget_list');
  // console.error("buildInventory(): ", ob);
  $("#itemBlocks").empty();
  for (var i = 0; i < ob.length; i++) {
    var item = ob[i];
    if (item.rowcount != undefined) {
      console.log("Rowcount: " + item.rowcount);
      rowcount = item.rowcount;
      setBreadcrumbs();
      if (rowcount == 0) $("#itemBlocks").append("Nuthin' matching those search parameters");
      continue;
    }
    itemObjects["item_" + item.id] = ob[i]; //put it into the data array for use

    $("#itemBlocks").append(new ItemBlock(item).display);

  }
}

function deleteItem(id) {
  if (confirm("Are you ABSOLUTELY sure you want to delete this item?\nThis will remove it, and any purchased instances of the item from the game\nas well as removing the image from the server.")) {
    if (confirm("Just double-checking.\nYou're positive you want to delete this item?")) {
      paramQuery({id:id}, confirmItemDeleted, DELETEITEM);
    }
  }
}
function confirmItemDeleted(r) {
  if (r != 'success') {
    console.error(r);
    alert("There was a problem.  Please see the console for the full error");
  } else {
    alert("Item deleted.\nYou'll need to refresh the page to see the change (sorry)");
  }
}


function showItemEditor(id) {
  // console.log("showItemEditor()");
  pageMask.show();
  editor.show();
  var item = (id != undefined) ? itemObjects["item_" + id] : fauxItem;  //data object or faux
  console.log(item);
  var imgCon = $("<div/>").attr({ "class": "item_block_image_container center", "id": "i_" + item.id });
  var image = $("<img />").attr({ "src": item.src, "class": "item_block_image centerHV", "id":"i_" + item.id + "_img" });
  imgCon.append(image);
  //create popup and do something cool...
  editor.append('<span class="edit_title centerH">Editing Item #'+item.id+'</span>');  //title
  editor.append('<button id="closeEditorButton" class="close_button" onclick="closeEditor();">X</button>');  //close button
  editor.append(imgCon);  //image container

  if (item.id == "000") {
    var imageUpload = $("<form/>", { id:"imageUpload", action:"", method:"post", enctype:"multipart/form-data"});
    imageUpload.append($("<input/>", { type:"file", name:"file", id:"file", required:"required"}));
    editor.append(imageUpload);
    initFileUpload();
  }



  //build editor form from data object...bloody hell, this takes forever...
  var formBlock = $("<div/>", {id:"formBlock", "class":"form_block"});
  var form = $("<form/>", { id:"editorForm", action:'' });

      form.append("<br />Name: ");
      form.append($("<input/>", { id:"form_name", type:'text', placeholder:'I need a name!', name:'name', class:"input_text", value:item.name, style:'width:150px' }));

      form.append('Type: ');
          var typeSelector = $("<select/>", { id:"form_type", name:"type", style:'font-family:"Comic Sans MS", cursive;', onchange:"checkType(this)" });
          typeSelector.append($("<option/>", { value:"pet"}).html("Pet"));
          typeSelector.append($("<option/>", { value:"habitat"}).html("Habitat"));
          typeSelector.append($("<option/>", { value:"item"}).html("Item"));
          typeSelector.append($("<option/>", { value:"effect"}).html("Effect"));
          typeSelector.val(item.type);
          form.append(typeSelector);
      if (item.type == 'habitat') {
        var habDiv = $("<div/>", {id:"habDiv", style:"border:1px solid black;"});

        habDiv.append("Rooms: ");
        habDiv.append($("<input/>", { type:"text", id:"numRooms", name:"rooms", class:"input_text", style:"width:50px;", placeholder:"", value:item.rooms }));

        habDiv.append(" Layout: ");
        // habDiv.append($("<input/>", { type:"text", id:"roomDir", name:"frame_height", class:"input_text", style:"width:50px;", placeholder:"", value:item.frame_height }));
        var layoutSelect = $("<select />", { id:"roomDir", name:"room_dir" });
            layoutSelect.append($("<option/>", { value:"h"}).html("Horizontal (default)"));
            layoutSelect.append($("<option/>", { value:"v"}).html("Vertical"));
            layoutSelect.append($("<option/>", { value:"hv"}).html("Horizontal and Vertical"));
            layoutSelect.val(item.room_dir);
        habDiv.append(layoutSelect);

        form.append(habDiv);
      }


      form.append("<br />Image Path: ");
          var srcInput = $("<input/>", { id:"form_src", type:'text', placeholder:'Where am I?!', name:'src', class:"input_text", value:item.src, style:'width:270px' });
          form.append(srcInput);



      form.append("<br />Has Palette: ");
          var paletteCheck = $("<input/>", { id:"form_palette", type:'checkbox', name:'palette', value:"1", class:'input_check' });
          if (item.palette == 1) { paletteCheck.attr("checked", "checked") };
          form.append(paletteCheck);

      form.append("Release Date: ");
          var releaseDate = $("<input/>", { id:"form_release_date", type:"text", name:"release_date", class:"input_text", value:item.release_date });
          releaseDate.datepicker({gotoCurrent:true, dateFormat:"mm-dd-yy"});
          releaseDate.datepicker("setDate", new Date(item.release_date));
          form.append(releaseDate);

      form.append("<br />Cost: ");
          form.append($("<img />", { src:"assets/site/coin-silver.png"})); form.append(": ");
          form.append($("<input/>", { id:"form_silver", type:'text', placeholder:"Why are you seeeing this?", name:"silver", value:item.silver, class:"input_text", style:"margin-right:10px; width:100px;"}));
          form.append($("<img />", { src:"assets/site/coin-gold.png"})); form.append(": ");
          form.append($("<input/>", { id:"form_gold", type:'text', placeholder:"Why are you seeeing this?", name:"gold", value:item.gold, class:"input_text", style:"width:100px;"}));

      form.append("<br />Available in Marketplace: ");
          var instoreCheck = $("<input/>", { id:"form_instore", type:'checkbox', name:'instore', value:"1", class:'input_check' });
          if (item.instore == 1) { instoreCheck.attr("checked", "checked") };
          form.append(instoreCheck);

      //garden item thingy
      form.append('<br />Garden Plant/Fertilizer: ');
          var gardenCheck = $("<input/>", { id:"form_garden", type:'checkbox', name:'garden_plant', value:"1", class:"input_check" });
          if (item.garden_plant == 1) { gardenCheck.attr("checked", "checked") };
          form.append(gardenCheck);
      //harvestable thingy
      form.append("&nbsp; Harvestable: ");
          var harvestCheck = $("<input/>", { id:"form_harvestable", type:'checkbox', name:'harvestable', value:"1", class:"input_check" });
          if (item.harvestable == 1) { harvestCheck.attr("checked", "checked") };
          form.append(harvestCheck);

      form.append("<br />Interactive: ");
          var interactiveCheck = $("<input/>", { id:"form_interactive", type:'checkbox', name:'interactive', value:"1", class:'input_check', onchange:'toggleInteractive()' });
          if (item.interactive == 1) { interactiveCheck.attr("checked", "checked") };
          form.append(interactiveCheck);
      if (item.interactive == 1) {
        //get the onactivate thingy
        form.append($("<input/>", { type:"text", id:"onActivate", name:"on_activate", class:"input_text", style:"width:200px;", placeholder:"type:valRange:coin:extra,items", value:item.on_activate }));
        form.append('<button onclick="explain(INTERACTIVE_EXP); return false;" title="\'Splain dis!">?</button>');
      }

      //sprite
      form.append("<br />Sprite: ");
          var spriteCheck = $("<input/>", { id:"form_sprite", type:'checkbox', name:'is_sprite', value:"1", class:'input_check', onchange:'toggleSprite()' });
          if (item.is_sprite == 1) { spriteCheck.attr("checked", "checked") };
          form.append(spriteCheck);
      if (item.is_sprite == 1) {
        //get the sprite stuffs
        var spriteDiv = $("<div/>", {id:"spriteDiv", style:"border:1px solid black;"});
        spriteDiv.append("#Frames: ");
        spriteDiv.append($("<input/>", { type:"text", id:"frameCount", name:"frame_count", class:"input_text", style:"width:40px;", placeholder:"0", value:item.frame_count }));

        spriteDiv.append("<br />");

        spriteDiv.append(" FrameWidth: ");
        spriteDiv.append($("<input/>", { type:"text", id:"frameWidth", name:"frame_width", class:"input_text", style:"width:50px;", placeholder:"", value:item.frame_width }));

        spriteDiv.append("<br />FrameHeight: ");
        spriteDiv.append($("<input/>", { type:"text", id:"frameHeight", name:"frame_height", class:"input_text", style:"width:50px;", placeholder:"", value:item.frame_height }));

        form.append(spriteDiv);
        // form.append('<button onclick="explain(INTERACTIVE_EXP); return false;" title="\'Splain dis!">?</button>');
      }

      form.append("<br />Widget: ");
      form.append(buildWidgetSelect(item.wid));

      //item pack
      form.append("<br />Item Pack: ");
          var packCheck = $("<input/>", { id:"form_pack", type:'checkbox', name:'is_pack', value:"1", class:'input_check', onchange:'togglePack()' });
          if (item.is_pack == 1) { packCheck.attr("checked", "checked") };
          form.append(packCheck);
      form.append($("<input/>", { type:"hidden", id:"packList", value:item.pack_list}));  //do not add 'name' attribute.  This is set at save.

      if (item.is_pack == 1) {
        // form.append('<button onclick="explain(INTERACTIVE_EXP); return false;" title="\'Splain dis!">?</button>');
        console.log("pack list", item.pack_list);
        form.append(getListItemDisplay());
        aQuery({list:item.pack_list}, displayListItems, 'get_list_items');
      }





      //categories
      form.append('<br />Categories:<br />');
          var cDiv = $("<div />", {style:"width:100%"});
          var cUL = $("<ul />", {style:"position:relative;"});
          cDiv.append(cUL);
          for (var c in clu) {
            //create checkboxes as <li>s with class 'categoryCB'
            var cli = $("<li />", {class:"gridItem", style:"margin-right:5px;"});
            var ccb = $("<input />", {type:"checkbox", class:"categoryCB", value:c});
            var icats = item.categories || '';
            if (icats.split(',').indexOf(c) > -1) ccb.attr("checked", "checked");
            cli.append(ccb).append(clu[c]);
            cUL.append(cli);
          }
          form.append(cDiv);

      //keywords
      form.append('<br />Keywords:<font size="-2">(comma-delimited list)</font><br />');
          form.append($("<textarea/>",
            { id:"form_keywords", class:"input_textarea", placeholder:"How will they find me if I don't have any keywords??", name:"keywords" }).append(prettifyCDL(item.keywords)));

      //description
      form.append('<br />Description:<font size="-2">(can be left blank)</font><br />');
          form.append($("<textarea/>",
            { id:"form_description", class:"input_textarea", placeholder:"Feel free to leave this blank", name:"description" }).append(item.description));


      // options?
      // retired

      formBlock.append(form);

      //cancel button
      formBlock.append($("<button/>", { id:"cancelButton", onclick:"closeEditor();" }).html("Cancel"));
      //save button (and database update)
      formBlock.append($("<button/>", { id:"saveButton", onclick:"saveItemEditor("+id+");" }).html("Save Changes"));

      editor.append(formBlock);
      var errorMessage = $("<p/>", { id:"errorMessage", class:"error" });
      editor.append(errorMessage);
      errorMessage.hide();


      srcInput.change(function(e) {
        imageTarget = $(this).val();
      });
      srcInput.on("input", function() {
        imageTarget = $(this).val();
      });

      typeSelector.change(function(e) {
        var basePath = "assets/" + e.target.value + "/";
        var boom = srcInput.val().split("/");
        var target = basePath + boom[boom.length-1];
        srcInput.val(target);
        imageTarget = target;
      });

}


function toggleInteractive() {
  var active = $("#form_interactive").prop('checked');
  if (active) {
    var interactiveElements = $("<input/>", { type:"text", id:"onActivate", name:"on_activate", class:"input_text", style:"width:200px;", placeholder:"type:valRange:coin:extra,items", value:"" });
    interactiveElements.insertAfter($("#form_interactive"));
    interactiveElements.after('<button onclick="explain(INTERACTIVE_EXP); return false;" title="\'Splain this!">?</button>');
  } else {
    $("#onActivate").remove();
  }
}
function toggleSprite() {
  var active = $("#form_sprite").prop('checked');
  if (active) {
    var spriteDiv = $("<div/>",{id:'spriteDiv'});
    spriteDiv.append("#Frames: ");
    spriteDiv.append($("<input/>", { type:"text", id:"frameCount", name:"frame_count", class:"input_text", style:"width:40px;", placeholder:"", value:"0" }));

    spriteDiv.append(" FrameHeight: ");
    spriteDiv.append($("<input/>", { type:"text", id:"frameHeight", name:"frame_height", class:"input_text", style:"width:50px;", placeholder:"", value:"0" }));

    spriteDiv.append(" FrameWidth: ");
    spriteDiv.append($("<input/>", { type:"text", id:"frameWidth", name:"frame_width", class:"input_text", style:"width:50px;", placeholder:"", value:"0" }));
    spriteDiv.insertAfter($("#form_sprite"));
  } else {
    $("#spriteDiv").remove();
  }
}
function checkType(e) {
  if ($(e).val() == 'habitat') {
    var habDiv = $("<div/>", {id:"habDiv", style:"border:1px solid black;"});

    habDiv.append("Rooms: ");
    habDiv.append($("<input/>", { type:"text", id:"numRooms", name:"rooms", class:"input_text", style:"width:50px;", placeholder:"", value:1 }));

    habDiv.append(" Layout: ");
    // habDiv.append($("<input/>", { type:"text", id:"roomDir", name:"frame_height", class:"input_text", style:"width:50px;", placeholder:"", value:item.frame_height }));
    var layoutSelect = $("<select />", { id:"roomDir", name:"room_dir" });
        layoutSelect.append($("<option/>", { value:"h"}).html("Horizontal (default)"));
        layoutSelect.append($("<option/>", { value:"v"}).html("Vertical"));
        layoutSelect.append($("<option/>", { value:"hv"}).html("Horizontal and Vertical"));
    habDiv.append(layoutSelect);

    habDiv.insertAfter($("#form_type"));
  } else {
    $("#habDiv").remove();
  }
}



function togglePack() {
  var active = $("#form_pack").prop('checked');
  if (active) {
    getListItemDisplay().insertAfter($("#form_pack"));
    // aQuery({list:item.pack_list}, displayListItems, 'get_list_items');
  } else {
    clearListItems();
  }
}


function closeEditor() {
  if ($("#releaseDate") != undefined) $("#releaseDate").datepicker("destroy");
  pageMask.hide();
  editor.empty();
  editor.hide();
  clearListItems();
  activePlayer = 0;
}


function saveItemEditor(id) {
  //get the categories and then remove them from the form
  var checkedCats = [];
  $(".categoryCB").each(function() {
    if ($(this).is(':checked')) checkedCats.push($(this).val());
    $(this).remove(); //cheeky
  });

  var x = $("#editorForm").serializeArray();
  console.log("saveEditor: ", x);
  //make sure default values are included for hidden forms and checkboxes
  if ($("#form_palette").prop('checked') == false) x.push({"name":"palette", "value":"0"});
  if ($("#form_instore").prop('checked') == false) x.push({"name":"instore", "value":"0"});
  if ($("#form_interactive").prop('checked') == false) x.push({"name":"interactive", "value":"0"});
  if ($("#form_sprite").prop('checked') == false) x.push({"name":"is_sprite", "value":"0"});
  if ($("#form_pack").prop('checked') == false) x.push({"name":"is_pack", "value":"0"});
  // if ($("#form_garden").prop('checked') == false) x.push({"name":"garden_item", "value":"0"});
  if ($("#form_type").val() != 'habitat') {
    x.push({"name":"rooms", "value":"1"});
    x.push({"name":"room_dir", "value":"h"});
  }

  x.push({"name":"wid", "value":$("#widgetSelect").val()});


  if ($("#form_pack").is(":checked")) {  //convert pack_list to cdlString
    var a = [];
    for (var i=0; i<listItems.length; i++) a.push(listItems[i].getItemString());
    x.push({name:"pack_list", value:a.join(',')});
  } else { x.push({name:"pack_list", value:""}); }

  if ($("#form_garden").is(":checked")) {
    //TODO: how do we handle this if this is a new item?
    //need to insert the iid for the garden_item lookup table
  } else {
    x.push({"name":"garden_plant", "value":"0"});
  }
  if ($("#form_harvestable").is(":checked")) {
    //TODO: how do we handle this if this is a new item?
    //need to insert the iid for the garden_item lookup table
  } else {
    x.push({"name":"harvestable", "value":"0"});
  }


  x.push({"name":"categories", "value":checkedCats.join(',')});

  if (id == undefined) {  //new Item
    processImage(x);
  } else {  //updating existing item
    paramQuery({"update":"item", "id":id, "values":x, "admin":true}, validateItemSave);
  }
}


function validateItemSave(response) {
  console.log(response);
  tempData = null;
  searchInventory();
  closeEditor();
}



                                                                                //CATEGORY MANAGEMENT
function openCategoryManager() {
  pageMask.show();
  editor.show();
  editor.append('<span class="edit_title centerH">Editing Categories</span>');  //title
  editor.append('<button id="closeEditorButton" class="close_button" onclick="closeCategoryManager();">X</button>');  //close button

  var formBlock = $("<div />", {"style":"position:relative; top:20px; width:100%;"});
  formBlock.append('New Category: ');
  var catInput = $("<input />", { type:"text", id:"newCatName"});
    catInput.on("keypress", function(e){
      if (e.keyCode == 13) {
        saveNewCat();
        return false;
      }
    });
  formBlock.append(catInput);
  formBlock.append('<button type="button" onclick="saveNewCat();">Save</button>');
  editor.append(formBlock);

  editor.append($("<div />", {id:"catPane", "style":"position:relative; width:594px;"}));
  paramQuery({select:["*"], table:"categories", order:["name"]}, loadCategories);
}
function loadCategories(response) {
  var pane = $("#catPane");
  pane.empty();  //for reloading
  var catList = $("<ul/>", {"position":"relative;"});

  for (var i = 0; i < response.length; i++) {
    var cat = response[i];
    var node = $("<li/>", {"class":"category_block gridItem"});
      node.append($('<div />', {id:"cat_" + cat.id + "_title_div", style:"display:inline; *display:inline;"}).append(catTitle(cat.name, cat.id)));

      node.append('<button class="item_button" onclick="deleteCat('+cat.id+');" title="Delete" style="float:right; color:red;">&#x2716;</button>');
      node.append(catEditButton(cat.id));

      catList.append(node);
  }
  pane.append(catList);
}
function closeCategoryManager() {
  pageMask.hide();
  editor.hide();
  $("#newCatName").unbind("keypress");
  editor.empty();
  searchInventory();
}
function saveNewCat() {
  var cName = $("#newCatName").val();
  paramQuery({insert:"categories", values:[{"name":"name", "value":cName}]}, catSaved);
}
function catSaved(response) {
  if (response == "success") {
    showAlert('New Category "' + $("#newCatName").val() + '" saved', GREEN);
      $("#newCatName").val("");
      paramQuery({select:["*"], table:"categories", order:["name"]}, loadCategories);
  } else {
    showAlert("Category insertion failed.  See console.", RED);
    console.error(response);
  }
}
function editCat(id) {
  $("#cat_" + id + "_title").replaceWith(catEdit($("#cat_" + id + "_title").html(), id));
  $("#cat_" + id + "_editTitle").on("keypress", function(e) { if (e.keyCode == 13) saveCat(id); });
  $("#cat_" + id + "_editButton").replaceWith(catSaveButton(id));
}
function saveCat(id) {
  var newName = $("#cat_" + id + "_editTitle").val();
  $("#cat_" + id + "_editTitle").unbind("keypress");  //just rubbing out that memory footprint
  $("#cat_" + id + "_editTitle").replaceWith(catTitle(newName, id));
  $("#cat_" + id + "_saveButton").replaceWith(catEditButton(id));
  paramQuery({"update":"categories", "id":id, "values":[ {"name":"name", "value":newName} ] }, confirmCatEdit);
}
function confirmCatEdit(response) {
  if (response == "success") {
    showAlert("Category successfully updated", GREEN);
  } else {
    showAlert("Category failed to update", RED); console.error(response);
  }
}
function catTitle(name, id) { return $("<span />", {id:"cat_" + id + "_title"}).html(name) }
function catEdit(name, id) { return $("<input />", {id:"cat_" + id + "_editTitle"}).val(name) }
function catEditButton(id) { return $("<button />", {id:"cat_" + id + "_editButton", class:"item_button", onclick:"editCat('"+id+"')", title:"Edit", style:"float:right"}).html("Pencil ;)") }
function catSaveButton(id) { return $("<button />", {id:"cat_" + id + "_saveButton", class:"item_button", onclick:"saveCat('"+id+"')", title:"Edit", style:"float:right; color:#00aa00;"}).html("&#x2713;") }


function deleteCat(id) { if (confirm("Are you sure you want to delete this category?")) { paramQuery({delete:"categories", id:id}, confirmCatDelete); } }
function confirmCatDelete(response) { if (response == "success") { paramQuery({select:["*"], table:"categories", order:["name"]}, loadCategories); } else { showAlert("Delete Failed", RED); console.error(response); }}




                                                                                //PLAYER MANAGEMENT


var pSearchLimit = 30;
function resetPlayerSearch() {
  $("#pSearch").val("");
  pSearchOffset = 0;
  searchPlayers();
}
function searchPlayers(page) {
  page = page || 1;
  var s = $("#pSearch").val();
  var offset = (page -1) * pSearchLimit;
  aQuery({string:s, limit:pSearchLimit, offset:offset}, showPlayerResults, 'search_player');
}


function showPlayerResults(r) {
  // console.log(r);
  var table = $("#playerTable");
  $("#playerTable").find("tr:gt(0)").remove();//kill all of the rows except for the first (headers)

  if (r.players.length == 0) {
    table.append('<tr><td colspan="6" style="text-align:center">No Players Found With That Search<br />Quit letting Leia type :p</td></tr>');
  } else {
    for (var i=0; i<r.players.length; i++) {
      var p = r.players[i];
      var row = $("<tr/>", { id:`prow_${p.id}` });
      row.append(`
        <td>${p.id}</td>
        <td><a href="habitat/${p.id}" style="font-weight:bold; text-decoration:none;">${p.username}</a></td>
        <td>${p.email}</td>
        <td>${p.join_date}</td>
        <td>${p.last_login}</td>
        <td><button type="button" onclick="showPlayerEditor(${p.id});">Info</button></td>
        `);

      table.append(row);
    }
  }

  buildPCrumbs(r.rowcount, r.offset);
}
function buildPCrumbs(total, offset) {
  var d = $("#bcDiv");
  d.html("Page: ");
  var pages = Math.ceil(total / pSearchLimit);
  var cPage = Math.floor(offset / pSearchLimit);
  for (var i=0; i<pages; i++) {
    var bc = $("<span/>", {
      onclick:"searchPlayers("+(i+1)+")"
    }).html(i + 1);
    d.append(bc);
  }
}



function showPlayerEditor(id) {
  console.log("showing panel for player " + id);
  activePlayer = id;
  pageMask.show();
  //build editor stuff (add to 'editor')
  editor.append('<button id="closeEditorButton" class="close_button" style="z-index:20;" onclick="closeEditor();">X</button>');  //close button
  paramQuery({prepared:PLAYERDATA, id:id}, loadPlayerData, 'prepared');
}

function loadPlayerData(p) {
  var player = p[0];
  if (typeof p[0] != 'object') {
    console.log("ERROR LOADING PLAYER DATA: ", p);
    editor.append("ERROR LOADING PLAYER DATA: <br />" + p);
  } else {
    console.log("Player object->", player);
    editor.append('<span class="edit_title centerH">Editing Player "' + player.username + '"</span>');  //title

    var dataTablePlayer = $("<table />", { style: "clear:both; position:relative; top:10px;" });

    var imgRow = $("<tr/>");
    var imgCell = $("<td/>", {rowspan:"6"});
    var avSrc = (player.use_gravatar == '1') ? getAvatar(player.md5) : player.avatar;
    imgCell.append($("<img/>", {src:avSrc, class:"avatar"}));
    imgRow.append(imgCell);
    dataTablePlayer.append(imgRow);

    dataTablePlayer.append('<tr><td>Email: <span class="simpleText stLink" style="cursor:pointer;" onclick="openEmailForm(' + player.id + ');" title="Send Email">' + player.email + '</span></td></tr>');
    dataTablePlayer.append('<tr><td>IP: <span class="simpleText">' + player.ip + '</span></td></tr>');
    dataTablePlayer.append('<tr><td>Join Date: <span class="simpleText">' + player.join_date + '</span></td></tr>');
    dataTablePlayer.append('<tr><td>Last Login: <span class="simpleText">' + player.last_login + '</span></td></tr>');
    dataTablePlayer.append('<tr><td>Last Payment: <span class="simpleText">' + player.last_payment + '</span></td></tr>');

    dataTablePlayer.append('<tr><td><strong>Total Purchases:</strong> <span class="simpleText">$' + player.total + '</span></td></tr>');

    dataTablePlayer.append('<tr><td style="text-align:center;font-weight:bold; padding-top:10px;" colspan="2">Inventory<br /><hr /></td></tr>');
    dataTablePlayer.append('<tr id="playerInventoryBase"><td colspan="2"">Total Items: '
      + player.inventory_count + '&nbsp;&nbsp;Active Items: '
      + player.active_items + '<button style="float:right;" onclick="openGiftDialog()">Send Gift</button></td></tr>');

    dataTablePlayer.append('<tr><td></td></tr><tr><td style="text-align:center;font-weight:bold; padding-top:10px;" colspan="2">Trophies<br /><hr /></td></tr>');
    dataTablePlayer.append('<tr id="trophyRow"><td id="manageTrophies" colspan="2"><button onclick="loadTrophyList()" style="float:right;">Give Trophy</button></td></tr>');
    dataTablePlayer.append('<tr><td id="trophyDisplay" colspan="2"></td></tr>');


    dataTablePlayer.append('<tr><td></td></tr><tr><td style="text-align:center;font-weight:bold; padding-top:10px;" colspan="2">Coins<br /><hr /></td></tr>');
    dataTablePlayer.append('<tr><td colspan="2">Current Wealth: <img src="assets/site/coin-gold.png"/>' + player.gold +' <img src="assets/site/coin-silver.png"/>'+player.silver+'</td></tr>');
    dataTablePlayer.append('<tr><td colspan="2">Spent in Market: <img src="assets/site/coin-gold.png"/>'
      + player.gold_spent_in_market + ' <img src="assets/site/coin-silver.png"/>'+player.silver_spent_in_market+'</td></tr>');
    dataTablePlayer.append('<tr><td colspan="2">Spent on Spinner: <img src="assets/site/coin-gold.png"/>'+player.gold_spent_on_spinner+'</td></tr>');

    editor.append(dataTablePlayer);
    editor.append("<br />");  //stupid spacing issue

    //what else are we going to want here?
    editor.append($("<button/>",{ onclick:"deletePlayer("+player.id+")"}).html("Delete Player"));

  }
  editor.show();
  paramQuery({prepared:PLAYERTROPHIES, id:player.id}, loadPlayerTrophies, 'prepared');
}

// var giftList = [];
function openGiftDialog(method) {
  var method = method || 'sendGift';
  var title = (method == undefined) ? 'Gift' : 'Send Gift to All Players';
  var gm = $("<div />", {id:"gmask", class:'page_mask', style:"z-index:11999;"});
  $('body').append(gm);
  var gd = $("<div />", {
    id:"giftDialogue",
    class:"centerHV",
    style:"overflow-y:auto; overflow-x:hidden;"
  });
  gd.append('<button id="closeEditorButton" class="close_button" style="z-index:20;" onclick="closeGiftDialog();">X</button>');
  gd.append(`<h3 style="position:absolute; text-align:center; top:-20px; width:100%;">${title}</h3>`);
  var t = $("<table />", {style:"top:20px;"});
  //gold and silver
  t.append('<tr><td colspan="2">'
    + '<img src="assets/site/coin-gold.png" />: <input type="text" id="giftGold" style="width:50px;" value="0" />'
    + '<img src="assets/site/coin-silver.png" />: <input type="text" id="giftSilver" style="width:50px;" value="0" />'
    + '</td></tr>'
    );


  t.append(getListItemDisplay());


  t.append('<tr><td colspan="2"><textarea id="giftMessage" style="height:100px; width:100%;" placeholder="Message" /></td></tr>');
  var typeDD = $("<select />", { id:'giftType' });
    typeDD.append($("<option />", { value:'gift' }).html("Gift"));
    typeDD.append($("<option />", { value:'level' }).html("Level"));
    typeDD.append($("<option />", { value:'award' }).html("Award"));
    typeDD.append($("<option />", { value:'garden' }).html("Garden"));
    typeDD.append($("<option />", { value:'store' }).html("Store"));

  t.append('<tr><td colspan="2">Type: ' + typeDD.prop('outerHTML') + '</td></tr>');
  t.append('<tr><td colspan="2">From: <input type="text" id="giftSender" value="Bitty-Pals" /></td></tr>');
  t.append(`<tr><td colspan="2"><button onclick="${method}()">Send</button>&nbsp;&nbsp;<button onclick="closeGiftDialog()">Cancel</button></td></tr>`);

  gd.append(t);
  $('body').append(gd);
  console.log("gift dialog pane open");
}


function sendGift() {
  console.log(listItems);
  // sid, rid, silver, gold, type, message, sender, gifts
  var giftList = [];
  for (var i=0; i<listItems.length; i++) giftList.push(listItems[i].getLongString());
  var sendOb = {
    sid:0,
    rid:activePlayer,
    silver:$("#giftSilver").val(),
    gold:$("#giftGold").val(),
    type:$("#giftType").val(),
    message:$("#giftMessage").val(),
    sender:$("#giftSender").val(),
    gifts:giftList.join(",").split(",")
  }
  console.log(giftList);
  giftQuery(sendOb, confirmGiftSent, 'send_system_gift');
}

function sendMassGift() {
  console.log(listItems);
  // sid, rid, silver, gold, type, message, sender, gifts
  var giftList = [];
  for (var i=0; i<listItems.length; i++) giftList.push(listItems[i].getLongString());
  var sgList = (giftList.length == 0 || (giftList.length == 1 && giftList[0] == "")) ? [] : giftList.join(",").split(",");
  var sendOb = {
    players:'all',
    sid:0,
    silver:$("#giftSilver").val(),
    gold:$("#giftGold").val(),
    type:$("#giftType").val(),
    message:$("#giftMessage").val(),
    sender:$("#giftSender").val(),
    gifts:sgList
  }
  console.log(sendOb);
  giftQuery(sendOb, confirmGiftSent, 'send_system_mass_gift');
}

function confirmGiftSent(r) {
  if (isNaN(r)) {
    console.error(r);
    showAlert("Something went wrong.  Check the console.", RED);
  } else {
    showAlert("Gift successfully sent", GREEN);
    closeGiftDialog();
  }
}
function closeGiftDialog() {
  $("#giftDialogue").remove();
  $("#gmask").remove();
  // giftList = [];
  clearListItems();
}

function loadPlayerTrophies(data) {
  var t = $("#trophyDisplay");
  if (data.length == 0) {
    t.html("No Trophies");
  } else {
    for (var i = 0; i < data.length; i++) {
      var trophy = data[i];
      var d = $("<img />",{
        src:trophy.src,
        style:"height:50px;",
        title:trophy.name + "\nEarned: " + trophy.date
      });
      t.append(d);
    }
  }
}

function loadTrophyList(cb) {
  var cb = cb || displayTrophyList;
  paramQuery({select:["*"], table:'trophy'}, cb);
}
function displayTrophyList(data) {
  console.log(data);
  var tr = $("<tr />", {id:"tempTR"});
  var td = $("<td />", {colspan:"2"});
  var tl = $("<select />", {
    id:"trophySelect"
  });
  for (var i = 0; i < data.length; i++) {
    tl.append($("<option />", { value: data[i].id }).html(data[i].name));
  }

  td.append(tl);
  td.append($("<button />", {
    onclick:"giveTrophy(activePlayer, $('#trophySelect').val())"
  }).html("Give Trophy"));
  td.append($("<button />", {
    onclick:"hideTrophyList()"
  }).html("Cancel"));
  tr.append(td);
  tr.insertAfter($("#trophyRow"));
}
function hideTrophyList() {
  $("#tempTR").remove();
}

function openTrophyDialog() {
  loadTrophyList(loadMassTrophyList);
}
function loadMassTrophyList(r) {
  console.log("trophy list", r);
  var gm = $("<div />", {id:"gmask", class:'page_mask', style:"z-index:11999;"});
  $('body').append(gm);
  var gd = $("<div />", {
    id:"giftDialogue",
    class:"centerHV",
    style:"overflow-y:auto; overflow-x:hidden; height:170px;"
  });
  gd.append('<button id="closeEditorButton" class="close_button" style="z-index:20;" onclick="closeTrophyDialog();">X</button>');
  gd.append('<h3 style="position:absolute; text-align:center; top:-20px; width:100%;">Give Trophy to All Players</h3>');
  var t = $("<div />", {style:"position:absolute; top:50px;", class:"centerH"});


  t.append("Trophies: ");
  var tdd = $("<select/>", {
    id:"trophyDD"
  });
  for (var i=0; i<r.length; i++) {
    tdd.append($("<option/>", {value:r[i].id}).html(r[i].name));
  }
  t.append(tdd);


  t.append(`<br /><br /><button onclick="sendMassTrophy()">Send</button>&nbsp;&nbsp;<button onclick="closeTrophyDialog()">Cancel</button>`);

  gd.append(t);
  $('body').append(gd);
}
function closeTrophyDialog() {
  $("#giftDialogue").remove();
  $("#gmask").remove();
  clearListItems();
}

function sendMassTrophy() {
  console.log($("#trophyDD").val());
  paramQuery({tid:$("#trophyDD").val()}, confirmMassTrophy, 'give_mass_trophy');
}
function confirmMassTrophy(r) {
  if (r != 'success') {
    popNotify("There was an error sending mass trophy.  Please check the Console", "error");
    console.warn(r);
  } else {
    popNotify("Mass Trophy Successfully Sent");
  }
}

function giveTrophy(pid, tid) {
  console.log("giveTrophy", pid, tid);
  paramQuery({insert:'trophies', values:{pid:pid, tid:tid, date:'NOW'}}, trophyGiven);
}
function trophyGiven(r) {
  if (r == "success") {
    $("#trophyDisplay").empty();
    paramQuery({prepared:PLAYERTROPHIES, id:activePlayer}, loadPlayerTrophies, 'prepared');
  } else {
    console.error(r);
  }
}

function openEmailForm(id) {
  console.log("openEmailForm->" + id);
}

function savePlayerEditor(id) {
  console.log("savePlayerEditor->"+id);
}

function validatePlayerSave(response) {
  console.log("VPS: " + response);
}

function deletePlayer(id) {
  swal({
    title:"Are you sure?",
    text:"No, seriously.  Are you sure you want to delete ALL\nof the data related to this player?\nThis action cannot be undone.",
    type:'warning',
    showCancelButton:true,
    closeOnConfirm:false,
    closeOnCancel:true,
    confirmButtonText:"DESTROY!!",
    cancelButtonText:"Meh...nah."
  }, function(conf) {
    if (conf) {
      console.log("Destroying humans...");
      paramQuery({pid:id}, confirmDeletePlayer, 'delete_player');
    }
  })
}

function confirmDeletePlayer(r) {
  if (r.split("|")[0] == 'success') {
    $("#prow_" + r.split("|")[1]).remove();
    closeEditor();
    swal("Player Deleted");
  } else {
    console.error(r);
  }
}


////////////////////////////////////////////////////////////////////////////////COLLECTIBLE PLUSHIES
var currentCollection = undefined;
function getCollectionDisplay(data, target) {
  console.log('getCollectionDisplay:', data);
  var c = $("<table/>", {
    id:'collectionTable'
  });
  c.append(`<th>TITLE</th><th>DESCRIPTION(short)</th><th>DESCRIPTION(long)</th><th>ITEMS</th><th>TROPHY</th><th>PRICE(each)</th><th>&nbsp;</th>`);
  for (var i=0; i<data.length; i++) {
    let z = data[i];
    let activeStyle = "";
    if (z.id == siteOptions.active_collection) activeStyle = "background-color:rgba(0,0,200,.3);"
    let row = $("<tr/>", {
      style:`max-height:100px;${activeStyle}`,
    });
    // row.append(`<td>${z.id}</td>`);
    row.append(`<td style="font-size:.7em">${demystify(z.title)}</td>`);
    row.append(`<td style="font-size:.7em">${demystify(z.short_description)}</td>`);
    row.append(`<td style="font-size:.7em">${demystify(z.long_description)}</td>`);
    let itemBlock = $("<td/>", { style:"width:150px;" });
    for (let x=0; x<z.itemData.length; x++) {
      let p = z.itemData[x];
      itemBlock.append(`<img src="${p.src}" style="max-height:75px; max-width:75px;" title="${p.name}"/>`);
    }
    row.append(itemBlock);
    row.append(`<td><img src="${z.trophyData.src}"/></td>`);
    row.append(`<td style="vertical-align:middle; text-align:center; font-weight:bold; font-size:2em;">$${z.base_price}</td>`);
    let actionCell = $("<td/>", {style:"vertical-align:middle"});
    actionCell.append(`<button type="button" style="width:100%;" onclick="editCollection(${z.id});">Edit</button>`);
    if (activeStyle == "") actionCell.append(`<button type="button" style="width:100%;" onclick="activateCollection(${z.id});">Activate</button>`);
    actionCell.append(`<br /><br /><button type="button" style="width:100%;" onclick="deleteCollection(${z.id});">Delete</button>`);

    row.append(actionCell);
    c.append(row);
  }

  target.append(c);
}

function newCollection() {
  openPlushieEditor(fauxCollection);
}
function editCollection(id) {
  console.log("editCollection", id);
  cQuery({id:id}, openPlushieEditor, 'fetch_collection');
}
function activateCollection(id) {
  cQuery({id:id}, confReload, 'activate_collection');
}
function deleteCollection(id) {
  console.log("deleteCollection", id);
  if (confirm(`You are about to delete this collection.\nThis action cannot be undone.\nBlow it up?`)) {
    cQuery({id:id}, confReload, 'delete_collection');
  }
}
function openPlushieEditor(r) {
  console.log("openPlushieEditor", r);
  currentCollection = r;
  let title = (r.id == 0) ? 'New Collection' : 'Edit Collection';
  let gm = $("<div />", {id:"gmask", class:'page_mask', style:"z-index:11999;"});
  $('body').append(gm);
  let gd = $("<div />", {
    id:"giftDialogue",
    class:"centerHV",
    style:"height:auto; overflow-x:hidden; width:600px;"
  });
  gd.append('<button id="closeEditorButton" class="close_button" style="z-index:20;" onclick="closeCollectionDialog();">X</button>');
  gd.append(`<h3 style="position:absolute; text-align:center; top:-20px; width:100%;">${demystify(title)}</h3>`);
  let t = $("<table />", {style:"top:20px;"});

  t.append(`<tr><td><strong>Title:</strong> <input type="text" id="collectionTitle" value="${demystify(r.title)}" style="width:490px;" />`);
  t.append("<br /><strong>Short Description:</strong><br />");
  t.append($("<textarea/>", {
    id:'collectionSD',
    style:"width:99%;height:60px;"
  }).html(br2nl(demystify(r.short_description))));
  t.append("<br /><strong>Long Description:</strong><br />");
  t.append($("<textarea/>", {
    id:'collectionLD',
    style:"width:99%;height:100px;"
  }).html(br2nl(demystify(r.long_description))));

  t.append(getListItemDisplay());
  t.append(`<tr><td><strong>Price (each): $</strong><input type="number" id="collectionPrice" value="${r.base_price}" style="width:30px;" /></td></tr>`);
  t.append(`<tr><td><strong>Trophy:</strong> <select id="trophySelect"></select></td></tr>`);
  loadTrophyList(loadCollectionTrophies);

  t.append(`<tr><td colspan="2"><button onclick="saveCollection()">Save</button>&nbsp;&nbsp;<button onclick="closeCollectionDialog()">Cancel</button><br /><br /></td></tr>`);

  gd.append(t);
  $('body').append(gd);
  displayListItems(r.items);  //must be initialized after display is appended to DOM
}

var trophyData = [];
function loadCollectionTrophies(r) {
  console.log("loadCollectionTrophies", r);
  let ts = $("#trophySelect");
  for (let i=r.length-1; i>-1; i--) {
    trophyData.push(r[i]);
    ts.append($("<option/>", { value:r[i].id }).html(r[i].name));
  }
  ts.val(currentCollection.trophy.id);
}

function saveCollection() {
  console.log("saveCollection");
  //get the info and set it up for saving
  let ob = {};
  ob.id = Number(currentCollection.id);
  ob.items = getListItemString();
  ob.trophy = Number($("#trophySelect").val());
  ob.title = sanitize($("#collectionTitle").val());
  ob.short_description = sanitize(nl2br($("#collectionSD").val()));
  ob.long_description = sanitize(nl2br($("#collectionLD").val()));
  ob.base_price = Number($("#collectionPrice").val());

  console.log("\t", ob);
  cQuery(ob, confReload, 'save_collection');
}

function closeCollectionDialog() {
  $("#giftDialogue").remove();
  $("#gmask").remove();
  clearListItems();
  currentCollection = undefined;
}

function confReload(r) {
  if (r != 'success') {
    console.error(r);
  } else {
    location.reload();
  }
}


                                                                                //UTILITY JUNK
function prettifyCDL(s) {  //prettify comma-delimited lists for the database (stripping excess whitespace, adding single spaces)
  var stripped = s.replace(/\s/g, '');
  var split = stripped.split(',');
  return split.join(", ");
}


var imageTarget = "";  //modded dynamically at item creation at when item type is changed
function processImage(itemData) {
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
        paramQuery({insert:"item", values:itemData, admin:true}, validateItemSave);
      } else { //give an error message
        console.error("this is an error?", data);
      }

    },
    error: function(error) {
      console.error(error);
    }
  });
}

  // Function to preview image after validation
function initFileUpload() {
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
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });
};

function buildAdminSearchTools() {
  //insert after $("#coinSort")  :: <input type="radio" name="bedStatus" id="allot" checked="checked" value="allot">Allot
  var adminSort = $("<div/>");
  var instoreRadios = $("<div/>").html("In Store: ");
  var isr = [{k:"Y", v:1},{k:"N", v:0},{k:"All", v:'all'}];
  for(var i=0; i<isr.length; i++) {
    instoreRadios.append(" "+isr[i].k + ":");
    var r = $("<input/>", {
      type:"radio",
      name:"s_instore",
      value:isr[i].v,
      onclick:'setInstore(this)'
    })
    if (i==2) r.prop('checked','checked');
    instoreRadios.append(r);
  }
  var interactiveRadios = $("<div/>").html("Interact: ");
  var isr = [{k:"Y", v:1},{k:"N", v:0},{k:"All", v:'all'}];
  for(var i=0; i<isr.length; i++) {
    interactiveRadios.append(" "+isr[i].k + ":");
    var r = $("<input/>", {
      type:"radio",
      name:"s_interactive",
      value:isr[i].v,
      onclick:'setInteractive(this)'
    })
    if (i==2) r.prop('checked','checked');
    interactiveRadios.append(r);
  }

  adminSort.append(instoreRadios);
  adminSort.append(interactiveRadios);
  $("#coinSort").after(adminSort);
}



                                                                                //NEWS/BLOG
function openNewsEditor() {
  tinymce.init({
    selector: '#newsText',
    allow_script_urls:true,
    menubar: 'edit insert format table tools',
    plugins: 'autolink link image textcolor colorpicker hr paste searchreplace tabfocus preview autoresize',
    toolbar: 'undo redo | cut copy paste searchreplace | forecolor bold italic underline strikethrough | alignleft, aligncenter, alignright, alignjustify | formatselect, fontselect, fontsizeselect, , bullist, numlist, preview',
    branding: false,
    init_instance_callback : function() {
      console.log("Spiffy editor is now initialized.");
      $("#editNewsPane").show(500);
    }
  });
  $("#newsSubmit").on("click", function (e) {
    e.preventDefault(); e.stopPropagation();
    if (validateNews() === true) {
      $("#newsForm").submit();
    } else {
      swal({title:"Whoops!", text:validateNews(), type:"warning"});
    }
  })
  $("#cancelNewsButton").on('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    closeNewsEditor();
  })
}
function closeNewsEditor() {
$("#editNewsPane").hide(250);
  tinymce.remove('#newsText');
  $("#newsId").val("");
  $("#newsText").html("");
  $("#newsText").val("");  //reset for tinyMCE
  $("#title").val("");
  $("#author").val("");
}
function validateNews() {
  if ($("#title").val() == "") return "You need to provide a title";
  if ($("#author").val() == "") return "Please enter the author name";
  return true;
}






//Report Stuffs
function showExcelPane() {
  console.log("ShowExcelPopup");
  pageMask.show();
  editor.show();
  editor.append('<span class="edit_title centerH">Generate Spreadsheet</span><br />');  //title
  editor.append('<button id="closeEditorButton" class="close_button" onclick="closeEditor();">X</button>');  //close button
  var dest = "window.location.assign('pullReport.php?type=";

  var pButton = $("<button/>", {
    onclick: dest + "player')"
  }).html("Player Report");

  var iButton = $("<button/>", {
    onclick: dest + "item')"
  }).html("Item Report");
  //verbose buttons
  var vpButton = $("<button/>", {
    onclick: dest + "player&verbose=true')"
  }).html("Verbose Player Report");

  var viButton = $("<button/>", {
    onclick: dest + "item&verbose=true')"
  }).html("Verbose Item Report");

  var center = $("<div/>", { style:"text-align:center; width:100%;" });
  center.append("<strong>Standard reports</strong><br />These are generated pretty quickly, and shouldn't noticably interrupt the game.  These will not tell you how many items a player has or how many items are actually in the game.<br />");
  center.append(pButton);
  center.append(iButton);

  center.append("<hr/>");

  center.append("<strong>Verbose reports</strong><br />These take a long time to execute because of the need for correlated subqueries.  If you use these, it WILL make the game unplayable for over five minutes (probably longer) while it's generating.  Don't use these too often.<br />");
  center.append(vpButton);
  center.append(viButton);





  editor.append(center);

}



////////////////////////////////////////////////////////////////////////////////FINANCIAL
var transactionRecords = [];
var tr_limit = 30;
var tr_offset = 0;
var tr_order = 'id';
var tr_dir = 'DESC';
var tr_type = 'all';

var tr_pid = undefined;
var tr_dateMin = undefined;
var tr_dateMax = undefined;
function fetchTransactionHistory(qs) {
  var quickSum = qs || false;
  transactionRecords = [];
  if (!quickSum) $("#recordList").empty();
  var params = {
      limit:tr_limit,
      offset:tr_offset,
      order:tr_order,
      dir:tr_dir
    }
  if (tr_type != 'all') params.type = tr_type;
  if (tr_pid != undefined) params.pid = tr_pid;
  if (tr_dateMin != undefined) params.dateMin = tr_dateMin;
  if (tr_dateMax != undefined) params.dateMax = tr_dateMax;
  if (quickSum == true) params.quickSum = true;
  // console.log("Search Parameters", params);
  var callback = (quickSum) ? loadTransactionSum : loadTransactionHistory;
  aQuery(params, callback, 'fetch_transaction_history');
}

function loadTransactionSum(r) {
  // console.log("QuickSum", r);
  var p = r.params;
  var d = $("<div/>",{style:"width:100%;text-align:left;"});
    d.append(`Sale Type: ${p.type || 'All'}`);
    d.append(`<br />Start Date: ${p.dateMin || 'Forever'}`);
    d.append(`<br />End Date: ${p.dateMax || 'Forever'}`);
    d.append(`<br />Player: ${p.pid || 'All'}`);

  popDisplay({
    title:`$${r.sum || 0}`,
    content:d
  })
}

function loadTransactionHistory(r) {
  // console.error("Transaction History", r);
  var dirstamp = (tr_dir == "DESC") ? '&#8679;' : '&#8681;'
  var rList = $("#recordList");
  var rowcount = r.rowcount;
  var records = r.records;
  rList.empty();
  var thr = $("<tr/>", { style: 'background:none; border-bottom:2px ridge #FAA500' });
      thr.append(`<th style="width:4%">ID</th>`);
      thr.append(`<th style="width:6%">PID</th>`);
      thr.append(`<th style="position:relative; max-width:150px;text-overflow:ellipsis;">Username</th>`);
      thr.append(`<th style="width:25%">Invoice#</th>`);
      thr.append(`<th style="width:15%;user-select:none;cursor:pointer;" title="Sort Direction" onclick="flipTransactionSort()">Date ${dirstamp}</th>`);
      thr.append(`<th style="width:12%">Type</th>`);
      thr.append(`<th style="width:8%">Amount</th>`);
  rList.append(thr);


  if (records.length > 0) {
    var total = 0;

    for (var i=0; i<records.length; i++) {
      var tr = new TransactionRecord(records[i]);
      total = total + tr.amount;
      transactionRecords.push(tr);
      tr.render();
    }
    // rowcount = r[0].rowcount;

    //do the totals
    // console.log("total: ", total);
    rList.append(`<tr><td colspan=20 style="text-align:right; padding-right:40px;"><strong>This Page Total: </strong>$${total}</td></tr>`);
  } else {
    rList.append(`<tr><td colspan=20>No Records Found</td></tr>`)
  }

  //figure out what page we're on and make something simpler than breadcrumbs
  var pageCount = Math.ceil(rowcount/tr_limit);
  var currentPage = Math.ceil((tr_offset / tr_limit) + 1);
  var sMin = tr_limit * (currentPage - 1) + 1;
  var sMax = tr_limit * (currentPage - 1) + tr_limit*1;
  if (sMax > rowcount) sMax = rowcount;
  rList.append(`<br />Showing ${sMin}-${sMax} of ${rowcount} records &nbsp;`);
  var backButton = $("<button/>", { type:"button", title:"Previous" }).html("&laquo;");
  var nextButton = $("<button/>", { type:"button", title:"Next" }).html("&raquo;");
  rList.append(backButton, nextButton);
  if (sMin > 1) {   backButton.on('click', function() { tr_offset = tr_offset - tr_limit; fetchTransactionHistory(); }); } else { backButton.attr('disabled', 'disabled'); }
  if (sMax < rowcount) { nextButton.on('click', function() { tr_offset = tr_offset + tr_limit; fetchTransactionHistory(); }); } else { nextButton.attr('disabled', 'disabled'); }

  //set up filters

  var typePicker = $("<select/>");
    typePicker.on('change', function(){tr_type = $(this).val()});
    typePicker.append(`<option value="all">All</option>`)
    typePicker.append(`<option value="gold">Gold</option>`)
    typePicker.append(`<option value="monthly">Monthly</option>`)
    typePicker.append(`<option value="collectible">Collectibles</option>`)
    typePicker.append(`<option value="store">Store</option>`);
    typePicker.append(`<option value="donation">Donation</option>`);
    typePicker.val(tr_type);
  rList.append(`<br /><br />Transaction Type: `, typePicker);

  var qLimit = $(`<input/>`, {
    type:"number",
    min:1,
    max:100,
    value:tr_limit,
    style:"width:40px;"
  })
  qLimit.val(tr_limit);
  qLimit.on('change', function(){tr_limit = $(this).val()});
  rList.append(' &nbsp; Number of results to show: ', qLimit);


  var playerSearch = $('<input/>');
  rList.append("<br />Player (ID): ", playerSearch);
  initPlayerSearchBar(playerSearch, 'setPID', tr_pid);


  var dateToSet = (tr_dateMin == undefined) ? '2016-01-02' : tr_dateMin;
  var minDate = $("<input/>", { id:"tr_minDate", type:"text", name:"minDate", class:"input_text" });
  minDate.datepicker({gotoCurrent:true, dateFormat:"yy-mm-dd"});
  minDate.datepicker("setDate", new Date(dateToSet));
  minDate.on('change', function(){tr_dateMin = $(this).val()});
  rList.append(`<br />Start Date: `, minDate);

  var mDate = new Date(tr_dateMax) || new Date();

  var maxDate = $("<input/>", { id:"tr_maxDate", type:"text", name:"maxDate", class:"input_text" });
  maxDate.datepicker({gotoCurrent:true, dateFormat:"yy-mm-dd"});
  maxDate.datepicker("setDate", mDate);
  maxDate.on('change', function(){tr_dateMax = $(this).val()});
  rList.append(`<br />End Date: `, maxDate);

  rList.append(`<br /><button type="button" onclick="fetchTransactionHistory()">Fetch Records</button>`);
  rList.append(` &nbsp; <button type="button" onclick="fetchTransactionHistory(true)">Fetch Quick Sum</button>`);

}

function flipTransactionSort() {
  tr_dir = (tr_dir == "DESC") ? "ASC" : "DESC";
  fetchTransactionHistory();
}

function setPID(name, id) {
  // console.log("setPID::", name, id);
  if (name == undefined || name == '') {
    tr_pid = undefined;
    return;
  }
  if (id == undefined) {
    tr_pid = undefined;
    //check to see if the player id is being manually entered
    tr_pid = (!isNaN(name)) ? name : undefined;
  } else {
    tr_pid = id;
    $("#p_iSearch").val(id);
  }

}



class TransactionRecord {
  constructor(r) {
    this._id = r.id || 0;// id
    this._pid = r.pid || 0;// pid
    this._username = r.username || "Unknown";
    this._invoice = r.invoice || "Unknown";// invoice
    this._date = r.date || "Not Recorded";// date
    this._type = r.type || "Unknown";// type
    this._amount = r.amount || 0;// amount

    this._email = r.email || "Unknown";

    this.target = $("#recordList");


    this.row = $("<tr/>", { id: `tRow_${this.id}` });
    this.display = {
      id:$("<td/>"),
      pid:$("<td/>", {onclick:`document.location='habitat/${this._pid}'`, title:"Go to player habitat"}).html(this._pid),
      username:$("<td/>", { onclick:`showPlayerEditor(${this._pid})`, title:"Open Player Editor"}).html(this._username),
      invoice:$("<td/>", { title: "Show transaction details" }),
      date:$("<td/>", { style: "font-size:.8em" }),
      type:$("<td/>"),
      amount:$("<td/>")//,
      // email:$("<div/>")
    }


    var row = this.row;
    Object.entries(this.display).forEach(
      ([key, val]) => {
        val.addClass(key);
        row.append(val);
      }
    )

  }
  get id()          { return this._id; }
  get pid()         { return this._pid; }
  get username()    { return this._username; }
  get invoice()     { return this._invoice; }
  get date()        { return this._date; }
  get type()        { return this._type; }
  get amount()      { return Number(this._amount); }
  get email()       { return this._email; }

  set id(v)         { this.display['id'].html(v); }
  set pid(v)        { this.display['pid'].html(v); }
  set username(v)   { this.display['username'].html(v); }
  set invoice(v)    { this.display['invoice'].html(v); }
  set date(v)       { this.display['date'].html(v); }
  set type(v)       { this.display['type'].html(v); }
  set amount(v)     { this.display['amount'].html(`$${v}`); }
  set email(v)      { this.display['email'].html(v); }



  render() {
    // console.log(this);
    this.id = this.id;
    this.pid = this.pid;
    this.username = this.username;
    this.invoice = this.invoice; this.display.invoice.on('click', () => {aQuery({invoice:this._invoice, type:this._type, date:this._date, username:this._username}, showTransactionInformation, 'fetch_transaction_details')});
    this.date = this.date;
    this.type = this.type;
    this.amount = this.amount;
    // this.email = this.email;
    this.target.append(this.row);
    // console.log(this);
  }



}

function showTransactionInformation(r) {
  if (r.serial == undefined) {
    popDisplay({title:`ERROR`, content:r});
    return;
  }
  var date = r.date;
  var type = r.type;
  var serial = r.serial;
  var gift = r.gift;
  var username = r.username;
  var giftCon = $("<div/>", {style:'width:400px;'});
  if (gift.id != undefined) {
    giftCon.append("<br /><strong>Gift Sent:</strong><hr />");
    giftCon.append(`<div style="position:relative; display:table-cell;width:200px; text-align:left;"><strong>Send Verified:</strong> ${(serial.verified == 0) ? "No" : "Yes"}</div>`);
    giftCon.append(`<div style="position:relative; display:table-cell;width:200px; text-align:right;"><strong>Opened:</strong> ${(gift.gotten == 0) ? "No" : "Yes"}</div>`);
    var giftList = $("<div/>", {
        id:"transactionGiftList",
        style:"width:100%;"
      });
    giftList.append(serial.cart.split(",").sort().join(", "));
    th_cartList = serial.cart.split(",").sort();

    aQuery({list:serial.cart}, showTransactionGiftList, "get_item_names");

    giftCon.append(giftList);
  } else {
    giftCon.append(gift);
  }

  var container = $('<div/>', {style:'width:400px; text-align:left;'});
  container.append(`<div style="position:relative; display:table-cell;width:200px;"><img src="assets/site/coin-gold.png" /> ${serial.gold}</div>`);
  container.append(`<div style="position:relative; display:table-cell;width:200px; text-align:right; font-weight:bold">$ ${serial.usd} ${type}</div>`);

  var c2 = $('<div/>', {style:'width:400px; text-align:left;'});
  c2.append(`<div style="position:relative; display:table-cell;width:200px;"><strong>Player: </strong>${username}</div>`);
  c2.append(`<div style="position:relative; display:table-cell;width:200px; text-align:right;">${date}</div>`);

  container.append(c2);
  //gift
  container.append(giftCon);

  popDisplay({
    title:`Transaction ${serial.invoice}`,
    content:container,
    contentWidth:400
  }, function(b) {
    console.log("This is a callback");
  }, function(c) {
    console.log("This is the onClose");
    th_cartList = undefined;
  })
}

var th_cartList = undefined;
function showTransactionGiftList(r) {
  // console.log(r);
  //collate data with list
  var list = th_cartList;  //because I don't want to keep typing it...yeah.  Lazy programmer.
  var disp = $("<p/>");
  var target = $("#transactionGiftList");
  var dList = [];
  for (var i=0; i<list.length; i++) {
    if (dList[list[i]] == undefined) {
      var itemName = undefined;
      for (var ri=0; ri<r.length; ri++) {
        if (r[ri].id == list[i]) {
          itemName = r[ri].name;
          break;
        }
      }
      dList[list[i]] = {name:itemName, count:1}
    } else {
      dList[list[i]].count++;
    }
  }
  for (var k in dList) {
    disp.append(`${dList[k].name} (${dList[k].count}), `);
  }
  target.append(disp);

}

function showBGAdmin() {
  aQuery({}, displayBGManager, 'get_site_bg');
}
function displayBGManager(r) {
  const content = $('<div/>');
  content.append(`<strong>Current Background Image:</strong> ${r}<br />`);
  const imageUpload = $("<form/>", { id:"imageUpload", action:"adminFunctions.php?action=imageUpload&type=bg", method:"post", enctype:"multipart/form-data"});
  imageUpload.append($("<input/>", { type:"file", name:"file", id:"file", required:"required"}));
  content.append(imageUpload);

  popDisplay({
    title:"Site Background Image",
    content:content,
    contentWidth:600,
    contentHeight:100,
    showConfirm:true,
    showCancel:true,
    confirmButtonText:'Save',
    cancelButtonText:'Cancel'
  }, () => { $('#imageUpload').submit() });
  $('#file').change(function() {
    $('#imageUpload').attr('action', `adminFunctions.php?action=imageUpload&type=bg&imageTarget=./assets/site/${this.files[0].name}`);
  })
}

function showMonthlyManager() {
  //this is the intialization piece
  aQuery({}, displayMonthlyManager, 'get_monthly_info');
}

function displayMonthlyManager(r) {
  console.log(r);

  var content = $("<div/>");

  var trophyBlock = $("<div/>", {
    style:"position:relative; width:50%; text-align:left; display:table-cell;"
  });
  trophyBlock.append("Current Trophy:<br />");
  trophyBlock.append(`${r.name}<br /><img id="monthlyPreview" src="${r.monthly_src}" /><br />`);

  trophyBlock.append("Trophy:<br />");
  var tSelect = $("<select/>", {
    onchange:"selectMonthlyTrophy(this)"
  });
  for (var i=0; i<r.trophies.length; i++) tSelect.append(`<option value="${r.trophies[i].src}">${r.trophies[i].name}</option>`);
  tSelect.val(r.monthly_src);
  content.append(trophyBlock.append(tSelect));

  var itemBlock = $("<div/>", {
    style:"position:relative; width:50%; text-align:left; display:table-cell;"
  });
  itemBlock.append("Current Item:<br />");
  itemBlock.append(`${r.item.name}<br /><img id="monthlyItemPreview" style="max-height:200px;" src="${r.item.src}" /><br />`);

  itemBlock.append("Item:<br />");
  var iSelect = $("<select/>", {
    onchange:"selectMonthlyItem(this)"
  });
  for (var j=0; j<r.items.length; j++) iSelect.append(`<option value="${r.items[j].id}:${r.items[j].src}">${r.items[j].name}</option>`);
  iSelect.val(`${r.item.id}:${r.item.src}`);
  content.append(itemBlock.append(iSelect));



  popDisplay({
    title:"Monthly Trophy",
    content:content,
    contentWidth:600,
    contentHeight:300,
    showConfirm:true,
    showCancel:true,
    confirmButtonText:'Save',
    cancelButtonText:'Cancel'
  }, saveMonthlyManager);

}
var monthlySrc = "";
function selectMonthlyTrophy(e) {
  // console.log("selecting ", $(e).val());
  monthlySrc = $(e).val();
  $("#monthlyPreview").attr('src', monthlySrc);
}
var monthlyItem = 0;
function selectMonthlyItem(e) {
  // console.log("selecting item ", $(e).val());
  monthlyItem = $(e).val().split(":")[0];
  var mip = $("#monthlyItemPreview");
  mip.attr('src', $(e).val().split(":")[1]);
  mip.css('pointer-events', 'none');
  mip.css('max-width', '150px');
}
function saveMonthlyManager() {
  // console.log("confirmed");
  if (monthlySrc == "" || monthlyItem == 0) {
    popNotify("Invalid Monthly Selection<br/>Please select changes or cancel", 'error');
  } else {
    aQuery({src:monthlySrc, id:monthlyItem}, verifyMonthlyUpdate, 'save_monthly_info');
    closePopup();
  }
}
function verifyMonthlyUpdate(r) {
  if (r != 'success') {
    console.error(r);
  } else {
    popNotify("Monthly Trophy and Badge successfully updated");
  }
}


function activateMaintenance() {
  let mstart = $("#maint_start").val();
  let mend = $("#maint_end").val();
  aQuery({start:mstart, end:mend}, confirmMaintenance, 'activate_maintenance');
}
function deactivateMaintenance() {
  aQuery({}, confirmMaintenance, 'deactivate_maintenance');
}
function confirmMaintenance(r) {
  console.log(r);
  if (r.status == 'success') {
    if (r.type == 'activate') {
      $("#maintenance").prop('checked', true);
      popNotify("Maintenance schedule successfully updated");
    } else {
      $("#maintenance").prop('checked', false);
      popNotify("Maintenance deactivated");
    }
  } else {

  }
}
