function flintQuery(ob,cb,type) {
  paramQuery(ob, cb, type, "flintQuery");//just making my life simpler
}

var flintPane = undefined;
var flintbuttons = [
  {m:'giveGardenGifts()',t:"Give Garden Level Gifts"}
];

function showFlintPane() {
  if (flintPane != undefined) return;
  var pane = $("<div/>",{
    id:"flintPane",
    class:"centerHV",
    style:"position:absolute;height:200px;width:400px;background-color:white;"
  });
  flintPane = pane;
  pane.append($("<button/>",{
    type:"button",
    onclick:"killFlintPane()",
  }).html("close"), "<br />");

  $('body').append(pane);

  for (var i=0; i<flintbuttons.length; i++) {
    makeFlintButton(flintbuttons[i]);
  }
}
function killFlintPane() {
  flintPane.remove();
  flintPane = undefined;
}

function makeFlintButton(ob) {
  var b = $("<button/>",{
    type:"button",
    onclick:ob.m,
  }).html(ob.t);
  flintPane.append(b);
}

////////////////////////////////////////////////////////////////////////////////BUTTON METHODS
function giveGardenGifts() {
  flintQuery({}, valGardenGifts, "send_initial_garden");
}
function valGardenGifts(r) {
  if (r != 'success') console.error(r);
}
