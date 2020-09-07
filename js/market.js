var preparedSearch = "market";
currentPage = "market";

function buildInventory(ob) {
  // console.log(ob);
  if (ob.length == 0) {
    $("#itemBlocks").empty();
    $("#itemBlocks").append("<center>Uh oh!  We didn't find anything matching your search!<br />Maybe check your spelling, or try a different category.</center>");
    return;
  }

  $("#itemBlocks").empty();
  for (var i = 0; i < ob.length; i++) {
    var item = ob[i];
    if (item.rowcount != undefined) {
      console.log("Rowcount: " + item.rowcount);
      rowcount = item.rowcount;
      setBreadcrumbs();
      if (rowcount == 0) $("#itemBlocks").append("<center>Uh oh!  We didn't find anything matching your search!<br />Maybe check your spelling, or try a different category.</center>");
      continue;
    }

    $("#itemBlocks").append(new ItemBlock(item).display);
  }
}

function addItemToCart(id, name) {
  // console.log("adding to cart: " + id);
  popNotify(name + " added to Shopping Bag");
  paramQuery({id:id}, updateCartCount, ADDTOCART);
}

function updateCartCount(r) {
  console.log(r);
  $(".cart_counter").each(function(){$(this).html(r)});
}
