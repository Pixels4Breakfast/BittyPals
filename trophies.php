
<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:home");
}

$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if($conn->connect_error) {
    die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

//set the id to pull the player/trophy from
$displayid = $pid;
if (isset($_GET['userid'])) { $displayid = $_GET['userid']; }

$pr = $conn->query("SELECT username FROM player WHERE id = $displayid") or die($conn->error);
$pun = $pr->fetch_object()->username;

$tr = $conn->query("SELECT * FROM trophies WHERE pid = $displayid") or die($conn->error);
$trophies = [];
$trophyLookup = [];
while($trophy = $tr->fetch_object()) {
  array_push($trophies, $trophy);
  array_push($trophyLookup, $trophy->tid);
}

$trophyData = [];
if (count($trophyLookup) > 0) {
  $tlr = $conn->query("SELECT DISTINCT id, name, src, description FROM trophy WHERE id IN (".implode($trophyLookup, ',').")") or die($conn->error);
  while($t = $tlr->fetch_object()) {
    array_push($trophyData, $t);
  }
}

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals</title>
<?php echo $requiredHead; ?>

<script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/constructors.js?v=<?php echo mktime(); ?>"></script>
<script>
  <?php echo $baseJSVars; ?>

  var trophies = <?php echo json_encode($trophies); ?>;
  var trophyData = <?php echo json_encode($trophyData); ?>;

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Trophies");
    currentPage = "trophies";
    updatePlayerMoney(playerID);
    $("#habName").html("<?php echo $pun; ?>'s Trophies");
    displayTrophies();
  });

  function getTrophyData(id) {
    for (var i = 0; i < trophyData.length; i++) {
      if (id == trophyData[i].id) return trophyData[i];
    }
    console.error("Could not find trophy data for id: " + id);
    return false;
  }

  function displayTrophies() {
    var con = $("#displayContainer");
    if (trophies.length == 0) {
      con.html("<br />No Trophies to Display Yet");
    } else {
      for (var i = 0; i < trophies.length; i++) {
        var t = getTrophyData(trophies[i].tid);
        var tcon = $("<div />", {
          class:'trophy',
          title:t.name,
          onclick:"showTrophy("+t.id+")"
        });
        var img = $("<img />", {src:t.src});
        tcon.append(img);
        con.append(tcon);
      }
    }
  }

  function showTrophy(id) {
    var t = getTrophyData(id);
    console.log(t);
    swal({
        title: t.name,
        text: demystify(t.description),
        imageUrl: t.src,
        html: true,
        animation: "slide-from-top",
        confirmButtonColor: "#acc6ef",
        confirmButtonText: "OK",
        closeOnConfirm: true
      });
  }
</script>

<style>
  #displayContainer {
    position:relative;
    display:inline-block;
    width:100%;
  }
  .trophy {
    position:relative;
    display:inline-block;
    display: -moz-inline-stack;
    *display: inline;
    text-align: center;
    height:150px;
    width:150px;
    /*border:1px solid black;*/
    margin:5px;
    padding:2px;
    /*border-radius:10px;*/
    /*box-shadow: 4px 4px 8px #777777;*/
    /*font-weight: bold;*/
    cursor:pointer;
    float:left;
  }
</style>

</head>
<body class="site">
<?php echo $alertPanes; ?>

  <main class="site_content"><center>
    <?php echo $playerTab; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo $gameHeader; ?>
      <div class="static_content dynamic">
        <div class="landing_lower">
          <button class="blue_button" onclick="window.location='habitat/<?php echo $displayid; ?>';">Back to <?php echo $pun; ?>'s Habitat</button>
          <br />Click on the trophies for more information!
          <div id="displayContainer"></div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
