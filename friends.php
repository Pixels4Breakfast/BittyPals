
<?php
require_once "overhead.php";

if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
  // $fl = $_SESSION['friends'];
} else {
  header("Location:home");
}


$fconn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname); if ($fconn->connect_error) { die("OH NO!  Our database blowed up :(  " . $fconn->connect_error); }

$fPage = "myFriends";
$bcPage = 0;
$fSearch = '';
$fSort = "default";
$fLimit = 36;
$rowcount = 0;

if (isset($_GET['p'])) $fPage = $_GET['p'];
if (isset($_GET['page'])) $bcPage = $_GET['page'] - 1;
if (isset($_GET['search'])) $fSearch = $_GET['search'];
if (isset($_GET['sort'])) $fSort = $_GET['sort'];

$fOffset = $bcPage * $fLimit;


$limiter = "LIMIT $fOffset, $fLimit";
if ($fPage != 'myFriends') $limiter = "";  //need to pull this as a lookup table instead

$fsql = "SELECT SQL_CALC_FOUND_ROWS F.fid, F.played_with_friend, F.friend_played_with, F.type, P.username, P.email, P.id, P.avatar, P.use_gravatar, P.join_date
        FROM friends F
        INNER JOIN player P
        ON F.fid = P.id
        WHERE F.pid = $pid AND ";

if ($fSearch != '') {
    $fsql .= "P.username LIKE \"%$fSearch%\" ";//ORDER BY P.username ASC LIMIT $fOffset, $fLimit";
} else {
  $fsql .= ($fPage == 'myFriends') ? "F.type != 'none' AND F.type != 'neighbour' " : "F.type != 'friend' ";
}
switch($fSort) {
  case 'name':
  $fsql .= "ORDER BY P.username ASC $limiter";
  break;
  case 'joined':
  $fsql .= "ORDER BY P.join_date ASC $limiter";
  break;
  default: //also 'default'
  $fsql .= "ORDER BY (F.played_with_friend IS NOT NULL), F.played_with_friend ASC $limiter";
  break;
}


$fr = $fconn->query($fsql) or die($fconn->error);
$fList = [];
$rcr = $fconn->query("SELECT FOUND_ROWS() AS rowcount") or die($fconn->error);
$rowcount = $rcr->fetch_object()->rowcount;
while ($f = $fr->fetch_object()) {
  $f->md5 = md5($f->email);
  if ($f->played_with_friend == "") {
    $f->timeDif = -1;
    $f->played = 0;
  } else {
    $f->timeDif = timeDif($f->played_with_friend)->h;
    $f->played = ($f->timeDif < 12) ? 1 : 0;
  }
  $fList[] = $f;
}

$list = [];
if ($fPage == 'myFriends') {
  $list = $fList;
} else {

  $noflr = $fconn->query("SELECT fid FROM friends WHERE pid = $pid AND type = 'friend'") or die(__FILE__."::".__LINE__." => ".$fconn->error);
  $fla = [$pid];
  while($nfl = $noflr->fetch_object()) $fla[] = $nfl->fid;
  $friendString = implode($fla, ",");

  $ffsql = "SELECT SQL_CALC_FOUND_ROWS username, email, id, avatar, use_gravatar, join_date FROM player WHERE id != $pid ";
  if (!empty($fla)) $ffsql .= "AND id NOT IN ($friendString) ";
  if ($fSearch != '') $ffsql .= "AND username LIKE \"%$fSearch%\" ";

  switch($fSort) {
    case 'name':
      $ffsql .= "ORDER BY username ASC LIMIT $fOffset, $fLimit";
    break;
    case 'joined':
      $ffsql .= "ORDER BY join_date ASC LIMIT $fOffset, $fLimit";
    break;
    default: //also 'default'
      $ffsql .= "ORDER BY username ASC LIMIT $fOffset, $fLimit";
    break;
  }

  $ffr = $fconn->query($ffsql) or die(__FILE__."::".__LINE__." => ".$fconn->error);
  $rcr = $fconn->query("SELECT FOUND_ROWS() AS rowcount") or die(__FILE__."::".__LINE__." => ".$fconn->error);
  $rowcount = $rcr->fetch_object()->rowcount;
  while($ff = $ffr->fetch_object()) {
    $ff->md5 = md5($ff->email);
    $ff->played = 0;
    $ff->type = 'none';
    $ff->timeDif = -1;

    for ($j=0; $j<count($fList); $j++) {
      if ($fList[$j]->fid == $ff->id) {
        $ff->type = $fList[$j]->type;
        $ff->timeDif = $fList[$j]->timeDif;
        $ff->played = $fList[$j]->played; //($ff->timeDif < 12) ? 1 : 0;

        break;
      }
    }
    $list[] = $ff;
  }
}




$friendBlocks = "";
if ($rowcount == 0) {
  $friendBlocks =  ($fPage == 'myFriends') ? 'You don\'t have anyone on your friend list.  <a href="#" onclick="findFriends();">Find Some :)</a>' : "You already have all the friends!";
} else {
  for ($i=0; $i<count($list); $i++) {
    $friend = $list[$i];
    $imgSrc = ($friend->use_gravatar == 1) ? getAvatar($friend->md5) : $friend->avatar;
    $banner = ($friend->played == 1) ? '<div class="oWrapper"><div class="overlay">PLAYED</div></div>' : "";
    $button = ($friend->type == 'friend') ? '<button id="fb_'.$friend->id.'" title="Remove Friend" class="rfButton" onclick="removeOldFriend('.$friend->id.')">Remove</button>' : '<button id="fb_'.$friend->id.'" title="Add Friend" class="afButton" onclick="addNewFriend('.$friend->id.')">Add Friend</button>';
    $friendBlocks .= "<div id=\"f_$friend->id\" class=\"friendBlock gridItem\">
                        <a href=\"habitat/$friend->id\">
                          <img src=\"$imgSrc\" title=\"Visit their Pal!\" />
                          $banner
                        </a>
                        <div>$friend->username</div>
                        <div>$button</div>
                      </div>";
  }
}


?>

<!DOCTYPE html>

<html>
<head>
<title>BittyPals</title>
<?php echo $requiredHead; ?>
<link rel="stylesheet" href="css/friends.css" />
<script src="js/friends.js"></script>

<script>
  <?php echo $baseJSVars; ?>
  var fPage = '<?php echo $fPage; ?>';
  var myFriends = (fPage == 'myFriends') ? true : false;

  var pageNum = <?php echo $bcPage; ?>;
  var fLimit = 36;
  var fOffset = fLimit * pageNum;
  var fSort = '<?php echo $fSort; ?>';
  var fSearch = '<?php echo $fSearch; ?>'

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Friends");
    currentPage = 'friends';
    updatePlayerMoney(playerID);
    setFriendsBC(<?php echo $rowcount; ?>);
    $("#fSearchInput").on('keypress', function(e) { if(e.keyCode==13) listFriends(); });


    fetchNewPlayers();
  })


</script>


</head>
<body class="site">
<?php echo $alertPanes; ?>
  <main class="site_content"><center>
    <?php echo $playerTab; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo $gameHeader; ?>
      <div class="static_content dynamic">
        <div class="landing_lower">
          <div id="fButtons" class="" style="width:100%;">

            <div style="position:absolute; vertical-align:top; float:left;">
              <input id="fSearchInput" type="text" value="<?php echo $fSearch; ?>" placeholder="Search" style="position:relative;display:inline-block;vertical-align:top;height:20px;font-size:18px;" />
              <button onclick="listFriends()">Search</button>
              <button onclick="clearSearch()">Clear</button>
            </div>
            <div style="position:relative; vertical-align:top; float:right;">
              <strong>Sort:</strong> <select id="fSortInput" onchange="listFriends()">
                      <option value="default" <?php if ($fSort == 'default') echo 'selected="selected"'; ?>>Time Since I Played With Them</option>
                      <option value="name" <?php if ($fSort == 'name') echo 'selected="selected"'; ?>>Username</option>
                    </select>
            </div>

            <?php if ($fPage == "myFriends") : ?>
              <button onclick="window.location = 'friends?p=findFriends';" class="blue_button" style="border-radius:5px;">Find New Friends!</button>
            <?php endif; if ($fPage != 'myFriends') : ?>
              <button onclick="window.location = 'friends?p=myFriends';" class="blue_button" style="border-radius:5px;">My Friends</button>
            <?php endif; ?>
          </div>
          <div id="newPlayersRow"><center><span style="font-size:1.5em; font-weight:bold; color:#008080">Our Newest Players!</span></center></div>
          <div style="position:relative;text-align:left;"><button type="button" onclick="toggleNewPlayers()">Show/Hide New Players</button></div><br /><br />
          <div id="friendList"><?php echo $friendBlocks; ?></div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>


</body>
</html>
