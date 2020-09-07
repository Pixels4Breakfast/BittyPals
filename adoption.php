
<?php
  require_once "overhead.php";

  // if (isset($_SESSION['player_id'])) header("Location:habitat");

  $page = ""; $username = "Casper"; $playerID = 0;
  if (isset($_GET['page'])) $page = $_GET["page"];
  if (isset($_SESSION['player_username'])) $username = $_SESSION['player_username'];
  if (isset($_SESSION['player_id'])) $playerID = $_SESSION['player_id'];

  $fromInvite = 0;
  $token = '';
  $invitationText = "Default invitation text.  If you're seeing this, Squishy forgot to do something...";

  if (isset($_GET['t'])) {
    $fromInvite = 1;
    $token = $_GET['t'];
    //verify that the token is valid
    $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
    if ($conn->connect_error) {   die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }

    date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
    $timestamp = date("Y-m-d H:i:s");

    $r = $conn->query("SELECT * FROM referral WHERE token = '$token'") or die($conn->error());
    $ref = $r->fetch_object();
    // print_r($ref);  //TODO: kill this

    if (isset($ref->id)) {
      if ($ref->visited == '') {
        $conn->query("UPDATE referral SET visited = '$timestamp' WHERE id = $ref->id") or die($conn->error);
      }
      if ($ref->active == 0) {
        if ($ref->join_date != '' || $ref->joined == 1) {
          $invitationText = "<h2>Invitation Not Valid</h2>This invitation has already been accepted, and cannot be used again.<br />Please adopt a Pal directly from the <a href=\"home\">Homepage</a>";
        } else {
          $invitationText = "<h2>Invitation Expired</h2>This invitation has expired.<br />Please adopt a Pal directly from the <a href=\"home\">Homepage</a>";
        }
      } else {  //active valid token
        $invitationText = "<h2>Welcome to Bitty-Pals!</h2>Need more copy here...I had something that was sorta okay, but I decided to delete it in favour of letting you write the copy for all of this section.  Basically, it was just an intro that suggested that Ormir needed help in getting the Bitties safely to a new land.  I'm sure that you can come up with something better than what I had going :)<br /><br />";
        $invitationText .= '<div class="blue_button" style="cursor:pointer; border-radius:5px; width:250px; font-size:1.4em; padding:4px; margin-top:5px;" onclick="acceptInvite();">Adopt a Pal!</div>';
      }
    } else {
      $invitationText = "<h2>Whoops!</h2>There was no invitation found with that reference token.<br />Please adopt a Pal directly from the <a href=\"home\">Homepage</a>";
    }

    $conn->close();
  }



?>
<!DOCTYPE html>

<html>
<head>
<title>Adoption</title>
<?php echo $requiredHead; ?>
<script src="js/register.js?v=<?php echo mktime(); ?>"></script>

<script>
  var playerID = <?php echo $playerID; ?>;
  var fromInvite = <?php echo $fromInvite; ?>;
  var tok = <?php echo "'$token'"; ?>;
  $('document').ready(function() {
    if (fromInvite == 1) {
      $("#petPane").fadeOut(0);
      $("#adoption").fadeOut(0);
    } else {
      $("#invitationPane").fadeOut(0);
      $("#adoption").fadeOut(0);
    }
  });
</script>
<style>
  .pet_block {
    cursor:pointer;
    margin:8px;
  }
  #certPane {
    position:relative;
    text-align: left;
    font-size:.9em;
    height:300px;
    background-color: white;
    border-radius: 10px;
    width:750px;
    border:10px double gold;
  }
  #certPane input {
    font-family: "Comic Sans MS", cursive;
    color:#505050;
    font-size:1em;
    width:150px;
    background-color: #f5f5f5;
    color:#555555;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
    border-bottom:2px solid black;
    border-right:none;
    border-left:none;
    border-top:none;
    text-align: center;
  }
  #petPic {
    position:relative;
    float:left;
    border:2px solid #333333;
    border-radius: 5px;
    margin:5px;
    padding:5px;
  }
</style>

</head>
<body class="site">
<?php echo $alertPanes; ?>

  <main class="site_content"><center>
    <div id="gameFrame" class="game_frame content">

      <div id="header" class="header">
        <div id="logoPane" class="site_logo"></div>
        <!-- <div id="headBar" class="head_bar"></div> -->
      </div>
      <!-- <div style="z-index:100; position:relative;"><img src="assets/site/logo.png" /></div> -->
      <div class="static_content" style="margin-top:-80px; z-index:2; overflow:visible; height:850px;">
        <div class="landing_lower">
            <br /><br />

            <div id="invitationPane">
              <div class="construction" style="width:100%"><span>Pardon our Beta Testing dust!</span></div>
              <br /><br />
              <?php echo $invitationText; ?>
            </div>

            <div id="petPane" style="height:auto;">
                <div class="construction" style="width:100%"><span>Pardon our Beta Testing dust!</span></div>
                <br /><br />
                Once upon a time, there were thousands of Bitties, happily basking in the care of their human companions. But then, the <span style="color:red;">Bittypocalypse</span> occured, and their world was threatened with eternal darkness. For a time, they hid, scared and alone, until they began to try and rebuild their world on their own. These little Bitties became wiser and stronger, but they still missed their humans very much. The Humans missed their Bitty pals as well and spent a lot of effort trying to find a way to save their world.
                <br />
                And they did. But the Bitties lost almost everything they owned and now they have to start over. Luckily, they have their Human friends to help them along the way.
                Please adopt a little BittyPal to love, and help them grow and learn. Together, you can explore the BittyVerse and meet other BittyPals and their Human companions.
                <hr />
                Pick your Pal!<br />
              <?php
                $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
                if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
                $r = $conn->query("SELECT id, src, name, description FROM item WHERE type = 'pet'") or die($conn->error);
                while ($item = $r->fetch_assoc()) {
                  echo '<div class="pet_block gridItem" title="'.$item["description"].'" onclick="pickPet(\''.$item["id"].'\', \''.$item["src"].'\');"><img src="'.$item["src"].'" style="height:146px;" /></div>';
                }
              ?>
            </div>
            <div id="adoption">
              Just fill out this certificate, and you can start playing with your new BittyPal!
              <br />(yes, I intend to make this cuter)
              <div id="certPane">
                <p align="center">BITTYPAL ADOPTION CERTIFICATE</p>
                <img id="petPic" />
                &nbsp; &nbsp; I, <input type="text" id="r_username" placeholder="Username" />, do hereby officially take into my care, <input type="text" id="r_petname" placeholder="Pet's Name" />, to love and to play with.
                <br />&nbsp; &nbsp; I promise to nurture my new BittyPal, and guide them in the exploration and rebuilding of their world.
                <br />&nbsp; &nbsp; Should my BittyPal ever get lost, they can contact me at <input type="text" id="r_email" placeholder="Email Address" /> and use the secret code: <input type="password" id="r_password" placeholder="Password" />.
                <br />&nbsp; &nbsp; I have read the <a href="tac.php" target="_blank">Terms and Conditions</a> of this adoption, and by clicking the button below, I agree to them.
                <br /><button onclick="register();" style="float:right; margin:20px;">Let's Play!</button>
              </div>
              <button onclick="cancel();">Choose a Different Pet</button>
            </div>
        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
