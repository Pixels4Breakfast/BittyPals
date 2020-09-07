
<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:collectibles");
}


?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals Collectibles</title>
<?php echo $requiredHead; ?>
<script src="js/pp.js?v=<?php echo mktime(); ?>"></script>
<script src="https://www.paypalobjects.com/api/checkout.js"></script>
<script src="js/collectibles.js"></script>

<script>
  <?php echo $baseJSVars; ?>

  $('document').ready(function() {
    if (playerID == 146) { pp_env = 'sandbox'; console.log("Switching to PP Sandbox"); } //TODO: This is only for testing...
    setPage("Collectibles");
    currentPage = "clct";
    updatePlayerMoney(playerID);

    setCollectibles();
  })

</script>


  <style>
    .stack_list {
      position:relative;
      width:100%;
      display:inline;
    }
    .stack {
      position:relative;
      display:inline-block;
      vertical-align: top;
      font-weight: bold;
      width:20%;
    }
    .stack img {
      height:150px;
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
          <h1 id="collectionTitle">Collectibles</h1>
          <span id="collectionDescription">There are no currently active collections</span>
          <br /><br />

          <div class="stack_list" id="stackList">
            <!-- this will be generated dynamically -->
          </div>

          <hr />

          <div class="stack_list">
            <div class="stack"><strong>Total: $</strong><span id="subt">0</span></div>
            <div class="stack"><button type="button" class="blue_button" id="ccButton" onclick="updatePPButton()">Checkout</button></div>
            <div class="stack"><div id="collectibleButton"></div></div>
          </div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
