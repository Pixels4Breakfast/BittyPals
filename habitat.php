<?php
  require_once "overhead.php";
  if (!isset($_SESSION['player_id'])) header("Location: http://bittypals.com");



  $hid = (isset($_SESSION["active_hab"])) ? $_SESSION["active_hab"] : 0;
  $husername = "";
  $petid = 0;  //gets set in loadHabitat
  $petname = "";  //gets set in loadHabitat
  $petob = "";  //get set in loadHabitat
  $loadpid = $pid;
  $loadhid = $hid;
  $isFriend = 0;

  if (isset($_GET["userid"])) {
    //this is for visiting other players
    //pull stuff from database
    $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
    if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
    $loadpid = $_GET["userid"];
    // $h = $conn->query("SELECT habitat.id, player.username FROM habitat INNER JOIN player ON habitat.pid = player.id WHERE habitat.pid = $loadpid AND habitat.active = 1") or die($conn->error);
    $h = $conn->query("SELECT username, active_hab FROM player WHERE id = $loadpid") or die($conn->error);


    if ($h->num_rows != 1) {
      echo "Invalid user ID";
      //TODO: build a damn 404 page for Bitty-Pals...
      return;
    }


    $u = $h->fetch_object();
    $loadhid = $u->active_hab;
    $husername = $u->username;



    $conn->close();

    $nextfriend = "";
    $lastfriend = "";
    // $farr = explode(',',$_SESSION['friends']);
    // $fin = array_search($loadpid, $farr);
    $farr = $_SESSION['friends'];
    $fin = 0;
    if (count($farr) > 0) {
      for ($i=0; $i<count($farr); $i++) {
        if ($farr[$i]->fid == $loadpid && ($farr[$i]->type != 'none' && $farr[$i]->type != 'neighbour')) { $fin = $i; $isFriend = 1; break; }
      }
      $lfindex = ($fin == 0) ? count($farr) - 1 : $fin - 1;
      $nfindex = ($fin == count($farr) - 1) ? 0 : $fin + 1;
      $nextfriend = $farr[$nfindex]->fid;
      $lastfriend = $farr[$lfindex]->fid;
    } else {
      $nextriend = "";
      $lastfriend = "";
    }
  }
  $editable = ($pid == $loadpid) ? 1 : 0;



  $trophyNotify = 0;
  if (isset($_SESSION['trophy_notify'])) {
    if ($_SESSION['trophy_notify'] == 1) $trophyNotify = 1;
  }


  $item_list = "";
  $css_paletteItems = "";
  $css_paletteList = "";
  $div_paletteList = "";
  $increment = 20;
  $pCSS = 1;  //include palette CSS?

  function createItem($id, $src, $sprite) {
    global $item_list;
    if ($sprite === false) {
      $item_list .= '<div id="item_'.$id.'" class="item_hab" style="top:-1000px;" item_id="'.$id.'"><img id="item_'.$id.'_img" class="item" src="'.$src.'" item_id="'.$id.'" /></div>';
    } else {
      $item_list .= '<div id="item_'.$id.'" class="item_hab" style="top:-1000px;" item_id="'.$id.'"><div id="item_'.$id.'_img" class="item" style="height:'.$sprite->frameHeight.'px; width:'.$sprite->frameWidth.'px; background-image:url('.$src.');"></div></div>';
    }
  }


  function createPalette($id, $src, $type, $sprite) {
    global $increment, $css_paletteItems, $css_paletteList, $div_paletteList, $pCSS;
    $div_paletteList .= '<div id="item_'.$id.'_palette" class="palette"">';
    $incr = $increment;//($type == 'habitat') ? 10 : 20;
    for ($i = 0; $i == $i; $i++) {
      if (($incr * $i) > 359) break;
      $bg = ($type != 'habitat') ? '' : ' style="width:20px; overflow:visible;"';
      if ($pCSS) $css_paletteList .= ".p$i { -webkit-filter : hue-rotate(".($i*$incr)."deg); -o-filter : hue-rotate(".($i*$incr)."deg); filter : hue-rotate(".($i*$incr)."deg); max-width:50px; }";
      if ($sprite === false) {
        $div_paletteList .= '<img id="p'.$i.'" src="'.$src.'" class="paletteItem p'.$i.'" onclick="rotatePalette(this);"'.$bg.' />';
      } else {
        //25 px high max
        $hAdjusted = 25 / $sprite->frameHeight;
        $wAdjusted = 25 / $sprite->frameWidth;
        $scale = ($hAdjusted < $wAdjusted) ? $hAdjusted : $wAdjusted;
        $scaleStyle = "-webkit-transform:scale($scale);-moz-transform:scale($scale);-ms-transform:scale($scale);-o-transform:scale($scale);transform:scale($scale);-webkit-transform-origin:top left;-moz-transform-origin:top left;-ms-transform-origin:top left;-o-transform-origin:top left;transform-origin:top left;";

        $div_paletteList .= '<div style="display:inline-block;margin-right:2px;margin-left:2px; overflow:hidden;height:'.$sprite->frameHeight*$scale.'px; width:'.$sprite->frameWidth*$scale.'px;">';
        $div_paletteList .= '<div id="p'.$i.'" class="p'.$i.'" onclick="rotatePalette(this);"  style="background-image:url('.$src.'); height:'.$sprite->frameHeight.'px; width:'.$sprite->frameWidth.'px; overflow:hidden;display:inline-block;position:relative;vertical-align:top;'.$scaleStyle.'"></div>';
        $div_paletteList .= "</div>";
      }
      $pCSS = $i;
    }
    $pCSS = 0;  //flag so we're not duplicating the styles all over the place when we don't need to
    $div_paletteList .= "</div>";
  }


  $palAge = 0;
  if (isset($_SESSION['pal_age'])) {
    $palAge = $_SESSION['pal_age'];
    if ($palAge === '' || $palAge == 0) $palAge = 0;  //damn 'helpful' typecasting...

  }


  require_once "loadHabitat.php";  //do the actual loading from the database to balance server/client processing load

?>
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="cache-control" content="no-cache"> <!-- tells browser not to cache -->
  <meta http-equiv="expires" content="0"> <!-- says that the cache expires now -->
  <meta http-equiv="pragma" content="no-cache"> <!-- says not to use cached stuff, if there is any -->

  <title>BittyPals Beta!</title>
  <?php echo $requiredHead; ?>
  <link rel="stylesheet" href="css/habitat.css?v=<?php echo time(); ?>" />

  <!--[if IE]>
  <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
  <![endif]-->

  <script src="js/Item.js?v=<?php echo time(); ?>"></script>
  <script src="js/editing.js?v=<?php echo time(); ?>"></script>
  <script src="js/habitat.js?v=<?php echo time(); ?>"></script>
  <script src="js/animateSprite.js?v=<?php echo time(); ?>"></script>
  <script src="js/Sprite.js?v=<?php echo time(); ?>"></script>
  <script src="js/Effect.js?v=<?php echo time(); ?>"></script>
  <script src="js/constructors.js?v=<?php echo time(); ?>"></script>
  <script src="js/pp.js?v=<?php echo time(); ?>"></script>
  <script src="js/modules/MasterList.js?v=<?php echo time(); ?>"></script>
  <script src="js/collectibles.js?v=<?php echo time(); ?>"></script>
  <script src="js/inventory.js?v=<?php echo time(); ?>"></script>
  <?php includeJSDir('js/widgets/'); ?>
  <!-- <script src="js/html2canvas.js"></script> -->
  <script src="https://www.paypalobjects.com/api/checkout.js"></script>
  <script>
    <?php echo $baseJSVars; ?>
    var paletteIncrement = <?php echo $increment; ?>;
    var pCSS = <?php echo $pCSS; ?>;
    var siteOptions = <?php echo $siteOptions; ?>;

    var habitatID = <?php echo $loadhid; ?>;
    var currentRoom = <?php echo $currentRoom; ?>;
    var petID = <?php echo $petid; ?>;
    var petOb = <?php echo $petob; ?>;
    var playerOb = <?php echo $playerob; ?>;
    var underConstruction = <?php echo $underConstruction; ?>;
    var habitatUsername = '<?php echo $husername; ?>';
    var habitatItem;
    var preparedSearch = INVENTORY;
    var cID = playerID; //for inventory searching
    var editing = 0; //this will be a toggle
    var editable = <?php echo $editable; ?>; //whether or not this habitat belongs to the player
    var isFriend = <?php echo $isFriend; ?>;
    var firstFriend = <?php echo $firstFriend; ?>;
    var giftCount = <?php echo $giftCount; ?>;
    var zArray = []; //array of habitat items (also used for layer swapping)
    var trophies = <?php echo json_encode($trophies); ?>;
    var trophyData = <?php echo json_encode($trophyData); ?>;
    var trophyNotify = <?php  echo $trophyNotify; ?>;
    var palAge = <?php echo $palAge; ?>;
    var hasGarden = <?php echo $habHasGarden; ?>;

    <?php echo $hJSON; ?>

    var DEBUG = true;
    if(!DEBUG){
        if(!window.console) window.console = {};
        var methods = ["log", "debug", "warn", "info"];
        for(var i=0;i<methods.length;i++){
            console[methods[i]] = function(){/*in case there isn't a bloody console*/};
        }
    }


          //INITIALIZE THE PAGE ELEMENTS
    $(document).ready(function () {
      <?php echo $onReady; ?>

      if (playerID == 146) { pp_env = 'sandbox'; console.log("Switching to PP Sandbox"); } //TODO: This is only for testing...

      //set the garden button
      if (hasGarden == 1) $("#gardenButton").append('<div class="bouncy_ep_small"></div>');
      //hide the interactive button
      $(".interactive").hide();

      if (playerID == 0) {
        //something went wrong with the login process...
        alert("We've encountered an error with your login\nPlease attempt to log in again");
        logout();
        return false;
      }
      hideFXButton();

      if (initialize()) {
        addBouncyEP('stor', true);

        setPage('Home');
        currentPage = "habitat";
        updatePlayerMoney(playerID);
        // $("#habitat").css("background-image", "url('<?php //echo $habSource; ?>')");
        zArray.sort(compareZ);  //sort the zArray into the proper order
        sortLayers(0, false);
        // console.log("initial sort", zArray);
        // $('.item').mousedown(function(e){e.preventDefault();e.stopPropagation();}); //kill default mouse handler (no "ghosting" of images)
        $('.item').on('mousedown touchstart', function(e){startDrag(e);});
        $("#inventoryContent").hide();
        $("#home").addClass("nav_tab_active");  //should probably do this more dynamically...
        $("#cbMain").css("visibility", "visible");
        $("#cbMain").fadeTo(100, 1);

        displayTrophies();

        initCurrentModules();

        if (underConstruction == 1 && editable == 0) disableRoomController();
        if (underConstruction != 1 || editable == 1) {
          initRoomController();
          if (currentRoom != 1) {
            // console.log("moving habitat to room ", currentRoom);
            var ih = $("#innerHab");
            switch(habitatItem.roomDir) {
              case "hv":
                if (currentRoom == 2 || currentRoom == 4) ih.css({left:"-1126px"});
                if (currentRoom == 3 || currentRoom == 4) ih.css({top:"-430px"});
              break;
              case "v":
                var sy = (currentRoom - 1) * -430;
                ih.css({top:sy + "px"});
              break;
              case "h":
                var sx = (currentRoom - 1) * -1126;
                ih.css({left:sx + "px"});
              break;
              default:
                console.error("Something wrong with shifting habitat");
              break;
            }
          }
        }

        paramQuery({select:["*"], table:"news", limit:1, order:["id", 'DESC']}, displayNews);

        var clgauges = "<strong>" + playerOb.username + '</strong>: Level <span id="plLvl">' + playerOb.level + "</span><br /> ";// + getLevelGauge(playerOb.level, playerOb.xp, 'playerLevelGauge');
        clgauges += "<br /><strong>" + petOb.name + '</strong>: Level <span id="ptLvl">' + petOb.level + "</span><br /> ";// + getLevelGauge(petOb.level, petOb.xp);
        $("#centerLeft").html(clgauges);


        if (editable) {
          if (petOb.level_notified == '0') givePetXP(petOb.id, 0, false, true);
          $("#pdate").remove();
          paramQuery({id:petID}, displayCareLevels, GETCARELEVELS);
          paramQuery(cParams, loadCats);  //getting the categories for nav
          // $("#habName").html(habitatUsername + " &amp; " + petOb.name + "'s Place");
          $("#habName").html("<strong>" + petOb.name + '</strong>: Level <span id="ptLvl">' + petOb.level + "</span> " + getLevelGauge(petOb.level, petOb.xp));
          $("#playerLevel").html("<strong>" + playerOb.username + '</strong>: Level <span id="plLvl">' + playerOb.level + "</span> " + getLevelGauge(playerOb.level, playerOb.xp, 'playerLevelGauge'));
          searchInventory();  //this loads the inventory
          // console.log(spinnerShown, freeSpin);
          if (spinnerShown == 0 && freeSpin == 1) initSpinner(true);
          loadQuote();
          $("#centerCenter").attr("title", "Click here to edit your quote :)");
          enableQuote();
          $(document).on('click', function (e) {
            if ($(e.target).attr('id') == "habitat") deactivateCurrent();
          })

          if (giftCount > 0) {
            // $("#giftNotify")  //show or hide
          } else {
            $("#giftNotify").hide();
          }

        } else {
          setFriendButton();
          // $("#playOther").html("Play with " + petOb.name);
          // $("#playOther").html("Play");
          $("#habName").html(habitatUsername + " &amp; " + petOb.name + "'s Place");
          loadQuote();
          // $("#habOwner").html(habitatUsername);
          //check to see if they can play with their friend's Pal
          if (<?php echo $canPlayOther; ?> == 0) {
            // console.log("can not play");
            disablePlayOther();
          }
        }
      }
      if (trophyNotify == 1) {
        checkTrophyNotification();
        setSessionVar('trophy_notify', 0);
      }
    });

    function disablePlayOther() {
      var pb = $("#playOther");
      pb.removeClass('play');
      pb.addClass('played');
      pb.removeAttr('onclick');
      pb.on('click', function() { popNotify("You have already played today.<br />Come back tomorrow!")});
    }

    function displayNews(r) {
      var n = $("#newsContent");
      n.empty();  //just in case

      //table for additional stuffs and special offer type things
      var addTable = $("<table/>");
      var addRow = $("<tr/>");
      //monthly support badges
      addRow.append($("<td/>", {
          class:"split",
          style:"border-right:1px solid silver"
        }).html('<img class="monthly_img" src="'+siteOptions.monthly_src+'" title="Limited Edition!"/><strong>Limited Edition Monthly Supporter Badge!</strong><br />For a small donation of $5 (USD), you can now get a one-time-only trophy and item!  Once each month ends its badge will <em>never be offered again!</em><br />Help support Bitty-Pals and show your decorating pride before this one\'s gone!<div id="monthlyBtn" style="width:100%; text-align:center;"></div>'));


      addRow.append($("<td/>", {
          id:"collectionCell",
          class:"split",
          style:"border-right:1px solid silver"
        }));



      addTable.append(addRow);

      //invitations
      var invitationRow = $("<tr/>");
      invitationRow.append($("<td/>", {
        colspan:2,
        class:"split",
        style:"border-top:1px solid silver"
      }).html('<img class="fm_img" src="assets/trophies/friendmaker.png"/><strong>Want to earn some spiffy coins, or just some extra gold?</strong><br />Bitty-Pals <strong>invitations</strong> are now live! All you have to do is click on <a href="invite">this link</a> and send an invitation to a friend, and as soon as they join, both of you will get a special gift, only available through invitations!  Click <a href="invite">here</a> to find out more!'));
      addTable.append(invitationRow);

      n.append(addTable);
      n.append("<hr/>");

      n.append('<div class="section_header" style="cursor:pointer;" onclick="window.location = \'news\';" title="Go to Bitty News Page">The Bitty Post</div><hr />');
      var article = r[0];
      var display = $("<div/>",{ style:"width:95%;padding:10px;text-align:left;" });
      display.append($("<span/>",{style:"font-size:1.3em;text-decoration:underline;"}).html(article.title));
      display.append($("<span/>",{style:"font-size:.8em;margin-left:20px;"}).html("<br />Posted by: " + article.author + " on " + article.news_date));
      display.append("<hr />");
      display.append(article.entry);

      n.append(display);
      n.append("<hr />");


      n.append('<a href="news">Read Older Articles</a>');
      n.append("<hr />");
      n.append('<strong>Feed the Squishy!<br />Would you like to help BittyPals out with a donation?</strong><br />There\'s absolutely no obligation for you to donate, and we will NEVER require you to spend real money to play with your Pal, but we do have some great plans for the future of the BittyPals Community, and every dollar helps us keep Squishy working on it full time (and fed), instead of having to take contracts to cover his bills ;)<br /><br />We can take direct PayPal accounts, or, if you don\'t have a PayPal account, we can take direct credit/debit card payments.  Both of these options run securely through the PayPal interface.<br /><?php echo $donateBox; ?><br />');

      createMonthlyButton();

      paramQuery({}, initCollectionCell, 'get_collectibles', 'collectibleQuery');
    }

    function setFriendButton(friended) {
      if (friended != undefined) isFriend = (friended) ? 1 : 0;
      var fb = $("#fbutton");
      if (isFriend == 1) {
        fb.attr('onclick', "removeFriend('<?php echo $loadpid; ?>')");
        fb.removeClass('friendadd');
        fb.addClass('friendremove');
        fb.attr('title', "Remove Friend");
      } else {
        fb.attr('onclick', "addFriend('<?php echo $loadpid; ?>')");
        fb.removeClass('friendremove');
        fb.addClass('friendadd');
        fb.attr('title', "Add Friend");
      }
    }

    function initialize() {
      if (underConstruction && !editable) {
        //just put a big damn curtain in the way of everything...
        var curtain = $("<img/>", {src:"assets/site/ConstructionCurtain.png"});
        $("#habitat").append(curtain);
      } else {
        var i = 0;
        for (i; i < dbi.length; i++) {
          var item = new Item(dbi[i]);
          if (item.wid > 0) $(".interactive").show();
          if (item.init(true)) continue;
        }
        console.log(i + " items in habitat initialized");
      }

      //get the proper anniversary trophy id and give it to them
      if (Number(palAge) > 0) {
        paramQuery({age:palAge}, giveAnniversaryTrophy, 'get_anniversary_trophy');
      }
      return true;
    }

    function giveAnniversaryTrophy(r) {
      if (r.id == "Invalid result set") {
        console.log("Invalid anniversary trophy id");
        return;
      }
      givePlayerTrophy(playerID, r.id);
    }


    function editHabitat() {
      editing = 1;
      $("#midPane").hide(100);
      $('.item').unbind("mousedown touchstart tapstart");  //clean up handlers
      $('.item').on('mousedown touchstart', function(e){startDrag(e);});
      // $('.item').on('tapstart', function(e) {startDrag(e);});

      $("#rotateHandle").on('mousedown touchstart', function(e){startRotate(e);});
      // $("#rotateHandle").on('tapstart', function(e){startRotate(e);});

      hideAndShow("cbMain", "cbEdit");
      $("#newsContent").hide(250);
      $("#searchField").on("keypress",function(e){if(e.keyCode==13){searchInventory();}});

      $("#scaleSlider").on('change input', function() { changeScale(this.value); });
      $("#inventoryContent").show(500);
    }
    function closeEditor() {
      editing = 0;
      $("#midPane").show(250);
      $("#searchField").unbind("keypress");
      // $('.item').unbind("mousedown touchstart");
      // $('.item').on('mousedown touchstart',function(e){e.preventDefault();e.stopPropagation();}); //kill default mouse handler (no "ghosting" of images)

      $("#rotateHandle").unbind("mousedown touchstart");
      hideAndShow("cbEdit", "cbMain");
      $("#inventoryContent").hide(250, function(){$("#newsContent").show(500)})
    }

    function careLevel(hours, increment) {
      var i = 1;
      var inc = 0;
      var blocks = 24/increment;
      var blockrange = 24/blocks;
      for (var i = 1; i < blocks; i++) {
        if (hours < i*blockrange) {
          var per = 100 - ((i-1)*blockrange / 24 * 100);
          if (i <= 1) per = 100;
          return {p:per, warn:(per < 15)};
        }
      }
      return {p:5, warn:true};
    }

    function displayCareLevels(r) {
      // console.log(r);
      var feed = careLevel(r.feed.h, 8);
      // console.log("feed", feed);
      setStatus("feed", feed.p, feed.warn);

      var groom = careLevel(r.groom.h, 4);
      // console.log("groom", groom);
      setStatus("groom", groom.p, groom.warn);

      var play = careLevel(r.play.h, 1);
      // console.log("play", play);
      setStatus("play", play.p, play.warn);
    }

    function setStatus(barname, percent, warning) {
      var bar = $("#pal_" + barname + "_bar");
      var bgc = (warning) ? "orange" : "green";
      bar.css("background-color", bgc);
      bar.css("width", percent + "%");
      if (percent == 100) {
        $("#" + barname + "Btn").removeAttr("onclick");
      }
    }

    function carePal(type) {
      paramQuery({id:petID}, valStatus, type);
      givePetXP(petID, 20);
      givePlayerXP(playerID, 10);
      givePlayerMoney(playerID, {silver:10});
      setStatus(type, 100, false);
      var xclaim = (type == 'feed') ? "Yum!" : (type == 'groom') ? "Scrub scrub!" : "Whee!";
      popNotify(xclaim + "<br /><strong>" + petOb.name + '</strong> has earned 20 XP<br />You have earned 10 XP<br />You have earned 5 <img src="assets/site/coin-silver.png" />');
    }

    function valStatus(r) {
      if (r != '') console.log(r);
    }

    function showHabPaletteButton() {
      // console.log("ShowHPB");
      // var b = $("<button/>", { onclick:"showHabPalette();"} ).html("Hab Colour");
      $("#habPaletteButton").show();
    }
    function showHabPalette() {
      if (cItem != null) cItem.deactivate();
      habitatItem._palette.show();
      showPalette(true);
    }
    function hideHabPaletteButton() {
      // console.log("HideHPB");
      $("#habPaletteButton").hide();
    }

    function deactivateCurrent() {
      // console.log("deactivateCurrent");
      if (cItem != null) {
        cItem.deactivate();
      }
    }


    function goToFriends() {
      if (firstFriend == 0) {
        popNotify("You don't have anyone in your friend list!<br />Go to the Friends page to find some :)");
      } else {
        window.location = 'habitat/' + firstFriend;
      }
    }






    function snapshot() {
      printToFile(document.getElementById('habitat'));
    }

    //Your modified code.
    function printToFile(div) {
      html2canvas(div, {
        onrendered: function (canvas) {
          var myImage = canvas.toDataURL("image/png");
          //create your own dialog with warning before saving file
          //beforeDownloadReadMessage();
          //Then download file

          downloadURI("data:" + myImage, "yourImage.png");
        }
      });

    }
    //Creating dynamic link that automatically click
    function downloadURI(uri, name) {
      var link = document.createElement("a");
      link.download = name;
      link.href = uri;
      link.click();
      //after creating link you should delete dynamic link
      // clearDynamicLink(link);
    }




    function getTrophyData(id) {
      for (var i = 0; i < trophyData.length; i++) {
        if (id == trophyData[i].id) return trophyData[i];
      }
      console.error("Could not find trophy data for id: " + id);
      return false;
    }

    function displayTrophies() {
      var con = $("#trophyCell");
      if (trophies.length == 0) {
        con.html("No Trophies to Display...Yet");
      } else {
        con.html("");
        for (var i = 0; i < trophies.length; i++) {
          var t = getTrophyData(trophies[i].tid);
          var tcon = $("<div />", {
            class:'trophy',
            title:t.name
          });
          var img = $("<img />", {src:t.src});
          tcon.append(img);
          con.append(tcon);
        }
      }
    }



  </script>

  <style>
  <?php echo $css_paletteItems; ?>
  <?php echo $css_paletteList; ?>






  </style>
</head>

<body class="site">
<?php echo $alertPanes; ?>


<main class="site_content"><center>
  <?php echo $playerTab; ?>

  <div class="room_controller offscreen" id="roomController">
    <table>
      <tr>
        <td colspan="3" style="text-align:right;"><button class="close_button_sprite" onclick="toggleRoomController()" title="Hide"></button></td>
      </tr>
      <tr>
        <td width="33%"></td>
        <td width="33%" id="rc_u" class="rcarrow" onclick="slideRoom(this);">&uarr;</td>
        <td width="33%"></td>
      </tr>
      <tr>
        <td width="33%" id="rc_l" class="rcarrow" onclick="slideRoom(this);">&larr;</td>
        <td width="33%"></td>
        <td width="33%" id="rc_r" class="rcarrow" onclick="slideRoom(this);">&rarr;</td>
      </tr>
      <tr>
        <td width="33%"></td>
        <td width="33%" id="rc_d" class="rcarrow" onclick="slideRoom(this);">&darr;</td>
        <td width="33%"></td>
      </tr>
    </table>
  </div>

  <div id="gameFrame" class="game_frame content">

    <?php echo $gameHeader; ?>
    <div id="habitat" class="habitat">
      <div id="innerHab" style="position:absolute; top:0px; left:0px;">
        <div id="habBackground"></div>
        <?php echo $item_list; ?>
      </div>
      <div id="habOverlay"></div>
    </div>

    <!-- CONTROL BAR -->
    <div id="controlBar" class="control_bar">

      <?php if ($editable == 1): ?>
        <!-- main control bar -->
        <div id="cbMain" class="cb_div">

          <ul class="smooth_btn_container">
            <li class="collapsed left feed" id="feedBtn" onclick="carePal('feed');" title="Feed Pal">
              <div class="pal_status_bar"><div class="pal_status" id="pal_feed_bar"></div></div>
            </li>
            <li class="collapsed groom" id="groomBtn" onclick="carePal('groom');" title="Groom Pal">
              <div class="pal_status_bar"><div class="pal_status" id="pal_groom_bar"></div></div>
            </li>
            <li class="collapsed right play" id="playBtn" onclick="carePal('play');" title="Play with Pal">
              <div class="pal_status_bar"><div class="pal_status" id="pal_play_bar"></div></div>
            </li>
          </ul>

          <div id="playerLevel" class="smooth_btn_container" style="float:none; font-size:1.5em;"></div>

          <ul class="smooth_btn_container" style="float:right; margin-right:20px;">
            <!-- testing -->
            <!-- <li class="spaced solo" style="width:100px;" onclick="snapshot();">Snapshot</li> -->
            <!-- end testing -->
            <li class="spaced solo interactive" onclick="showInteractive();" title="Show Interactive Items"></li>
            <li class="spaced solo decorate" title="Decorate" onclick="editHabitat();"></li>
            <li class="spaced solo rooms" onclick="toggleRoomController();" title="Look at the Other Rooms in This Habitat"></li>
            <li class="spaced solo spinner" title="Open the Chance Wheel" onclick="showSpinner();"></li>
            <li class="spaced solo playdate" title="Go Play With Friends" onclick="goToFriends();"></li>
            <li class="spaced solo giftnotify" title="You have unopened gifts!" onclick="openGifts();" id="giftNotify" style="background-color:#55aa55;">
              <img src="assets/site/gift.png" style="height:40px;" />
            </li>
          </ul>

        </div>

          <!-- EDITING CONTROLS -->
        <!-- primary editing control bar -->
        <div id="cbEdit" class="cb_div">
          <!--main control bar elements will go here-->
          <input type="range" id="scaleSlider" value=".75" step=".05" min=".3" max="1" style="display:inline-block;width:150px;vertical-align:top;">

          <ul class="smooth_btn_container" style="float:none;">
            <li class="collapsed ceiling left" title="Bring to Front" onclick="layer('ceiling');"></li>
            <li class="collapsed up" title="Bring Forward One Level" onclick="layer('up');"></li>
            <li class="collapsed down" title="Send Back One Level" onclick="layer('down');"></li>
            <li class="collapsed floor" title="Send to Back" onclick="layer('floor');"></li>
            <li class="collapsed mirror right" title="Flip Item" onclick="mirror();"></li>
          </ul>


          <ul class="smooth_btn_container" style="float:none; vertical-align:top;">
            <li class="spaced solo" onclick="showHabPalette();" id="habPaletteButton" title="Habitat Colour">Hab Col</li>
            <li class="spaced solo removeitem" onclick="removeItemFromHabitat();" title="Remove Item From Habitat"></li>
            <li class="collapsed left donecheck" onclick="saveAndDeactivate();" title="Save Changes to the Selected Item" style="width:20px;"></li>
            <li class="collapsed right donethumb" onclick="doneEditing();" title="Done Decorating" style="width:20px; vertical-align:top; margin-right:15px;"></li>

            <li class="spaced solo clear_habby" onclick="emptyHabitat();" title="Empty Habitat"></li>

            <li class="spaced solo storage" onclick="startNewHabitat();" title="Store This Habitat in the Toy Box and Start a New One"></li>

            <li style="display:inline-block; vertical-align:top; font-size:12px;">
              Under<br />Construction<br />
              <input type="checkbox" id="constructionCheckbox" <?php if ($underConstruction) echo 'checked="checked"'; ?> onchange="setConstruction(this);"/>
            </li>


            <li class="spaced solo rooms" onclick="toggleRoomController();" title="Look at the Other Rooms in This Habitat"></li>
            <li class="spaced solo centerpal" onclick="centerPal();" title="Center Your Pal in This Room"></li>
            <li class="spaced solo rename_habby" onclick="renameHabby();" title="Rename this Habitat (this is how it will show up in your Toybox)"></li>


            <li id="fxButton" class="spaced solo" style="width:auto; font-size:18px;" onclick="removeFX();" title="Remove the Effects from your habitat">
              Remove<br />Effects
            </li>

          </ul>
          <!-- palette bar -->
          <div id="cbPalette" class="cb_div">
            <?php echo $div_paletteList; ?>
          </div>
        </div>
      <?php endif; if ($editable == 0): ?>
        <!-- main control bar -->
        <div id="cbMain" class="cb_div">

          <ul class="smooth_btn_container" style="float:left;">
            <li class="collapsed left larrow" title="Last Friend" onclick="window.location='habitat/<?php echo $lastfriend; ?>';"></li>
            <li class="collapsed play" id="playOther" title="Play With Pal" onclick="playOtherPet('<?php echo $petid; ?>')"></li>
            <li class="collapsed right rarrow" title="Next Friend" onclick="window.location='habitat/<?php echo $nextfriend; ?>';"></li>
          </ul>




          <span id="habOwner">
            <ul class="smooth_btn_container" style="float:none; vertical-align:top;">
              <li class="spaced solo interactive" onclick="showInteractive();" title="Show Interactive Items"></li>
              <li class="spaced solo rooms" onclick="toggleRoomController();" title="Look at the Other Rooms in This Habitat"></li>
            </ul>
          </span>

          <!-- <ul class="control_button_container" style="float:right; margin-right:10px;">
            <li class="control_button left" onclick="window.location='gift/<?php echo $loadpid; ?>'">Send Gift</li>
            <li class="control_button" onclick="showMessagePrompt('<?php echo $loadpid; ?>')" title="Send Message">Message</li>
            <li class="control_button" onclick="openProfile('<?php echo $loadpid; ?>')">Profile</li>
            <li class="control_button right" id="fbutton">Friend</li>
          </ul> -->

          <ul class="smooth_btn_container" style="float:right; margin-right:10px;">
            <li class="collapsed left giftbutton" title="Send Gift" onclick="window.location='gift/<?php echo $loadpid; ?>'"></li>
            <li class="collapsed messagebutton" title="Send Message" onclick="showMessagePrompt('<?php echo $loadpid; ?>')"></li>
            <li class="collapsed gardenbutton" title="Visit Garden" onclick="window.location='garden/<?php echo $loadpid; ?>'" id="gardenButton"></li>
            <li class="collapsed profilebutton" title="View Profile" onclick="openProfile('<?php echo $loadpid; ?>')"></li>
            <li class="collapsed right friendadd" id="fbutton"></li>
          </ul>

        </div>

      <?php endif; ?>


    </div>


    <div id="midPane" class="site_content static_content" style="height:100px;">
      <table id="centerTable">
        <tr>
          <!-- xp -->
          <td id="centerLeft" class="leftcell">
            xp
          </td>
          <!-- quote -->
          <td id="centerCenter" class="centercell">
            No current quote
          </td>
          <!-- trophies -->
          <td id="trophyCell" class="rightcell" style="cursor:pointer;" onclick="window.location='trophies/<?php echo $loadpid; ?>';">
          </td>
        </tr>
      </table>
    </div>

    <!-- Inventory -->
    <div id="lowerPane" class="lower_pane site_content static_content">


      <div id="newsContent">
        <div class="section_header"></div>
        <!-- This is where some news-type content will go? -->
      </div>

      <div id="inventoryContent">
        <div class="section_header">Inventory</div>
        <div id="lowerTitle"></div>
        <table style="width:100%; border-collapse:collapse;"><tr>
          <td id="inventoryNav" class="inventory_nav" rowspan="3">
            <?php echo $inventorySearch.$storage; ?>
          </td>
          <td style="border-top:1px solid black;"><?php echo $breadCrumb; ?></td>
          <tr><td id="inventoryList" class="inventory_list">
            <ul id="itemBlocks"></ul>
          </td></tr>
          <tr><td style="border-top:1px solid black;"><?php echo $breadCrumb; ?></td></tr>
        </table>
      </div>

    </div>

  </div>



</center></main>



<!-- this will remain as a static singleton on the page, leveraged for all item rotation -->
<div id="rotateBox" class="rotate_box"> <button id="rotateHandle" class="rotate_handle">&#8635;</button></div>
<?php echo $footer; ?>
</body>
</html>
