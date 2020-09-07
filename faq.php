
<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:home");
}

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals FAQ</title>
<?php echo $requiredHead; ?>

<script>
  <?php echo $baseJSVars; ?>

  $('document').ready(function() {
    setPage("Home");
    currentPage = "faq";
    updatePlayerMoney(playerID);


  })
</script>

</head>
<body class="site">
<?php echo $alertPanes; ?>

  <main class="site_content"><center>
    <div class="pt_justifier">
      <div class="player_tab" onclick="showPlayerMenu();" title="Log Out">Log Out</div>
    </div>
    <div id="gameFrame" class="game_frame content">

      <?php echo $gameHeader; ?>
      <div class="static_content dynamic">
        <div class="landing_lower">
          <div style="border:1px solid black; margin-left:-14px;">
            <img src="assets/site/FAQOwl.png" style="display:inline-block; vertical-align:top; z-index:22;" />
          </div>

          <hr />
          <div style="100%; padding:5px; text-align:left;">
            <?php
              $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
              if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
              $r = $conn->query("SELECT * FROM faq") or die($conn->error);
              while($f = $r->fetch_object()) {
                echo '<span style="font-size:15px; font-weight:bold;">'.$f->question.'</span><br />';
                echo $f->answer.'<hr />';
              }
            ?>
            <img src="assets/site/Sucker.png" style="float:right" />
          </div>
        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
