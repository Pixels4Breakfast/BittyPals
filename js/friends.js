function fQuery(ob, cb, str) { paramQuery(ob, cb, str, "friendQuery")};



function buildFriendBlock(ob) {
  var block = $("<div/>");
  var button = $("<button/>", {id:`fb_${ob.id}`});
  var img = $("<img/>", {src:`${ob.avatar}`});
  var banner = (ob.friendData == undefined) ? "" : (ob.friendData.played == 0) ? "" : '<div class="oWrapper"><div class="overlay">PLAYED</div></div>';

  block.addClass('friendBlock gridItem');
  block.attr('id', `f_${ob.id}`);
  block.append($("<a/>", { href:`habitat/${ob.id}` }).append(img, banner));
  block.append(`<div>${ob.username}</div>`);


  if (ob.friendData != undefined && ob.friendData.type == 'friend') {
    button.addClass('rfButton');
    button.html("Remove");
    button.attr('onclick', `removeOldFriend('${ob.id}')`);
  } else {
    button.addClass('afButton');
    button.html("Add Friend");
    button.attr('onclick', `addNewFriend('${ob.id}')`);
  }

  block.append($("<div/>").append(button));
  return block;
}



function getFriendInfo(pid, callback) {
  var cb = callback || showFriendInfo;
  fQuery({pid:pid}, cb, 'f_get_player');
}
function showFriendInfo(r) {
  console.log("Default Friend Info", r);
}

////////////////////////////////////////////////////////////////////////////////PAGE METHODS

function rebuild() {
  console.log("skipping rebuild...");
}

function setFriendsBC(rc) {
  if (rc > fLimit) {
    //build the crumbs and set the current page
    $(".fbc").each(function(){$(this).remove();});
    var numPages = Math.ceil(rc/fLimit);
    var ul = $("<ul/>", { id:'fbc', class:'fbc' });
    ul.append($("<li/>",{ class:'crumb' }).html("<strong>Page:</strong> "));
    for (var i=0; i < numPages; i++) {
      var cl = (pageNum != i) ? 'crumb' : 'crumb active';
      var sp = (fSearch != '') ? "&search=" + fSearch : '';
      var oc = (pageNum != i) ? "window.location='friends?p="+fPage+sp+"&sort="+fSort+"&page="+Number(i*1+1)+"'" : "";
      ul.append($("<li/>", { onclick:oc, class:cl}).html(Number(i+1)));
    }
    ul.insertAfter($('#fButtons'));
    ul.clone().insertAfter($('#friendList'));
  } else {
    $(".fbc").each(function(){$(this).remove();});
  }
}


function listFriends() {
  var loc = (myFriends) ? "friends?p=myFriends" : "friends?p=findFriends";
  loc += "&sort=" + $("#fSortInput").val();
  if ($("#fSearchInput").val() != '') loc += "&search=" + $("#fSearchInput").val();
  window.location = loc;
}

function findFriends(friendString) {
  myFriends = false;
  listFriends();
}

function clearSearch() {
  pageNum = 1;
  fSearch = '';
  $("#fSearchInput").val('');
  listFriends();
}

function removeOldFriend(id) {
  removeFriend(id, confirmFriendRemoved);
}
function confirmFriendRemoved(id) {
  var b = $("#fb_" + id);
  b.attr({
    onclick:"addNewFriend("+id+")",
    title:"Add Friend",
    class:"afButton"
  });
  b.html("Add Friend");
  console.log("CFR", id);
}
function addNewFriend(id) {
  var b = $("#fb_" + id);
  b.attr({
    onclick:"removeOldFriend("+id+")",
    title:"Remove",
    class:"rfButton"
  });
  b.html("Remove");
  addFriend(id);
}


function fetchNewPlayers() {
  fQuery({pid:playerID}, loadNewPlayers, "fetch_new_players");
}
function loadNewPlayers(r) {
  console.log("LoadNewPlayers", r);
  for (var i=0; i<r.length; i++) {
    // $("#newPlayersRow").append(new Friend(r[i]).display);
    $("#newPlayersRow").append(buildFriendBlock(r[i]));
  }
}


function toggleNewPlayers() {
  $("#newPlayersRow").toggle('fast');
}
