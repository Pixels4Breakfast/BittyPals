class SpinnerItem {
  constructor(ob) {
    this.id = ob.id || -1;
    this.img = ob.img || "";
    this.type = ob.type || undefined;
    this.title = ob.title || "";
    this.description = ob.description || "";
    this.value = ob.value || undefined;

    this.d_title = undefined;
    this.d_description = undefined;
    this.d_img = undefined;
    this.d_type = undefined;
    this.d_value = undefined;

    this.row = undefined;  //so I can make it more dynamic later
    this.itemNode = undefined;
    this.itemSelector = undefined;

    //binding
    this.setType = (function(a){this.doSetType(a)}).bind(this);
    this.setName = (function(a){this.doSetName(a)}).bind(this);
    this.showSearch = (function(a){this.doShowSearch(a)}).bind(this);
    this.setTitle = (function(a){this.doSetTitle(a)}).bind(this);

  }


  getDisplay() {
    //build out the damn display and return it as jQuery DOM object
    this.row = $("<tr/>");
    this.d_title = $("<input/>", { type:'text', value:this.title });
    this.d_description = $("<input/>", { type:'text', value:this.description });
    this.d_img = $("<input/>", { type:'text', value:this.img });

    this.d_type = $("<select/>", { value:this.type});
      this.d_type.append($("<option/>", {value:"xp"}).html("xp"));
      this.d_type.append($("<option/>", {value:"gold"}).html("Gold"));
      this.d_type.append($("<option/>", {value:"silver"}).html("Silver"));
      this.d_type.append($("<option/>", {value:"item"}).html("Item"));
      this.d_type.append($("<option/>", {value:"jackpot"}).html("Jackpot"));
    this.d_type.val(this.type);
    this.d_type.on('change',this.setType);

    this.d_value = $("<input/>", { type:'text', value:this.value });  //this one'll be fun...
    this.d_value.on("keyup", this.setTitle);

    var t_style = ((this.id-1)%4==0) ? "color:red" : "";
    this.row.append($("<td/>",{style:t_style}).append(this.id));
    this.row.append($("<td/>").append(this.d_title));
    this.row.append($("<td/>").append(this.d_description));
    this.row.append($("<td/>").append(this.d_img));
    this.row.append($("<td/>").append(this.d_type));
    this.itemNode = $("<td/>");
    this.itemNode.append(this.d_value);
    this.itemSelector = $("<input/>", {
        type:'text',
        style:"user-select:none; border-radius:4px; text-align:center; cursor:pointer; background-color:silver",
        title:"Click to search"
      });
    this.itemSelector.click(this.showSearch);
    this.itemNode.append(this.itemSelector);
    this.itemSelector.hide();  //default hide
    if (this.type == 'item') {
      this.getItemName(this.value);
      this.showItemSelector();
    }
    this.row.append(this.itemNode);

    return this.row;
  }

  doSetType() {
    var val = this.d_type.val();
      this.showItemSelector(false);
    switch(val) {
      case "xp":
        this.d_description.val("Experience Points");
        this.d_title.val(this.d_value.val() + " XP");
        this.d_img.val("");
      break;
      case "gold":
        this.d_description.val("Gold Coins");
        this.d_title.val(this.d_value.val());
        this.d_img.val("assets/site/coin-gold.png");
      break;
      case "silver":
        this.d_description.val("Silver Coins");
        this.d_title.val(this.d_value.val());
        this.d_img.val("assets/site/coin-silver.png");
      break;
      case "item": //the fun one
        this.showItemSelector();
        this.d_description.val("an Item");


      break;
      case "jackpot":
        this.d_description.val("the JACKPOT");
        this.d_title.val("Jackpot!");
        this.d_img.val("");
        this.d_value.val("");
      break;
      default:
        console.error("No joy?");
      break;
    }
  }

  showItemSelector(b) {
    if (b == undefined) {
      this.itemSelector.show();
      this.d_value.hide();
    } else {
      this.itemSelector.hide();
      this.d_value.show();
    }
  }

  doSetName(name) {
    this.itemSelector.val(name);
  }
  getItemName(id) {
    aQuery({id:id}, this.setName, 'get_item_name');
  }
  doShowSearch() {
    // console.log("showing search for ", this);
    showSpinnerSearch(this);
  }

  doSetTitle() {
    var value = (this.type == 'xp') ? this.d_value.val() + " XP" : this.d_value;
    this.d_title.val(value);
  }

  setItem(id, name, img) {
    this.value = id;
    this.d_value.val(id);
    this.d_img.val(img);
    this.img = img;
    this.itemSelector.val(name);
    closeSpinnerSearch();
  }

  getObject() {
    var o = {};
    o.id = this.id;
    o.title = this.d_title.val();
    o.description = this.d_description.val();
    o.img = this.d_img.val();
    o.type = this.d_type.val();
    o.value = this.d_value.val();
    return o;
  }

}

var spinnerBackground = undefined;
var spinnerCost = undefined;
var spinnerTarget = undefined;
var spinnerItems = [];

var spinnerSearchBox = undefined;
var spinnerSearchTarget = undefined;

function showSpinnerAdmin(r) {
  spinnerSearchBox = $("<div/>", {
    id:"spinnerSearchBox",
    style:"border-radius:6px;background-color:white;position:absolute;width:200px; min-height:30px; padding:4px; font-size:.8em;z-index:12000"
  });
  var spinnerSearchBar = $("<input/>", {
    id:"spinnerSearchBar",
    type:'text',
    placeholder:"Type to search"
  })
  spinnerSearchBar.on("keyup", spinnerItemSearch);

  spinnerSearchBox.append(spinnerSearchBar);
  spinnerSearchBox.append('<ul id="spinnerSearchResults" style="width:100%;list-style:none;padding:0px;margin:0px;"></ul>');
  $('body').append(spinnerSearchBox);
  spinnerSearchBox.hide();


  if (r.spinnerBackground != undefined) {
    spinnerBackground = r.spinnerBackground;
    spinnerCost = r.spinnerCost;
    $("#sw_background").val(spinnerBackground);
    for (var i=0; i<r.si.length; i++) spinnerItems.push(new SpinnerItem(r.si[i]));
    // console.log(spinnerItems);
    for (var i=0; i<spinnerItems.length; i++) spinnerTarget.append(spinnerItems[i].getDisplay());
  } else {
    console.error("No spinner record found");
  }
}


function fetchSpinnerAdmin(target) {
  spinnerTarget = target;

  aQuery({},showSpinnerAdmin, 'fetch_spinner_items');
}

function showSpinnerSearch(caller) {
  spinnerSearchTarget = caller;
  spinnerSearchBox.css("top", (caller.itemNode.offset().top + 20) + "px");
  spinnerSearchBox.css("left", (caller.itemNode.offset().left) + "px");
  spinnerSearchBox.show();
  spinnerSearchBar.focus();
  var gm = $("<div />", {id:"gmask", class:'page_mask', style:"z-index:11999;"});
  gm.on('click', closeSpinnerSearch);
  $('body').append(gm);
}
function closeSpinnerSearch() {
  spinnerSearchTarget = undefined;
  spinnerSearchBox.hide();
  $("#gmask").remove();
}


function spinnerItemSearch() {
  var s = $("#spinnerSearchBar").val();
  aQuery({string:s}, loadSpinnerItemSearchResults, 'spinner_search');
}
function loadSpinnerItemSearchResults(r) {
  var t = $("#spinnerSearchResults");
  t.empty();
  if (r.length > 0) {
    for (var i=0; i<r.length; i++) {
      var d = $("<li/>", {
        class:"list_search_block",
        onclick:`spinnerSearchTarget.setItem(${r[i].id}, '${r[i].name}', '${r[i].src}')`
      }).append(r[i].name);
      t.append(d);
    }
  } else {
    t.append("Nothing found");
  }
}


function saveSpinnerValues() {
  var sObjects = [];
  for (var i in spinnerItems) sObjects.push(spinnerItems[i].getObject());
  aQuery({prizes:sObjects}, validateSpinnerSave, 'save_spinner_prizes');
}
function validateSpinnerSave(r) {
  if (r == 'success') {
    popNotify("Spinner Prizes Saved");
  } else {
    popNotify("Something went wrong<br />Check the console", 'error');
    console.error(r);
  }
}
