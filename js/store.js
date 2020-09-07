var storeItems = [];


var cart = [];
var subTotal = 0;
var panes = [];
var invoice = undefined;



function showPane(pane) {
  for (var i in panes) {
    panes[i].hide();
    if (panes[i].name == pane) panes[i].show();
  }
}

function showStore() {
  sQuery({}, buildStore, "get_store");
}

function buildStore(r) {
  showPane('store');
  if (r.length == 0) $("#storeInst").html("There are currently no specials available in the Bitty-Pals Store");
  if (storeItems.length == 0) {
    // console.log("Store", r);
    for (var i in r) {
      var si = new StoreItem(r[i]);
      storeItems.push(si);
      si.init();
    }
  }
}


function updatePPButton() {
  if (cart.length == 0) {
    alert("You don't have anything in you cart.");
    return;
  }

  createStoreButton(subTotal);
  $("#ccButton").attr("onclick", "clearPPButton()");
  $("#ccButton").html("Cancel");
}

function clearPPButton() {
  //destroy current button
  $("#storeButton").replaceWith($("<div/>", {id:"storeButton"}));
  $("#ccButton").attr("onclick", "updatePPButton()");
  $("#ccButton").html("Checkout");
}





function completeStoreTransaction() {
  var sob = {message:"Stuff!  Thank you for your purchase!", type:"store", sender:"BP Store"};
  var soi = [];
  var gold = 0;
  for (var i=0; i<cart.length; i++) {
    for (var j=1; j <= cart[i].count; j++) {
      for (var ii=0; ii<cart[i].items.length; ii++) {
        for (var ic=0; ic<cart[i].items[ii].count; ic++) soi.push(cart[i].items[ii].id);
      }
      gold = gold*1 + cart[i].gold*1;  //just because I don't want to deal with possible concatenation issues
    }

  }
  sob.gold = gold;
  sob.items = soi;
  console.log(sob);
  sendSystemGift(playerID, sob);

  //reset everything
  clearPPButton();
  for (var c=cart.length-1; c>-1; c--) cart[c].removeFromCart();
}
function validateSysGift(r) {
  if (isNaN(r)) {
    console.error("Could not validate system gift: ", r);
  } else {
    verifySerial(invoice, r);
  }
}



function updateSubtotals() {
  clearPPButton();
  var st = 0;
  for (var c in cart) st = (st + cart[c].subtotal);
  subTotal = st;
  var boxes = $(".subtotalbox");
  for (var i=0; i<boxes.length; i++) {
    $(boxes[i]).html(st);
  }

}


////////////////////////////////////////////////////////////////////////////////PSEUDOCLASSES

function StoreItem(ob) {
  this._ob = ob;  //just to have the whole thing available for future modifications and object verification
  this._id = ob.id;
  this._title = ob.title;
  this._priceString = ob.price;
  this._price = ob.price;
  this._items = ob.items;
  this._description = ob.description;
  this._special = (ob.special == 1) ? true : false;
  this._gold = ob.gold;
  this._src = ob.src;
  this._preview = ob.preview || undefined;

  this._count = 0;
  this._inCart = false;

  this._total = 0;

  this.con = undefined;
  this.img = undefined;
  this.detailHTML = undefined;

  this.cartRow = undefined;
  this.countSpan = undefined;
  this.subSpan = undefined;
}

StoreItem.prototype = {
  get usd()     { return Number(this._price); },
  get price()   { return this._priceString; },
  get items()   { return this._items; },
  get description() { return demystify(this._description); },
  get title()   { return demystify(this._title); },
  get src()     { return this._src; },
  get preview() { return (this._preview == undefined) ? this.src : this._preview; },
  get gold()    { return this._gold; },
  get special() { return this._special; },

  get count()   { return this._count; },
  set count(v)  {
    this._count = v;
    this.countSpan.val(this.count);
    this.subSpan.html(this.count * this.usd + ".00");  //TODO: make this more than just a prettyification
    updateSubtotals(); },
  get inCart()  { return this._inCart; },
  get subtotal(){
    return this.count * this.usd;
  }
}

StoreItem.prototype.init = function() {
  //going to be adding to stackList
  //set up the display stuff
  this.con = $("<div/>", {
    class:"stack s_item"
  })

  var dCon = $("<div/>", {
    class:'s_imageCon'
  })
  this.img = $("<img/>", {
    class:"s_image",
    src:this.src,
    style:"user-select:none"
  })
  this.img.click(() => this.showDetails());
  dCon.append(this.title);
  dCon.append(this.img);
  this.con.append(dCon);

  if (this.special) this.con.append('<div class="bouncy_ep" />');


  this.con.append("<br />");

  var addButton = $("<button/>", {
    class:"s_button"
  }).html('Add to Cart <strong style="font-weight:normal; color:blue;">$' + this.price + "</strong>");
  addButton.click(() => this.add());
  this.con.append(addButton);

  $("#storeList").append(this.con);



  //build the detailHTML
  var cartDetail = "";
  this.detailHTML = $("<div/>", {
    style:"width:400px;text-align:left; top:-50px; position:relative;"
  });
  this.detailHTML.append(this.description, "<br />");
  var ul = $("<ul/>", { style:"list-style:none;" });
  var c = "";
  for (var i in this.items) {
    var it = this.items[i];
    var li = $("<li/>");
    li.append('<img src="'+it.preview+'" class="s_icon s_x" title="'+it.name+'" />');
    li.append('<div class="s_x noback"> x' + it.count + ' </div> ');
    cartDetail += c + li.prop("innerHTML");
    li.append('<strong>'+it.name+'</strong>');

    c = "&nbsp;";
    ul.append(li);
  }
  if (this.gold > 0) {
    var li = $("<li/>");
    var src = (this.gold > 999) ? 'assets/site/goldstack_medium.png' : 'assets/site/goldstack_small.png';
    li.append('<img src="'+src+'" class="s_icon s_x" title="SHINY!" />');
    li.append('<div class="s_x noback">' + this.gold + ' </div> ');
    cartDetail += c + li.prop("innerHTML");
    li.append('<strong>Gold Coins</strong>');

    ul.append(li);
  }
  this.detailHTML.append(ul);


  //cart
  this.cartRow = $("<li/>", {
    class:'cartItem'
  });
  var removeButton = $("<div/>", {
    class:"clearCartButton",
    title:"Remove this row from your cart"
  }).html("X");
  removeButton.click(() => this.removeFromCart());
  this.cartRow.append(removeButton);

  var right = $("<div/>", {
    style:"float:right;position:relative;height:100%;width:200px; text-align:left;"
  });
  this.countSpan = $("<input/>", {
    type:"number",
    min:0,
    style:"width:40px"
  });
  this.countSpan.change(() => this.count = this.countSpan.val());
  this.subSpan = $("<span/>").html("0.00");
  right.append("<strong>Price: $" + this.price + '</strong> USD<br /> x ', this.countSpan, " = $", this.subSpan);

  this.cartRow.append(right);

  this.cartRow.append(this.img.clone().css({height:'50px', 'vertical-align':'top', float:'left'}));
  this.cartRow.append("<strong>" + this.title + "</strong>");
  var details = $("<div/>", {class:'cartDD'});
  details.append(cartDetail);
  this.cartRow.append("<br />", details);
}

StoreItem.prototype.addToCart = function() {
  if (this._inCart) return;
  this._inCart = true;
  cart.push(this);
  console.log(cart);
  $("#cartList").append(this.cartRow);
}
StoreItem.prototype.removeFromCart = function() {
  if (!this._inCart) return;
  this._inCart = false;
  this.count = 0;
  cart.splice(cart.indexOf(this, 1)); //yes?
  this.cartRow.detach();
}
StoreItem.prototype.add = function(num) {
  var n = num || 1;
  this.count = this.count + n;

  if (this.count <= 0) {
    this.count = 0;
    this.removeFromCart();
  } else {
    if (!this.inCart) this.addToCart();

  }
  updateSubtotals();
}
StoreItem.prototype.showDetails = function() {
  title = $("<div/>", {
    class:"swalHeader",
  }).append('<div class="text">' + this.title + "</div>");
  swal({
    // title:this.title,
    title:title.prop('outerHTML'),
    html:true,
    text:this.detailHTML.prop('outerHTML'),
    closeOnConfirm:true,
    confirmButtonText:"Okay"
  });
}


////////////////////////////////////////////////////////////////////////////////PANE
function Pane(a, b) {
  this.name = a ||undefined;
  this.div = b || undefined;
  return this;
}
Pane.prototype = {
  show() { this.div.show(); },
  hide() { this.div.hide(); },
  register() { panes[this.name] = this; return this; }
};
