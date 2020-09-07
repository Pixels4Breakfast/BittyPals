<?php
  ini_set('session.gc_maxlifetime', 10800);
  // each client should remember their session id for EXACTLY 3 hours
  session_set_cookie_params(10800);
  session_start(); // ready to go!

  date_default_timezone_set("America/Denver");
  $snow = time();
  if (isset($_SESSION['discard_after']) && $snow > $_SESSION['discard_after']) {
    // this session has worn out its welcome; kill it and start a brand new one
    session_unset();
    session_destroy();
    session_start();
  }
  // either new or old, it should live at most for another six hours
  $_SESSION['discard_after'] = $snow + 26000;

  // session_start();
  $local = ($_SERVER['HTTP_HOST'] == "localhost");
  $DBservername = ($local) ? "localhost" : "localhost";
  $DBusername = ($local) ? "root" : "dustyd_bp";
  $DBpassword = ($local) ? "" : "hellionsNGC2314";
  $dbname = ($local) ? "bptest" : "dustyd_bp";
  $bypass = ($local) ? true : false;

  //stub for itty-bitty-db
  $ibServername = ($local) ? "localhost" : "localhost";
  $ibUsername = ($local) ? "root" : 'dustyd_bp';
  $ibPassword = ($local) ? "" : "hellionsNGC2314";
  $ibDBName = "dustyd_ib";

  //the the maintenance if it's set
  $mnDisplay = 'display:none;';
  $maintenanceNotification = '';
  if (!isset($_SESSION['maintenance'])) {
    $_SESSION['maintenance'] = new stdClass();
  }
  $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
  if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
  $maintenanceSched = $conn->query("SELECT maintenance, maint_start, maint_end FROM siteoptions") or die($conn->error);
  $mSched = $maintenanceSched->fetch_object();
  $mSession = $_SESSION['maintenance'];
  $mSession->active = 0;
  $mSession->pending = 0;
  $mSession->in_progress = 0;
  if ($mSched->maintenance == 1) {
    $mSession->active = 1;
    $mSession->start = $mSched->maint_start;
    $mSession->end = $mSched->maint_end;
    //figure out if it's currently active
    $ms = strtotime($mSession->start);
    $mend = strtotime($mSession->end);
    $dtoday = date($snow);
    if ($ms > $dtoday) {
      $mSession->pending = 1;
    }
    if ($dtoday > $mend) {
      $mSession->active = 0;
    }
    if ($ms < $dtoday && $mend > $dtoday) {
      $mSession->in_progress = 1;
    }
  }
  $dbbg = $conn->query("SELECT background FROM siteoptions") or die($conn->error);
  $siteBackground = $dbbg->fetch_object()->background;
  // print_r($mSession);
  // echo "\nNow: ".$dtoday." \nStart: ".$ms." \nEnd: ".$mend;

  @$conn->close();
  if (!isset($_SESSION['maintenance']->override)) $_SESSION['maintenance']->override = 0;
  if ($_SESSION['maintenance']->active == 1) {
    $mnDisplay = "display:inline-block;";
    $maintenanceNotification = "NOTICE:<div>BittyPals will be offline for scheduled maintenance from ".$_SESSION['maintenance']->start." through ".$_SESSION['maintenance']->end."<br />Please save your changes and log out before then to avoid any unexpected losses</div>";
  }



  $today = date("Y-m-d");

  function gdo($s) { //get date object
    $boom = explode("-", $s);
    return (object) array('y'=>$boom[0], 'm'=>$boom[1], 'd'=>$boom[2]);
  }
  function gto($s) { //get time object
    $boom = explode(":", $s);
    return (object) array('h'=>$boom[0], 'i'=>$boom[1], 's'=>$boom[2]);
  }

  function timeDif($t1, $t2 = null) {
    if (null === $t2) $t2 = date("Y-m-d H:i:s");

    $t1 = date_create($t1);
    $t1 =  date_format($t1,"Y-m-d H:i:s");
    $comp1 = (object) array('date'=>gdo(explode(" ", $t1)[0]));
    if (count(explode(" ", $t1)) > 1) $comp1->time = gto(explode(" ", $t1)[1]);
    $comp2 = (object) array('date'=>gdo(explode(" ", $t2)[0]));
    if (count(explode(" ", $t2)) > 1) $comp2->time = gto(explode(" ", $t2)[1]);

    $offset = [];
    $offset['d1'] = $comp1;
    $offset['d2'] = $comp2;
    $offset['y'] = $comp2->date->y - $comp1->date->y;
    $offset['m'] = ($offset['y'] * 12) + $comp2->date->m - $comp1->date->m;
    $offset['d'] = ($offset['m'] * 28) + $comp2->date->d - $comp1->date->d;
    if ($offset['m'] > 0) {
      $offset['d'] = $comp1->date->d;
    }
    if (count(explode(" ", $t1)) > 1) $offset['h'] = ($offset['d'] * 24) + $comp2->time->h - $comp1->time->h;

    $offset = (object) $offset;
    return $offset;
  }


  function getAvatar($hash) {
    $s = 100;
    $d = 'mm';
    $r = 'g';
    $url = 'https://www.gravatar.com/avatar/';
    $url .= $hash;
    $url .= "?s=".$s."&d=".$d."&r=".$r;
    return $url;
  }

  function includeJSDir($path) {
    $files = scandir($path);
    for ($i=0;$i<count($files);$i++) {
      if($files[$i] != '.' && $files[$i] != '..')
        echo '<script type="text/javascript" src="'.$path.$files[$i].'?v='.time().'"></script>';
    }
  }

  // $_SESSION["player_id"] = $rows["id"];
  // $_SESSION["player_username"] = $rows["username"];
  // $_SESSION["player_email"] = $rows["email"];
  // $_SESSION["player_xp"] = $rows["xp"];
  // $_SESSION["free_spin"] = $rows["free_spin"];
  // $_SESSION["active_hab"] = $rows["active_hab"];
  // $_SESSION["privileges"] = $rows["privileges"];
  // $_SESSION["friends"] = $rows["friends"];


  $killCache = '<meta http-equiv="cache-control" content="no-cache"> <!-- tells browser not to cache -->
  <meta http-equiv="expires" content="0"> <!-- says that the cache expires now -->
  <meta http-equiv="pragma" content="no-cache"> <!-- says not to use cached stuff, if there is any -->';


                                      //includes for all pages
  //META
  $requiredHead =  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
                  .'<meta name="copyright" content="BittyPals is a registered trademeart of MythPlaced Treasures, LLC and &copy; 2017" />'
                  .'<meta name="description" content="Discover a world of friendly new Pals and a great Community! Raise a Pal, design your habitat, and get to know your neighbours!" />'
                  .'<meta name="keywords" content="bitty,pals,pal,bittypals,bittypal,bitty pals,bitty pal,bittypets,super,poke,superpoke,superpokepets,pets,design,casual,game,casual game,mobile,mobile game,community,design,relax,chill,no flash,bittie,bitties" />'
                  .'<meta name="robots" content="index,follow" />'
                  .'<meta name="DC.title" content="Welcome to BittyPals!" />';
  //CSS
  $requiredHead .= '<link rel="stylesheet" href="css/global.css?v='.time().'" />'
                  .'<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />'
                  .'<link rel="stylesheet" type="text/css" href="plugs/sweetalert/sweetalert.css">'
                  .'<link rel="stylesheet" type="text/css" href="css/mail.css?v='.time().'">'
                  .'<link rel="stylesheet" type="text/css" href="css/avatarStyle.css">'
                  .'<link rel="icon" href="assets/site/favicon.png">';

  //jQuery
  $requiredHead .= '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>'
                  .'<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>'
                  .'<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.1/jquery.form.min.js"></script>';

  //Plugins
  $requiredHead .= '<script src="plugs/sweetalert/sweetalert.min.js"></script>';
  // $requiredHead .= '<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>';

  //BittyPals
  //currently set with mktime for beta testing/rapid iteration.  Remove 'v' query string to enable caching
  $requiredHead .= '<script src="js/utils.js?v='.time().'"></script>'
                  .'<script src="js/search.js?v='.time().'"></script>'
                  .'<script src="js/Popup.js?v='.time().'"></script>'
                  .'<script src="js/mail.js?v='.time().'"></script>'
                  .'<script src="js/sounds.js?v='.time().'"></script>'
                  .'<script src="js/spinner.js?v='.time().'"></script>'
                  ."<script>var siteBackground = '$siteBackground';</script>";



  $onReady = 'loadSounds();maintenanceLogout('.$_SESSION['maintenance']->override.');';



  $cc = (isset($_SESSION['num_items_in_cart'])) ? $_SESSION['num_items_in_cart'] : 0;

  $pid = (isset($_SESSION["player_id"])) ? $_SESSION["player_id"] : 0;
  $username = (isset($_SESSION["player_username"])) ? $_SESSION["player_username"] : "unknown";
  $freeSpin = (isset($_SESSION["free_spin"])) ? $_SESSION["free_spin"] : 0;
  $privileges = (isset($_SESSION["privileges"])) ? $_SESSION["privileges"] : 0;
  $showAds = (isset($_SESSION['show_ads'])) ? $_SESSION['show_ads'] : 1;
  $spinnerShown = (isset($_SESSION['spinner_shown'])) ? $_SESSION['spinner_shown'] : 0;

  $spinDif = (isset($_SESSION["spinDif"])) ? $_SESSION["spinDif"] : "'unknown'";

  $mute = (isset($_SESSION['mute'])) ? $_SESSION["mute"] : 0;




  $baseJSVars =  "var playerID = $pid;"
                ."var playerUsername = '$username';"
                ."var privileges = $privileges;"
                ."var freeSpin = $freeSpin;"
                ."var spinDif = $spinDif;"  //killthis
                ."var dateToday = '$today';"
                ."var showAds = $showAds;"
                ."var spinnerShown = $spinnerShown;"
                ."var maintenanceInProgress = ".$_SESSION['maintenance']->in_progress.";"
                ."var movrd = ".$_SESSION['maintenance']->override.";"
                ."var mute = $mute;";



  $donateBox = 'Amount: $<input type="text" id="donateAmt" onkeypress="return event.charCode >= 48 && event.charCode <= 57 || event.charCode == 46" /><button onclick="createDonateButton()">Donate</button><br /><div id="donateBtn"></div>';

  $alertPanes = '<center><div id="redPane"></div><div id="greenPane"></div></center><div id="mailPane"></div><div id="utilityPane"></div><div id="playerMenu"></div><div id="popStack"></div>';
  $alertPanes .= '<div id="centerPrev"><div id="previewPane"></div></div>';

  $playerTab = '<div class="pt_justifier">'
      .'<div class="player_tab sound_btn" id="soundBtn" onclick="toggleSound()"><img id="soundIcon" src="assets/site/soundOn.png"/></div>'
      .'<div class="player_tab" id="playerTab" onclick="showPlayerMenu();" title="Log Out">Log Out</div>'
    .'</div>';

  $simpleHeader = '<div id="header" class="header">'
    .'<div id="logoPane" class="site_logo"></div>'
    .'<div id="headBar" class="head_bar">'
    .  '</div>'
    .'</div>'

    .'<div id="navTabs" class="nav_tabs">'
    .'</div>'
  .'</div>';

  $adminMail = ($privileges == 9) ? '<div class="gridItem" title="Admin Mail" id="adminMailIcon" onclick="loadMailWindow(true);">0</div>' : '';

  $gameHeader = '<div id="header" class="header">'
    .'<div id="gameNotification" style="'.$mnDisplay.'">'.$maintenanceNotification.'</div>'
    .'<div id="logoPane" class="site_logo"></div>'
    .'<div id="headBar" class="head_bar">'
    .  '<div id="habName" style="position:relative; display:inline; float:left; left:350px; top:15px; font-size:2.5em;"></div>'
    .  '<div id="moneyDiv" class="money_div">'
    .    '<img src="assets/site/coin-silver.png" class="gridItem" title="Silver" /><span id="playerSilver" class="gridItem money_span" style="margin-right:10px;">0</span>'
    .    '<img src="assets/site/coin-gold.png" class="gridItem" title="Gold" /><span id="playerGold" class="gridItem money_span" style="margin-right:10px;">0</span>'
    .    '<img src="assets/site/shoppingbag.png" class="gridItem" title="View Shopping Bag" style="height:20px; cursor:pointer;" onclick="goToCart();" /><span id="cart" class="gridItem money_span cart_counter" style="margin-right:10px;">'.$cc.'</span>'
    .    '<div class="gridItem" title="Mail" id="mailIcon" onclick="loadMailWindow();" >0</div>'.$adminMail
    .  '</div>'
    .'</div>'

    .'<div id="navTabs" class="nav_tabs">'
    .  '<ul>'
    .    '<li><a href="home"><div class="nav_tab" id="home" title="Home"><img src="assets/site/home.png" /><span>Home</span></div></a></li>'
    .    '<li><a href="garden"><div class="nav_tab" id="grdn" title="Garden"><img src="assets/site/garden.png" /><span>Garden</span></div></a></li>'
    .    '<li><a href="community"><div class="nav_tab" id="comm" title="Community"><img src="assets/site/community.png" /><span>Community</span></div></a></li>'
    .    '<li><a href="friends"><div class="nav_tab" id="frnd" title="Friends"><img src="assets/site/friends.png" /><span>Friends</span></div></a></li>'
    .    '<li><a href="market"><div class="nav_tab" id="mrkt" title="Marketplace"><img src="assets/site/market.png" /><span>Market</span></div></a></li>'
    .    '<li><a href="store"><div class="nav_tab" id="stor" title="Bitty-Pals Store"><img src="assets/site/store.png" /><span>Store</span></div></a></li>'
    .    '<li><a href="recyclotron"><div class="nav_tab" id="recycle" title="Recyclotron"><img src="assets/site/recycle.png" /><span>Recycle</span></div></a></li>'
    .    '<li><a href="arcade"><div class="nav_tab" id="arcade" title="Bitty Arcade"><img src="assets/site/arcade.png" /><span>Arcade</span></div></a></li>'
    .    '<li><a href="bank"><div class="nav_tab" id="bank" title="Bank"><img src="assets/site/bank.png" /><span>Bank</span></div></a></li>'
    .    '<li><a href="news"><div class="nav_tab" id="news" title="News"><img src="assets/site/news.png" /><span>News</span></div></a></li>'
    .  '</ul>'
    .'</div>'
  .'</div>';

  $inventorySearch = '<div>'
    .    '<input type="text" id="searchField" placeholder="Search Items" />'
    .    '<img class="hoverBorder" src="assets/site/searchIcon.png" style="width:auto; cursor:pointer;" title="Search" onclick="searchInventory();" />'
    .    '<span class="hoverBorder" style="color:red; float:right; cursor:pointer;" onclick="clearSearch();" title="Clear Search">&#x2716;</span>'
    .  '</div>'
    .  '<div id="coinSort">'
    .    '<div class="gridItem" style="cursor:pointer;font-size:.8em;" onclick="setCoin(\'gold\');"><img src="assets/site/coin-gold.png" />Gold</div>'
    .    '<div class="gridItem" style="cursor:pointer;font-size:.8em;" onclick="setCoin(\'silver\');"><img src="assets/site/coin-silver.png" />Silver</div>'
    .    '<div class="gridItem" style="cursor:pointer;font-size:.8em;" onclick="setCoin(null);"><img src="assets/site/coin-both.png" />All</div>'
    .  '</div>'
    .  '<div>Categories:<ul id="categoryLinks"></ul></div>'
    .  '<div>'
    .    'Sort by:<select onchange="setSort(this)" class="gridItem">'
    .      '<option value="date_purchased" class="pdate">Purchase Date</option>'
    .      '<option value="name" class="pdate">Name</option>'
    .    '</select>'
    .    '<button class="gridItem" id="dirBut" title="Change Sort Direction" onclick="setDir()">&#x25B2;</button>'
    .  '</div>';

  $shoppingBag = '<hr />'
    .  '<center><div style="cursor:pointer; background-image:url(\'assets/site/shoppingbag.png\'); background-repeat:no-repeat; background-position:center; height:200px; width:100%;" onclick="goToCart();">Shopping Bag<div class="cart_counter" style="margin-top:55px; margin-right:20px; font-size:2em;">'.$cc.'</div></div></center>';

  $storage = '<hr />'
    .  '<center><div style="cursor:pointer; background-image:url(\'assets/site/storage.png\'); background-repeat:no-repeat; background-position:center; height:200px; width:100%;" onclick="openStorage();" title="Habitat Storage"><strong>Toy Box</strong></div></center>';

  $breadCrumb = '<div class="bc_nav"></div>';


  $aboutUs = "BittyPals is wholly owned by MythPlaced Treasures, LLC<br /><br />MythPlaced Treasures was launched in 2002 as an eBay seller specializing in RolePlaying Games and accessories, along with fantasy themed collectables.  Over the years, we have tried to keep pace with an ever-changing market, always with a focus on fun & community.  This has involved a little bit of everything, including running a brick-and-mortar Game & Hobby Shop, offering appraisal services for collectibles, selling antiques & collectibles consignment, writing RPG modules, helping small businesses with their branding & marketing, designing & illustrating book covers, creating artwork that has been sold online and in galleries, creating the college-themed exploits of a Tiny T-Rex named Teddy, and much, much more.<br />In other words, we do a lot of different things and enjoy most of them.<br /><br />Our current team consists of three humans and a slightly overweight Sheltie.";



    $footer = '<center><div id="footer" class="footer"><table><tr>'
      .   '<td id="copyright">BittyPals is &copy; 2017 MythPlaced Treasures, LLC.</td>'
      .   '<td id="sitemap">'
      .      '<a href="#" onclick="showAboutUs(\''.$aboutUs.'\')" title="About MythPlaced Treasures">About Us</a>'
      .      ' | <a href="community" title="Official BittyPals Community Forum">Community</a>'
      .      ' | <a href="faq" title="Frequently Asked Questions">FAQ</a>'
      .      ' | <a href="tac.php" title="Legal">Terms and Conditions</a>'
      .   '</td>'
      .'</tr></table></div></center>';

//<a rel="nofollow" target="_blank" href="https://www.vecteezy.com">Vector Graphics by vecteezy.com</a>



  $plushieLookupTable = [
    428=>353, //Bunny
    429=>354, //Cow
    430=>355, //Duck
    431=>356, //Fox
    432=>357, //Frog
    433=>358, //Monkey
    434=>359, //Penguin
    435=>360, //Puppy
    436=>361, //Tabby
    326=>362, //White Kitty
    24=>55, //Bear
    25=>56, //Doggie
    2=>57, //Dragon
    26=>58, //Owl
    27=>59, //Panda
    28=>60, //Pig
    29=>61, //Tiger
    2118=>2108, //Black Bunny
    2119=>2109 //Black Kitty
  ];
  function getPlushie($petID) {
    return $plushieLookupTable[$petID];
  }


?>
