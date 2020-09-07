
var cCat = null;
var cSearch = null;
var cDir = "DESC";
var cCoin = null;
var cSort = "date_purchased";
var cOffset = 0;
var cInstore = null;
var cInteractive = null;
var cLimit = 20;
var cPage = 0;
var cID = null;
var rowcount = 0;
var clu = {};

function searchInventory() {
  // console.log("searchInventory --> cLimit: " + cLimit);
  if (currentPage == null) {
    return;
  } else {
    if ((currentPage == "market" || currentPage == "admin") && cSort == 'date_purchased') cSort = "release_date";
  }
  var term = $("#searchField").val();
  if (term == "") term = null;
  cSearch = term || null;
  setLowerTitle();
  var params = { prepared:preparedSearch };
  if (cCat != null) params.category = cCat;
  if (cSearch != null) params.search = cSearch;
  if (cCoin != null) params.coin = cCoin;
  if (cInstore != null) params.instore = cInstore;
  if (cInteractive != null) params.interactive = cInteractive;
  if (cSort != null) { params.sort = cSort; params.dir = cDir; }
  if (cID != null) params.id = cID;
  if (cOffset != null) params.offset = cOffset;
  if (cLimit != null) params.limit = cLimit;
  if (cCat!=null||cSearch!=null||cCoin!=null) params.filter = 1;
  // console.log("params:", params);
  inventoryQuery(params, buildInventory, preparedSearch);
}

function setBreadcrumbs() {
  var bc = $(".bc_nav");
  bc.empty();
  bc.append("Page: ");
  var pages = Math.ceil(rowcount / cLimit);
  // console.log("BC::pages: " + pages);

  var pageArray = [];
  if (pages > 25) {
    pageArray.push(0,1,2,3,4,5,6,7,8,9);
    if (cPage < 9) {
      pageArray.push('...', pages);
    } else {
      if (cPage > 10) pageArray.push('...');
      if (cPage > 11) pageArray.push(Number(cPage-2));
      if (cPage > 12) pageArray.push(Number(cPage-1));

      // console.log("cPage: " + cPage + ", pages: " + pages);

      if (cPage != 9 && cPage != pages) pageArray.push(cPage);
      if (Number(cPage +1) <= Number(pages -1)) pageArray.push(Number(cPage +1));
      if (Number(cPage +2) <= Number(pages -1)) pageArray.push(Number(cPage +2));
      if (Number(cPage +3) <= Number(pages -1)) {
        pageArray.push('...', pages);
      } else {
        pageArray.push(pages);
      }
    }
  } else {
    for (var n = 0; n < Number(pages); n++) pageArray.push(n);
  }

  //Previous button
  if (cPage > 0) {
    bc.append($("<span/>", {
      class:"gridItem unselectable",
      style:"cursor:pointer;background-color:#acc6ef;",
      onclick:'setPageOffset('+Number(cPage)+')'
    }).html("< Previous"));
  }

  //inner buttons
  for (var i = 0; i < pageArray.length; i++) {

    var pageNum = pageArray[i];

    // console.log("BC::creating page: " + i);
    var s = (pageNum==cPage) ? "background-color:#acc6ef;" : "cursor:pointer;";
    var oc = (pageNum==cPage || pageNum == "...") ? "" : 'setPageOffset('+Number(pageNum+1)+')';
    var disp = (pageNum == "...") ? "..." : Number(pageNum+1);
    bc.append($("<span/>", {
      class:"gridItem unselectable",
      style:s,
      onclick:oc
    }).html(disp));
  }
  //Next Button
  if (cPage <= pages -1) {
    bc.append($("<span/>", {
      class:"gridItem unselectable",
      style:"cursor:pointer;background-color:#acc6ef;",
      onclick:'setPageOffset('+Number(cPage +2)+')'
    }).html("Next >"));
  }

}


function preview(src, name, description) {
  var desc = description || "";
  swal({
    title:'<img src="'+src+'" /><br />'+name,
    text: desc,
    html:true,
    customClass:"fullModal",
    confirmButtonColor: "#acc6ef",
    confirmButtonText: "Cool, thanks!",
    allowOutsideClick:true,
    closeOnConfirm:true
  })
}
function setLowerTitle() {
  var t = [];
  var dChar = "";
  if (cCat) t.push("Category: " + clu[cCat]);
  if (cSearch) t.push("Search: " + cSearch);
  if (cCoin) t.push("Coin: " + cCoin);
  if (cDir) { dChar = (cDir == "DESC") ? '&#x25B2;' : '&#x25BC;'; }; //yes, I know they're backwards.  I meant to do that.
  if (cSort) t.push("Sorting by " + cSort + " " + dChar);
  var tString = (t.length > 0) ? '<font size="-1">(' + t.join(', ') + ")</font>" : "";
  $("#lowerTitle").html(tString);
}

function loadCats(response) {  //TODO: get the icons installed and functioning
  var cd = $("#categoryLinks");
  cd.append($("<li />", {class:"vList"}).html('<span class="category_link" onclick="loadCategory();">All</span>'));
  for (var i in response) {
    clu[response[i].id] = response[i].name;
    var cat = response[i];
    cd.append($("<li />", {class:"vList"}).html('<span class="category_link" onclick="loadCategory(\''+cat.id+'\');">' + cat.name + '</span>'));
  }
}

function loadCategory(id) {
  cOffset = 0;
  cPage = 0;
  cCat = id || null;
  searchInventory();
}
function setCoin(type) {
  cCoin = type;
  cOffset = 0;
  cPage = 0;
  searchInventory();
}
function setPageOffset(num) {
  cOffset = (num-1) * cLimit;
  cPage = num-1;
  searchInventory();
}
function setSort(e) {
  cOffset = 0;
  cPage = 0;
  cSort = $(e).val();
  searchInventory();
}
function setInstore(e) {
  cOffset = 0;
  cPage = 0;
  cInstore = $(e).prop("value");
  if (cInstore == "all") cInstore = null;
  searchInventory();
}
function setInteractive(e) {
  cOffset = 0;
  cPage = 0;
  cInteractive = $(e).prop("value");
  if (cInteractive == "all") cInteractive = null;
  searchInventory();
}
function setDir(d) {
  cOffset = 0;
  cPage = 0;
  cDir = (cDir == "ASC") ? "DESC" : "ASC";
  var dChar = (cDir == "DESC") ? '&#x25B2;' : '&#x25BC;';
  $("#dirBut").html(dChar);
  searchInventory();
}

function clearSearch() {
  cOffset = 0;
  cPage = 0;
  $("#searchField").val("");
  searchInventory();
}

function goToCart() {
  console.log("goToCart");
  window.location = "cart";
}
