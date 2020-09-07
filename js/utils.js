
var SEARCHQUERY = 'prepared';
var PARAMS = 'params';
var STRING = 'string';
var SETVAR = 'setvar';
var REGISTER = 'register';
var LOGIN = 'login';
var LOGOUT = 'logout';

var PLAYERDATA = 'prepared_player_data';
var INVENTORY = 'player_inventory';
var PLAYERTROPHIES = 'prepared_player_trophies';
// var ITEM = 'prepared_inventory_item';
var MARKETPLACE = 'market';
var ADMIN_ITEMS = 'admin';

var GIVEPLAYERTROPHY = 'give_player_trophy';

var MONEY = 'get_player_money';
var ADDTOCART = "add_item_to_cart";
var REMOVEFROMCART = "remove_item_from_cart";
var PROCESSCART = "process_cart";

var PLAYERPURCHASE = 'player_purchase';

var ADDFRIEND = 'add_friend';
var REMOVEFRIEND = 'remove_friend';

var PLAYERPROFILE = "player_profile";
var GETPETPROFILE = "pet_profile_edit";

var GETCARELEVELS = "get_care_levels";

var SENDMESSAGE = 'send_message';
var GETINBOX = 'get_inbox';
var GETOUTBOX = 'get_outbox';
var CHECKMAIL = 'check_new_mail';
var GETCONVERSATION = 'get_conversation';

var GIVEPLAYERITEM = 'give_player_item';

var HR_INCREMENT = 20;


var INTERACTIVE_EXP = {title:"Interactive Items",
  text:"At the moment, the interactive items are limited to the 'gift' type, but I'll be expanding that as soon as my brain has some breathing space.<br />The definition for this field is actually pretty simple.  It's broken into four sequential parts:"
  +"<ul><li>interaction type</li><li>price range</li><li>coin type</li><li>extra items</li></ul>"
  +"in a structure that looks like <em>interaction:price:coin:extras</em>"
  +"<br /><strong>Interaction Type:</strong> Right now, this should only be set to 'gift,' which will make the item openable by the players."
  +"<br /><strong>Price Range:</strong> This can either be a single number, or two numbers seperated by a hyphen (i.e.: '300', or '500-900').  The first option will simply set a maximum value of the present, with the minimum at 0, while the second explicitly sets the value range.  If you set this number to '-1' then only the extra items will be available from the interactive item."
  +"<br /><strong>Coin Type:</strong> Set to either 'silver' or 'gold'"
  +"<br /><strong>Extra Items:</strong> this is a comma- delimited list of extra items (by item id, which can be found at the top of the editing box of any item) that are available from the box"
  +"<br /><br />So setting the On Activate value to 'gift:300-500:silver:10,14,23' would give you a <em>gift</em> that yielded a random item worth between <em>300</em> and <em>500 silver coins</em>, with a chance of getting item <em>10, 14,</em> or <em>23</em>, even if they're out of that price range, or not available in the marketplace."};

$(document).ready(() => {
  if (siteBackground != null && siteBackground != undefined) {
    const local = (window.location.href.indexOf('localhost') == -1) ? "" : '/mobtest';
    $('.site')[0].style.backgroundImage = `url("${local}/assets/site/${siteBackground}")`;
  }
})

var currentPage = null;

var iParams = { select: ["*"], table:"item", limit: 20, order:["date_purchased"] };
var aParams = { select: ["*"], table:"item", limit: 20, order:["release_date"] };
var cParams = { select:["*"], table:"categories", order:["name"] };

var gameTimer;
var ticking = false;
var ticklist = [];
ticklist.subscribe = function(subscriber) {
  this.push(subscriber);
}
ticklist.unsubscribe = function(subscriber) {
  if (this.indexOf(subscriber) > -1) {
    this.splice(this.indexOf(subscriber), 1);
  }
}
function tick() {
  for (var i = 0; i < ticklist.length; i++) {
    ticklist[i].tick();
  }

}
function startTick() { if (!ticking) gameTimer = setInterval(tick, 1); ticking = true; }
function stopTick() { if (ticking) clearInterval(gameTimer); ticking = false; }

function confirmCallback(r) {
  if (r != 'success') console.error(r);
}




function sQuery(ob, cb, str) { paramQuery(ob, cb, str, 'storeQuery'); }
function cQuery(ob, cb, str) { paramQuery(ob, cb, str, 'collectibleQuery'); }
function gQuery (ob, cb, type) { paramQuery(ob, cb, type, "gardenQuery"); }
function ibQuery (ob, cb, type) { paramQuery(ob, cb, type, "ibQuery"); }
function inventoryQuery (ob, cb, type) { paramQuery(ob, cb, type, "inventoryQuery"); }
function mailQuery (ob, cb, type) { paramQuery(ob, cb, type, "mailQuery"); }
function giftQuery (ob, cb, type) { paramQuery(ob, cb, type, "giftQuery"); }
function spinnerQuery (ob, cb, type) { paramQuery(ob, cb, type, "spinnerQuery"); }

function paramQuery(ob, callback, qType, qPage) {
  var queryType = (qType == undefined) ? PARAMS : qType;
  var qp = (qPage == undefined) ? "query" : qPage;
  if (callback == undefined) callback = confirmCallback;
  $.ajax
    ({
        type: "POST",
        url: "query/" + qp + ".php?qType=" + queryType,
        cache: false,
        dataType: "json",
        jsonp:false,
        processData: false,
        data: "p=" + JSON.stringify(ob),
        success: function (responseText) {
            try {
              var o = JSON.parse(responseText);
              callback(o);
            } catch(e) {  //first string catch
              callback(responseText);
            }
        },
        error: function (error) { //...second string catch -.-
            if (error.responseText == "success") { //not really an error, but ajax is a little dumb at times.
              callback(error.responseText);
            } else { //...third bloody string catch .... :`(
              if (error.responseText != '') console.log("UNEXPECTED RESPONSE: " + error.responseText);  //this might actually be an error...
              callback(error.responseText); //but we're going to send it anyway, because I like polymorphic responses ;)
            }
        }
    });
}



function validateSave (response) {
  if (response == "success") {
    return true;
  } else {
    if (response != '') console.log("Validate Save Fail: ", response);
  }
}

function sanitize (str) {
  if (typeof str != 'string') return str;
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0": return "\\0";
      case "\x08": return "\\b";
      case "\x09": return "\\t";
      case "\x1a": return "\\z";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "'": return "`";
      case "\"":
      case "\\":
      case "?":
      case "&":
      case "%":
        return "\\"+char;
    }
  });
}

function demystify(str) {  //fuckstix, but some days I hate jQuery's little quirks...
  if (typeof str != 'string') return str;
  return str.replace(/`/g, "'");
}

function br2nl(s) {
  if (s == undefined) return "";
  return s.replace(/\<br \/\>/g, '\n');
}
function nl2br(s) {
  if (s == undefined) return "";
  return s.replace(/[\n\r]/g, "<br />");
}
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function setSessionVar(key, value) {
  paramQuery({key:key, val:value}, validateSave, "set_session_var");
}

function getAvatar(emailhash) {
  var s = 100;
  var d = 'mm';
  var r = 'g';
  var atts = [];
  var url = 'https://www.gravatar.com/avatar/';
  url += emailhash;
  url += "?s="+s+"&d="+d+"&r="+r;
  return url;
}

function login() {
  var un = $("#i_username").val();
  var pw = $("#i_password").val();
  paramQuery({username:un, password:pw}, validateLogin, LOGIN);
}

///TODO: this....should not stay here.  KKIIIIILLLL MEEEEEEEE!!!!!
function overrideLogin() {
  var un = "squishy";
  var pw = "hellions";
  paramQuery({username:un, password:pw}, validateLogin, LOGIN);
}

function validateLogin(response) {
  var s = response.split(":");
  switch (s[0]) {
    case "failure":
      //tarnation
      // showAlert(s[1], RED);
      swal({
        title:"Oops!",
        text:s[1],
        type:"warning",
        timer:2000
      });
    break;
    case "success":
      //set the player login junk and take them to their habitat
      window.location = "habitat";
    break;
    default: //undefined error
      console.log("undefined error during login", response);
    break;
  }
}

function maintenanceLogout(ovrd) {
  if (maintenanceInProgress == 1 && ovrd == 0) logout();
}

function logout() {
  paramQuery({}, finishLogout, LOGOUT);
}
function finishLogout(r) {
  console.log(r);
  window.location = "home";
}


var GREEN = "#greenPane";
var RED = "#redPane";
var alertTimeout;
function showAlert(message, type, autohide) {
  var hidethis = (autohide == undefined) ? true : autohide;
  type = (type == undefined) ? GREEN : type;
  var pane = $(type);
  if (pane == undefined) { console.error("incorrect pane assignment"); return; }
  pane.html(message);
  pane.css("top", 0-pane.height());
  pane.animate({top:"0px"}, {duration:250, complete:function() {
      // if (autohide) {
        clearTimeout(alertTimeout);
        alertTimeout = setTimeout(function(){
          hideAlert(type);
        }, 2000);
      // }
    }
  });

}
function hideAlert(type) {
  var pane = $(type);
  if (pane == undefined) { console.error("incorrect pane assignment"); return; }
  pane.animate({top:0-pane.height()}, {duration:250, complete:function() {
      pane.css("top", "-300px");
      pane.empty();
    }
  })
}

var tabs = [
  {id:"home", title:"Home"},
  {id:"comm", title:"Community"},
  {id:"frnd", title:"Friends"},
  {id:"mrkt", title:"Market"},
  {id:"recycle", title:"Recycle"},
  {id:"bank", title:"Bank"},
  {id:"grdn", title:"Garden"},
  {id:"stor", title:"Store"},
  {id:"news", title:"News"},
  {id:"clct", title:"Collectibles"}
];
function setPage(p) {
  for (var t in tabs) { if (tabs[t].title == p) $("#" + tabs[t].id).addClass("nav_tab_active"); };
  currentPage = p.toLowerCase();

  //we're also leveraging this to set the context menu for the player tab and mute button, because I'm being lazy...




  var tab = $("#playerTab");
  tab.empty();
  tab.attr({
    title:"Menu",
    onclick:"return false;"
  })
  tab.on("mouseenter", showPlayerMenu);
  tab.on("mouseleave", hidePlayerMenu);

  // var menu = $("<ul/>", {style:"list-style:none;"});
  tab.append($("<div/>", {onclick:"logout()", class:"pm_item", title:"Log Out of BittyPals"}).html("Log Out"));
  tab.append($("<div/>", {onclick:"openProfile("+playerID+");", class:"pm_item", title:"My Profile"}).html("Profile"));
  if (privileges == 9) tab.append($("<div/>", {onclick:"window.location='admin';", class:"pm_item", title:"Admin"}).html("*ADMIN*"));
  tab.append($("<hr/>",{style:"width:100%;height:1px;background-color:#acc6ef;"}));

  tab.append($("<div/>", {id:"pt_un"}).html(playerUsername + " >>"));
  var position = $("#pt_un").position();
  tab.css("top", position.top * -1 - 10);
  mailQuery({pid:playerID}, notifyMail, CHECKMAIL);
  if (privileges == 9) mailQuery({pid:0}, notifyMail, CHECKMAIL);
}



function showPlayerMenu() {
  $("#playerTab").animate({
    top:"-10px"
  }, 100);

}
function hidePlayerMenu() {
  $("#playerTab").animate({
    top:$("#pt_un").position().top * -1 - 10
  }, 100);
}

function handleTab(e) {
  var flag = false;
  for (var t in tabs) {
    if (tabs[t].id == e.id) { flag = true; window.location = tabs[t].title; }
  }
  if (!flag) window.location = "home";
}

function updatePlayerMoney(id) {
  paramQuery({pid:id}, vUPM, MONEY);
}
function vUPM(r) {
  $("#playerSilver").html(r['silver']);
  $("#playerGold").html(r['gold']);

  //looking for the nest egg trophy
  if (r['silver'] >= 1000000) {
    givePlayerTrophy(playerID, 39);
  }
}
function getPlayerMoney() {
  //we're not touching the database on this one...which might bite me in the ass
  return {silver:Number($("#playerSilver").html()), gold:Number($("#playerGold").html())};
}




                                                                                //FRIENDS
function addFriend(fid) {
  paramQuery({pid:playerID, fid:fid}, friendAdded, ADDFRIEND, 'friendQuery');
}
function friendAdded(r) {
  if (r != 'success') console.error("FAILED TO ADD FRIEND\n\t", r);
  swal({title:"Friend added!", type:"success", timer:2000});
  if (currentPage == 'habitat') setFriendButton(true);
  if (currentPage == 'friends') rebuild(r);
}
function removeFriend(fid, cb) {
  swal({
    title:"Are you sure you want to remove this friend?",
    showCancelButton:true,
    closeOnConfirm:false,
    closeOnCancel:true,
    confirmButtonColor:"#ff0000",
    confirmButtonText:"Yes, I'm sure",
    cancelButtonText:"Nooo! I clicked that by accident!"
  },
  function (isConfirm) {
    if (isConfirm) {
      confirmRemoveFriend(fid);
      if (cb != undefined) cb(fid);
    }
  })
}
function confirmRemoveFriend(fid) {
  paramQuery({pid:playerID, fid:fid}, friendRemoved, REMOVEFRIEND, 'friendQuery');
}
function friendRemoved(r) {
  if (r != 'success') console.error("FAILED TO REMOVE FRIEND\n\t", r);
  swal({title:"Friend Removed", type:"warning", timer:2000});
  if (currentPage == 'habitat') setFriendButton(false);
  if (currentPage == 'friends') rebuild(r);
}

function explain(type) {
  $("#utilityPane").addClass("mask");
  var m = $("#mailPane");
  m.addClass("mail_pane");
  m.addClass("centerHV");
  m.css("padding", "10px");
  var header = $("<div/>", { //header
      style:"width:100%; text-align:center; font-size:1.4em; height:40px;"
    }).html(type.title);
  header.append($("<button />", { //close button
      style:"position:relative; float:right; margin-right:5px;",
      onclick:"closeUtilityPane()"
    }).html("Close"));
  m.append(header);
  m.append("<hr />");
  m.append(type.text);
}
function closeUtilityPane() {
  $("#mailPane").empty();
  $("#mailPane").removeClass();
  $("#mailPane").removeAttr('style');
  $("#utilityPane").removeClass();
  $("#utilityPane").removeAttr('style');
  $("#utilityPane").unbind('click');
}

function showAboutUs(s) {
  $("#utilityPane").addClass("mask");
  $("#utilityPane").on('click', closeUtilityPane);
  var m = $("#mailPane");
  m.addClass("profile_pane");
  m.addClass("centerHV");
  m.css("padding", "10px");
  var header = $("<div/>", { //header
      style:"width:100%; text-align:center; font-size:1.4em; height:40px;"
    }).html("About Us");
  header.append($("<button />", { //close button
      style:"position:relative; float:right; margin-right:5px;",
      onclick:"closeUtilityPane()"
    }).html("Close"));
  m.append(header);
  m.append("<hr />");
  m.append(s);
}

var secretQuestions = undefined;
function openProfile(pid) {
  $("#utilityPane").addClass("mask");
  var m = $("#mailPane");
  m.addClass("profile_pane");
  m.addClass("centerHV");
  m.css("padding", "10px");
  if (pid == playerID) {
    paramQuery({select:["*"], table:"secret_questions"}, setSecretQuestions);
  } else {
    paramQuery({pid:pid, vid:playerID}, loadProfile, PLAYERPROFILE);
  }
}
function setSecretQuestions(r) {
  secretQuestions = r;
  paramQuery({pid:playerID}, loadProfile, PLAYERPROFILE);
}
function loadProfile(player) {
  // console.log(player);
  var pane = $("#mailPane");
  pane.empty();
  var header = $("<div/>", { //header
      style:"width:100%; text-align:center; font-size:1.4em; height:40px;"
    }).html(player.username + "'s Profile");
  header.append($("<button />", { //close button
      style:"position:relative; float:right; margin-right:5px;",
      class:"close_button_sprite",
      onclick:"closeProfile()",
      title:"Close Profile"
    }));
  header.append($("<div />", {style:"width:100%; text-align:center; font-size:.7em; height:23px;"}).html("<strong>Habitat URL: </strong>https://bittypals.com/habitat/" + playerOb.id));
  pane.append(header);
  pane.append('<hr id="profileDivider" />');
  var ppheight = pane.height() - $("#profileDivider").position().top;
  var view = $("<div/>", { id:"profileEditPane", style:"position:relative; width:100%; height:"+ppheight+"px; text-align:left;"});

                ///AVATAR
  var src = (player.use_gravatar == 1) ? getAvatar(player.md5) : player.avatar;
  var stats = $("<div/>", { class:'stats' });

  if (secretQuestions == undefined) {
    stats.append($("<img/>", { src:src, style:"height:90px; width:90px; cursor:pointer; float:left; border:1px solid #acc6ef; padding:5px; margin:4px; border-radius:5px;", title:"Go to Habitat", onclick:"window.location = 'habitat/"+player.id+"'" }));
  } else {
    stats.append('<div id="imgContainer"><form enctype="multipart/form-data" action="avatarSubmit.php" method="post" name="image_upload_form" id="image_upload_form"><input type="hidden" name="pid" value="'+playerID+'" /><div id="imgArea"><img src="'+src+'" /><div class="progressBar"><div class="bar"></div><div class="percent">0%</div></div><div id="imgChange"><span>Change Photo</span><input type="file" accept="image/*" name="image_upload_file" id="image_upload_file"></div></div></form></div>');

    initAvatarChange();
  }




  if (secretQuestions != undefined) stats.append("<strong>Email</strong>: " + player.email + "<br />");
  stats.append("<strong>Member Since</strong>: " + player.join_date.split(" ")[0] + "<br />");
  stats.append("<strong>Last Active</strong>: " + player.last_login);

  stats.append("<br /><br /><strong>Player Level</strong>: " + player.level + " &nbsp; ");
  stats.append(getLevelGauge(player.level, player.xp));

  view.append(stats);

  if (secretQuestions != undefined) {
    var secret = $("<div />");
    secret.append("<br />Secret Question: ");
    var questionDrop = $("<select/>", {id:"p_secretQuestion"});
      for (var s = 0; s < secretQuestions.length; s++) {
        questionDrop.append($("<option/>", {value:secretQuestions[s].id}).html(secretQuestions[s].question));
      }
    questionDrop.val(player.secret_question);
    if (player.secret_question == null) secret.attr({title:'You do not have a secret question selected. In case you forget where you put your password, we need this in order to help you get back to your pal.', style:"color:red;"});
    secret.append(questionDrop);
    secret.append($("<input/>", {id:"p_secretQuestionAnswer", value:player.secret_answer}));
    view.append(secret);
  }

  view.append($("<div/>", {class:"construction"}).html('<span>Under construction: your Pal profile(s)</span>'));
  view.append($("<div/>",{id:"petProfilePane", style:"display:inline-block; position:relative; text-align:center; width:100%;"}));
  pane.append(view);
  paramQuery({pid:player.id}, loadPetsProfile, GETPETPROFILE);
}

function loadPetsProfile(r) {
  var pane = $("#petProfilePane");
  for (var i = 0; i < r.length; i++) {
    var pet = r[i];
    var con = $("<div/>",{style:"display:block;"});
    con.append("<strong>" + pet.name + "</strong><br />");
    var img = $("<img/>", {src:pet.src, style:"height:140px"});
      img.css("filter", "hue-rotate("+pet.hr+"deg)");
      img.css({'-webkit-filter': 'hue-rotate('+pet.hr+'deg)'});
    con.append(img);
    con.append($("<div/>").html("<strong>Level</strong> " + pet.level + "<br />" + getLevelGauge(pet.level, pet.xp)));
    pane.append(con);
  }
  if (secretQuestions != undefined) pane.append($("<div/>").append($("<button/>",{onclick:"saveProfile()", style:"float:right;"}).html("Save Changes")));
}

function closeProfile() {  //do I even need this?
  closeUtilityPane();
  uninitAvatarChange();
}
function saveProfile() {
  var sq = $("#p_secretQuestion").val();
  var sqa = $("#p_secretQuestionAnswer").val();
  if (sqa == "") {
    swal({title:"Whoops!", text:"You haven't answered your secret question!", type:"warning", closeOnConfirm:true, confirmButtonText:"Lemme fix that..."});
  } else {
    paramQuery({update:"player", id:playerID, values:{secret_question:sq, secret_answer:sqa}}, validateProfileSave);
  }
}
function validateProfileSave(r) {
  if (r == 'success') {
    closeProfileEditor();
  } else {
    console.error(r);
  }
}



function getLevelGauge (level, xp, plid) {
  //get the width of the inner gauge from base, current, and next xp
  var base = 0;
  var next = 0;
  for (var i = 0; i < 500; i++) {
    next = base + (1000 * i);
    if (xp >= next) {
      base = next;
    } else {
      break;
    }
  }
  var percent = (xp - base) / (next - base) * 100;
  plid = plid || "petLevelGauge";
  // console.log("levelGauge-> level:" + level + ", xp:"+xp+", base:"+base+", next:"+next+", percent:"+percent+ " ("+ (next-base) + "/" + (xp-base) + ")");
  var g = '<div id="'+plid+'" style="width:200px; height:20px; border:3px double silver; border-radius:10px; text-align:center; position:relative; display:initial;">';
      g += '<div style="width:' + Math.floor(percent * 1) + '%; height:99%; background-color:#33cc33; border-radius:8px 0px 0px 8px; position:absolute; z-index:1; display:initial;">&nbsp;</div>';
      g += '<div style="position:relative; display:inline; width:100%; z-index:2; color:black; display:initial;">' + xp + " / " + next + '</div>';
      g += "</div>";
  return g;
}


var GIVEMONEY = "give_player_money";
// var GIVEITEM = "give_player_item";
function givePlayerMoney(id, ob, playSound) {
  if (ob.gold != undefined) {
    if (playSound == undefined) if (ob.gold > 0) sounds.coin.play(); else sounds.negcoin.play();
    paramQuery({pid:id, gold:ob.gold}, validateMoney, GIVEMONEY);
  } else if (ob.silver != undefined) {
    if (playSound == undefined) if (ob.silver > 0) sounds.coin.play(); else sounds.negcoin.play();
    paramQuery({pid:id, silver:ob.silver}, validateMoney, GIVEMONEY);
  } else {
    console.error("Money type not defined!", ob);
  }
}
function validateMoney(r) { if (r == "success" && currentPage != "admin") { updatePlayerMoney(playerID); } else { console.error(r); } }
function givePlayerItem(pid, iid) {
  paramQuery({pid:pid, item:iid}, validateItemGiven, GIVEPLAYERITEM);
}
function validateItem(r) { if (r == "success" && currentPage != "admin") { searchInventory(); } else { console.error(r); } }

var GIVEXP = "give_player_xp";
var GIVEPETXP = "give_pet_xp";
function givePlayerXP(id, xp) {
  paramQuery({pid:id, xp:xp}, validatePlayerXP, GIVEXP);
}
function givePetXP(id, xp, other, checking) {
  var callback = (other != undefined && other == true) ? valStatus : validatePetXP;
  var params = {petid:id, xp:xp};
  if (other != undefined && other == true) params.otherPlay = 1;
  if (checking != undefined && checking == true) params.checking = 1;
  paramQuery(params, callback, GIVEPETXP);
}
function validatePlayerXP(ob) {
  // console.log(ob);
  var currentXP = ob.cxp;  //set this visually
  var currentLevel = ob.i;
  var levelBase = ob.base;
  var nextLevel = ob.next;
  if (editable == 1) {
    var newGauge = getLevelGauge(currentLevel, currentXP, "playerLevelGauge");
    $("#playerLevelGauge").replaceWith(newGauge);
    document.getElementById('plLvl').innerHTML = currentLevel;
  }
  if (ob.levelup) {
    var gAmount = currentLevel * 10;
    // givePlayerMoney(ob.id, {gold:gAmount});
    //give the seed packs for the garden
    var levelItems = [];
    switch(currentLevel) {
      case 25:
        levelItems.push(8741);
      break;
      case 50:
        levelItems.push(8742);
      break;
      case 100:
        levelItems.push(8743);
      break;
      default:
        //do nothing
      break;
    }


    givePlayerGift(ob.id, 'level', 'Bitty-Pals', "Congratulations! You have reached level " + currentLevel + "!", gAmount, 0, levelItems);
    swal({
      title:"You leveled up!",
      text:"Congratulations on reaching level " + currentLevel + "!<br />You have earned " + gAmount + ' <img src="assets/site/coin-gold.png" />!<br />A gift containing your Gold has been sent to you.',
      html:true,
      closeOnConfirm:true,
      confirmButtonText:"Yay!"
    }, function() {
      paramQuery({update:"player", id:ob.id, values:{level_notified:1}}, validateSave);
    })
  }
}
function validatePetXP(ob) {
  // console.log(ob);
  var currentXP = ob.cxp;  //set this visually
  var currentLevel = ob.i;
  var levelBase = ob.base;
  var nextLevel = ob.next;
  var away = (ob.leveledwhileaway == undefined) ? "" : " while you weren't looking";
    var newGauge = getLevelGauge(currentLevel, currentXP, "petLevelGauge");
    $("#petLevelGauge").replaceWith(newGauge);
    document.getElementById('ptLvl').innerHTML = currentLevel;
  if (ob.levelup == 1 || ob.leveledwhileaway == 1) {
    var sAmount = currentLevel * 100;
    // givePlayerMoney(ob.pid, {silver:sAmount});
    givePlayerGift(playerID, 'level', 'Bitty-Pals', "Congratulations! Your Pal has reached level " + currentLevel + "!", 0, sAmount);
    swal({
      title:"Your Pal has leveled up"+away+"!",
      text:ob.name + " has reached level " + currentLevel + "!<br />You have earned " + sAmount + ' <img src="assets/site/coin-silver.png" />!<br />A gift containing your Silver has been sent to you.',
      html:true,
      closeOnConfirm:true,
      confirmButtonText:"Yay!"
    }, function() {
      paramQuery({update:"pet", id:ob.id, values:{level_notified:1}}, validateSave);
    })
  }
}

function givePlayerGift(rid, type, sender, message, gold, silver, items) {
  if (items == undefined) items = [];
  giftQuery({rid:rid, type:type, sender:sender, message:message, gold:gold, silver:silver, gifts:items}, confirmSystemGift, 'send_system_gift');
}
function sendSystemGift(pid, ob) {
  var type = ob.type || 'gift';
  var sender = ob.sender || 'Bitty-Pals';
  var message = ob.message || "";
  var gold = ob.gold || 0;
  var silver = ob.silver || 0;
  var items = ob.items || [];
  console.log("Sending system gift: items=>", items);
  giftQuery({rid:pid, type:type, sender:sender, message:message, gold:gold, silver:silver, gifts:items}, confirmSystemGift, 'send_system_gift');

}
function confirmSystemGift(r) {
  // console.log("confirmSystemGift");
  if (validateSysGift != undefined) {
    validateSysGift(r);
  }
}
function validateSysGift(r) {} //not sure why this is still here...


function givePlayerTrophy(pid, tid) {
  paramQuery({pid:pid, tid:tid}, confirmTrophy, GIVEPLAYERTROPHY);
}
function confirmTrophy(r) {
  if (r != 'success') console.log(r);
  checkTrophyNotification();
}

function checkTrophyNotification() {
  paramQuery({pid:playerID}, trophyNotifyResult, 'get_trophy_notifications');
}
function trophyNotifyResult(r) {
  console.log(r);
  if (r != 'none') {
    swal({
        title: "You have earned the " + r.name + " trophy!",
        text: r.description,
        imageUrl: r.src,
        html: true,
        animation: "slide-from-top",
        confirmButtonColor: "#acc6ef",
        confirmButtonText: "Click this button if you're awesome!",
        closeOnConfirm: true,
      },
      function(isConfirm) {
        if (isConfirm) {
          checkTrophyNotification();
        }
      }
    );
  }
}


function popNotify(text, type) {
  var stack = $("#popStack");
  var pop = $("<div/>", {class:"pop"}).html(text);
  if (type != undefined && type == 'error') pop.addClass("pop_error");
  stack.append(pop);
  setTimeout(function() {
    pop.fadeOut(500, function() { pop.remove(); });
  }, 5000);
}


function logError(type, page, msg, note) {
  // paramQuery({insert:'error', values:{pid:playerID, type:type, page:page, msg:msg, date:"NOW", internal_message:note}});
  paramQuery({pid:playerID, date:"NOW", type:type, page:page, msg:msg, internal_message:note}, confirmCallback, "insert_error");
}




                                                          //AVATAR
  function initAvatarChange() {
    $(document).on('change', '#image_upload_file',
      function () {
        var progressBar = $('.progressBar'), bar = $('.progressBar .bar'), percent = $('.progressBar .percent');

        $('#image_upload_form').ajaxForm({
            beforeSend: function() {
        		progressBar.fadeIn();
              var percentVal = '0%';
              bar.width(percentVal)
              percent.html(percentVal);
            },
            uploadProgress: function(event, position, total, percentComplete) {
              var percentVal = percentComplete + '%';
              bar.width(percentVal)
              percent.html(percentVal);
            },
            success: function(r, statusText, xhr, $form) {
          		ob = $.parseJSON(r);
          		if(ob.status){
          			var percentVal = '100%';
          			bar.width(percentVal)
          			percent.html(percentVal);
          			$("#imgArea>img").prop('src',ob.image);
                // alert(ob.image);
                paramQuery({pid:playerID, src:ob.image}, valAvatarChange, 'change_avatar');
          		} else {
          			alert(ob.error);
          		}
            },
        	complete: function(xhr) {
        		progressBar.fadeOut();
        	}
        }).submit();

      });
  }

  function uninitAvatarChange() {
    $(document).on('change', '#image_upload_file', function (){});
  }

  function valAvatarChange(r) {
    if (r != 'success') console.error(r);
  }


function closeById(id) {
  $("#"+id).close();
}


////////////////////////////////////////////////////////////////////////////////OTHER UTILS
function includeModule(path) {
  var imported = document.createElement('script');
  imported.src = 'js/' + path;
  document.head.appendChild(imported);
  return true;
}
function includeStyle(path) {
  var imported = document.createElement('link');
  imported.rel = 'stylesheet';
  imported.href = 'css/' + path;
  document.head.appendChild(imported);
}

function addBouncyEP(targetName, small) {
  var s = (small) ? '_small' : "";
  var ep = $("<div/>",{class:'bouncy_ep'+s});
  $(`#${targetName}`).append(ep);
}

function getRangeArray(str) {
  if (str == "") return [];
  var floor = str.split("-")[0];
  var ceil = str.split("-")[1];
  var arr = [];
  for (var i=floor*1; i<ceil*1; i++) {
    arr.push(i);
  }
  return arr;
}

function showScreenMask(cb) {
  $("#utilityPane").addClass("mask");
  // if (typeof cb != 'function') console.error("No callback was defined for showScreenMask");
  var callback = cb || hideScreenMask;  //should always provide a call back
  $("#utilityPane").on('click', callback);
}
function hideScreenMask() {
  $("#utilityPane").removeClass();
}
