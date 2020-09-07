var moduleList = [
  "itemFind"  //item finder quest/events
]

var currentModule;
var activeMods;

function mQuery (ob, cb, type) { paramQuery(ob, cb, type, "moduleQuery"); }

function initCurrentModules() {
  // activeMods = (siteOptions.active_mods != null) ? siteOptions.active_mods.split(",") : [];
  // console.log(siteOptions);
  var rand = Math.round(Math.random() * 5000000);
  activeMods = siteOptions.active_mods.split(",");
  // console.log("Active Modules:", activeMods);
  if (activeMods.length == 1 && activeMods[0] == 0) {
    console.log("No currently active modules");
    if (currentPage == "admin") {
      for (var i=0; i<moduleList.length; i++) {
        includeModule("modules/" + moduleList[i] + ".js?v=" + rand);
      }
    }
    return;
  } else {
    for (var i=0; i<activeMods.length; i++) {
      includeModule("modules/" + activeMods[i] + ".js?v=" + rand);
    }
  }
}

function setCurrentModule(r) {

}

function displayEventList() {
  console.log("displayEventList()");
  //create a dropdown?

}
