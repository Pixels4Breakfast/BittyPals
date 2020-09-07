//106,107,108,109

var cids = [];
var purchaseList = [];
var collectionID = 0;
var collectionTID = 0;
var pricePer = 0;
var fieldCount = 0;
var subTotal = 0;


//for habitat
function initCollectionCell(r) {
  // console.log("icc:", r);
  if (r == "fail" || r == "" || r == "No active collection") {
    $("#collectionCell").html("<center><strong>There are no currently active collections</strong></center>");
    return;
  }
  var ccell = $("#collectionCell");
  ccell.attr("style", "cursor:pointer");
  ccell.attr("title", "Go to Collectibles Page");
  ccell.attr("onclick", "window.location='collectibles'");
  ccell.append("<center><strong>" + demystify(r.title) + "</strong></center>");
  ccell.append(demystify(nl2br(r.short_description)) + "<br />");
  var ccase = $("<div/>", { style:"width:100%; text-align:center;" });
  for (var i=0; i<r.items.length; i++) {
    var cimg = $("<img/>", {
      src:r.items[i].src,
      style:"height:100px;"
    })
    ccase.append(cimg);
  }
  ccell.append(ccase);
}



function setCollectibles() {
  paramQuery({}, buildCollectibleList, 'get_collectibles', 'collectibleQuery');
}

function buildCollectibleList(r) {
  // console.log(r);
  if (r == "fail") {
    $("#stackList").append("There are no currently active collections");
    return;
  }
  collectionID = r.id;
  collectionTID = r.trophy;
  $("#collectionTitle").html(demystify(r.title));
  $("#collectionDescription").html(demystify(nl2br(r.long_description)));
  if (r.items.length > 0) {
    fieldCount = r.items.length;
    pricePer = r.base_price;
    var stackTarget = $("#stackList");
    for(var i=0; i<r.items.length; i++) {
      var c = r.items[i];
      cids.push(c.id);
      purchaseList.push({id:c.id, count:0});
      var s = $("<div/>", {class:'stack'});
      s.append(c.name, "<br />");
      var cdd = createCDD(c.id);
      s.append(cdd, "<br />");
      s.append($("<img/>", {src:c.src}), "<br />", c.description);

      stackTarget.append(s);
    }
  } else {
    //something went wrong
    console.error("No item list found");
  }

}

function createCDD(id) {
  var dd = $("<select/>", {id:"cdd_" + id, onchange:"updateCollectibleList()"});
  for (var i=0; i<11; i++) {
    dd.append($("<option/>", {value:i}).html(i));
  }
  return dd;
}

function updatePPButton() {
  if (subTotal == 0) {
    alert("You don't have anything in you cart.");
    return;
  }
  //lock the CDDs
  for (var k in cids) document.getElementById("cdd_" + cids[k]).disabled = true;  //use legacy version to make sure it hits all browsers
  createCollectibleButton(subTotal);
  $("#ccButton").attr("onclick", "clearPPButton()");
  $("#ccButton").html("Cancel");
}

function clearPPButton() {
  //destroy current button
  $("#collectibleButton").replaceWith($("<div/>", {id:"collectibleButton"}));
  //unlock CDDs
  for (var k in cids) document.getElementById("cdd_" + cids[k]).disabled = false;  //use legacy version to make sure it hits all browsers
  $("#ccButton").attr("onclick", "updatePPButton()");
  $("#ccButton").html("Checkout");
}

function updateCollectibleList() {
  var totalCount = 0;
  for (var i=0; i<fieldCount; i++) {
    purchaseList[i].count = $("#cdd_" + cids[i]).val();
    totalCount = Number(totalCount) + Number(purchaseList[i].count);
  }
  subTotal = totalCount * pricePer;
  $("#subt").html(subTotal);
  // console.log(purchaseList);
}




function completeCollectibleTransaction() {
  //give them plushies
  var sob = {message:"Plushies!  Thank you so much for supporting the creators of Bitty-Pals!"};
  var soi = [];
  for (var i=0; i<fieldCount; i++) {
    for (var j=1; j <= purchaseList[i].count; j++) {
      soi.push(purchaseList[i].id);
    }

  }
  // console.log("soi", soi);
  sob.items = soi;
  sendSystemGift(playerID, sob);

  //reset everything
  clearPPButton();
  for (var k in cids) $("#cdd_" + cids[k]).val(0);
  updateCollectibleList();

  //check to see if they have all of the plushies to complete the set
  paramQuery({pid:playerID, cid:collectionID}, verifyCollectibleSet, "validate_collection", "collectibleQuery");
}


function verifyCollectibleSet(r) {
  if (r == 'verified') {
    givePlayerTrophy(playerID, collectionTID);
  } else {
    console.log(r);
  }
}
