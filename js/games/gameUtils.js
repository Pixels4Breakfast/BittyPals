//because I don't feel like doing these as class constructors in JavaScript...bad Flint.  Bad.
var timestamp = Math.floor(Date.now() / 1000);
var pageMask = undefined;
var rulesPane = undefined;
function setGameSize(w,h,t) {
  t = (t==undefined)?5:t;
  gameScreen.css('top', t+"px");  //just a compensation shift to make sure the entire screen is visible
  gameScreen.css('width', w + "php");
  gameScreen.css('height', h + "px");

  pageMask = $("<div/>", {id:"pageMask", class:"page_mask"});
  $("body").append(pageMask);
  pageMask.hide();

  rulesPane = $("<div/>", {id:"rulesPane", class:"rules_pane centerHV"});
  rulesPane.append('<button id="closeRulesPane" class="close_button" onclick="hideRules();">X</button>');  //close button
  rulesPane.append("<center><h1>" + rulesTitle + "</h1></center>" + rulesText);
  $("body").append(rulesPane);
  rulesPane.hide();
}
function setTitle(t) { $("#habName").html(t); }

function showLoading() {
  //sprite or gif?

}
function hideLoading() {
  //sprite or gif?
}

function loadSoundList(path, ob) {
  for (var k in ob) {
    sounds[k] = new Sound(path + ob[k]);
  }
}

function loadModules() {
  for (var i=0; i<modules.length; i++) includeModule("games/" + gameName + "/" + modules[i] + ".js?v=" + timestamp);
}
function loadStyles() {
  includeStyle("games/games.css");
  for (var i=0; i<styles.length; i++) includeStyle("games/" + gameName + "/" + styles[i] + ".css");
}

function showRules() {
  pageMask.show();
  rulesPane.show();
}

function hideRules() {
  rulesPane.hide();
  pageMask.hide();
}

function pauseGame() {
  stopTick();
}
function resumeGame() {
  startTick();
}
function exitGame() {
  console.log("quitGame");
  window.location = 'arcade';
}


function gq(ob, cb, str) {
  paramQuery(ob, cb, str, 'gameQuery');
}
