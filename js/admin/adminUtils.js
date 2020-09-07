function aQuery(ob, cb, str) { paramQuery(ob, cb, str, 'adminQuery'); }

var S_ITEM = 'item';
var S_PLAYER = 'player';

var listItems = [];
var sresTimeout = undefined;
var sResType = S_ITEM;
var s_player_callback = undefined;

var listTrophies = [];

var fauxCollection = {
  id:0,
  title:"",
  short_description:"",
  long_description:"",
  items:[],
  trophy:{id:0},
  base_price:5
}

function showSRes(target) {
  $("#sRes").css("top", (target.position().top + 20) + "px");
  $("#sRes").css("left", (target.position().left) + "px");
  $("#sRes").show();
  clearTimeout(sresTimeout);
}
function hideSRes() {
  sresTimeout = setTimeout(function(){$("#sRes").hide()}, 1000);
}

function searchType(e, type) {
  if (type == S_ITEM) {
    aQuery({string:e}, displaySearchResultBlock, 'search_items');
  } else if (type == S_PLAYER) {
    aQuery({string:e}, displaySearchResultBlock, 's_search_players');
  }
}

//this thing is a total hack right now.  Need to go back and refactor it to proper standards,
//but at the moment, I'm just going to leave it because there isn't enough coffee in the world
//to put a significant dent in this headache...
function displaySearchResultBlock(d) {
  var r = d.results;
  var type = d.type;

  var callback = (type == S_ITEM) ? 'addSpecial' : s_player_callback;

  var sRes = $("#sRes");
  sRes.empty();
  var ul = $("<ul/>");
  for (var i=0; i<r.length; i++) {
    var sr = $("<div/>", {
      class:"list_search_block"
    }).html(r[i].name);

    // sr.on('click', callback(r[i].name, r[i].id));
    sr.attr('onclick', `${callback}('${r[i].name}', '${r[i].id}')`);  //this...is dumb...but kinda funny :)

    sRes.append(sr);
  }
  if (r.length == 0) {
    sRes.html("No results found");
  }
}


function initPlayerSearchBar(target, onChange, value) {
  //target should be <input>
  s_player_callback = onChange;
  var iSearch = target;
  iSearch.attr({
    type:'text',
    id:'p_iSearch',
    placeholder:"Player name or ID"
  });
  if (value != undefined) iSearch.val(value);


  iSearch.keyup(function() { searchType(this.value, 'player'); });
  iSearch.focus(function(){showSRes(iSearch)});
  iSearch.blur(function(){hideSRes(iSearch)});

  iSearch.attr('onchange', `${onChange}($(this).val())`);  //hax...

  var sRes = $("#sRes");

  if (sRes.attr('id') == undefined) {
    sRes = $("<div/>", {
      id:"sRes",
      style:"position:absolute; z-index:1000; border:1px solid silver; background-color:rgb(240,240,240); height:auto; width:200px; max-height:150px; padding:2px; overflow-y:scroll;"
    }).html("...type to search...");
  }

  // block.append(sRes);
  sRes.insertAfter(target);
  sRes.hide();
}


function addSpecial(name, id, count) {
  var c = count || 1;
  console.log("addSpecial", name, id);
  //add the lookup to the picker
  // pickerItems[id] = name;
  var si = new ListItem({id:id, name:name, count:c});
  si.init();
  listItems.push(si);
}

function getListItemDisplay() {
  var block = $("<div/>", {id:'listItemDisplayBlock'});

  block.append("<br /><center><strong>Items</strong></center>");
  block.append("Search Items: ");
  var iSearch = $("<input/>", {
    type:"text",
    id:"iSearch",
    placeholder:"type stuff here"
  })
  iSearch.keyup(function() { searchType(this.value, 'item'); });
  iSearch.focus(function(){showSRes(iSearch)});
  iSearch.blur(function(){hideSRes(iSearch)});
  block.append(iSearch);
  block.append($("<div/>", {
    id:"seItems",
    style:"width:100%; border:1px solid black; height:100px; overflow-y:scroll; display:inline-block;"
  }));

  var sRes = $("#sRes");

  if (sRes.attr('id') == undefined) {
    sRes = $("<div/>", {
      id:"sRes",
      style:"position:absolute; z-index:1000; border:1px solid silver; background-color:rgb(240,240,240); height:auto; width:200px; max-height:150px; padding:2px; overflow-y:scroll;"
    }).html("...type to search...");
  }
  block.append(sRes);
  sRes.hide();

  return block;
}

function clearListItems() {
  $("#listItemDisplayBlock").remove();
  while (listItems[0] != undefined) {listItems[0].destroy()}//garbage collection
}

function displayListItems(thisList) {
  console.log("displayListItems", thisList);
  for (var i=0; i<thisList.length; i++) {
    var foo = thisList[i];
    var si = new ListItem({id:foo.id, name:foo.name, count:foo.count || 1});
    si.init();
    listItems.push(si);
  }
}

function addListItem(id) {
  if (id == 0) return;
  var found = false;
  for (var i=0; i<listItems.length; i++) {
    if (id == listItems[i].id) {
      found = true;
      listItems[i].count++;
    }
  }
  if (!found) {
    var si = new ListItem({id:id, name:pickerItems[id], count:1});
    si.init();
    listItems.push(si);
  }
}

function getListItemString() {
  let li = [];
  for (let i=listItems.length-1; i>-1; i--) {
    li.push(listItems[i].id);
  }
  return li.join(',');
}


//////////////////////////////////////////////////ListItem
class ListItem {
  constructor(ob) {
    this.name = ob.name || "No Name";
    this.id = ob.id || 0;
    this._count = ob.count || 1;
    this.con = undefined;
    this.cCon = undefined;
  }
  set count(v) { this._count = v; this.cCon.val(v); }
  get count() { return this._count; }
  /////////////////METHODS
  init() {
    this.con = $("<div/>", {
      id:"storeItemBlock_" + this.id,
      style:"border-radius:4px; padding:2px; background-color:silver; color:black; margin:2px; display:inline-block; position:relative;"
    });
    this.cCon = $("<input/>", {
      type:"number",
      style:"width:30px;margin-left:5px;",
      value:this.count
    })
    this.cCon.change(() => { this.count = this.cCon.val() });
    var kill = $("<button/>", {
      type:"button",
    }).html("X");
    kill.click(() => this.destroy());
    this.con.append(this.name, this.cCon, kill);
    $("#seItems").append(this.con);
  }
  destroy() {
    this.con.remove();
    listItems.splice(listItems.indexOf(this), 1)
  }
  getItemString() {
    var string = ""+this.id + ":" + this.count;
    return string;
  }
  getLongString() {
    var a = [];
    for (var i=0; i<this.count; i++) a.push(this.id);
    return a.join(",");
  }
}
