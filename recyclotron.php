
<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:home");
}

if (!isset($_GET['r'])) {
  //kick them out...or, y'know, just tell them.
} else {
  $gconn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
  if ($gconn->connect_error) { die("Connection failed: " . $gconn->connect_error); }

  $rnr = $gconn->query("SELECT username FROM player WHERE id = $_GET[r]") or die($gconn->error);
  $rname = $rnr->fetch_object()->username;

  $gconn->close();
}

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals Recyclotron</title>
<?php echo $requiredHead; ?>

<?php
  includeJSDir('js/widgets/');
?>
<script src="js/recycle.js?v=<?php echo mktime(); ?>"></script>
<script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Effect.js?v=<?php echo mktime(); ?>"></script>
<script src="js/inventory.js?v=<?php echo mktime(); ?>"></script>
<script>
  <?php echo $baseJSVars; ?>
  cID = playerID;

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Recycle");
    currentPage = "recycle";
    updatePlayerMoney(playerID);
    $("#habName").html("Recyclotron");

    paramQuery(cParams, loadCats);  //getting the categories for nav
    searchInventory();  //load the inventory

  })
</script>

<style>
  #binBlocks {
    position:relative;
    width:100%;
    display:inline-block;
  }
  #binBlocks li {
    display:inline-block;
    border-spacing:0px;
  }

  .smooth_btn_container .min {
    height:15px;
    margin-right:0px;
  }
  .smooth_btn_container .disabled {
    background: #cccccc;
    color:silver;
  }
  .gift_input {
    width:75px;
    height:30px;
    border-radius:5px;
    font-family:'Monkey';
    font-size:1.5em;
  }

  .item_block .oWrapper {
    position:absolute;
    height:100px;
    width:100px;
    top:5px;
    left:5px;
    overflow:hidden;
  }
  .item_block .overlay {
    position:absolute;
    height:25px;
    width:120px;
    top:18px;
    left:-30px;
    -webkit-transform: rotate(-45deg);
    background-color:rgba(255,255,255,0.5);
    text-align: center;
    font-weight:bold;
    color:#428e25;
  }
</style>

</head>
<body class="site">
<?php echo $alertPanes; ?>

  <main class="site_content"><center>
    <?php echo $playerTab; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo $gameHeader; ?>

      <div id="giftPane" class="lower_pane site_content static_content">
        <ul style="display:inline-block; padding-left:20px; position:relative; text-align:left; width:100%;" class="smooth_btn_container">
          <li style="display:inline-block; float:left;">
            Recycling items will return you half of their Marketplace value
          </li>
          <li style="display:inline-block; float:right; width:75px; height:25px; margin-right:30px; text-align:center;" class="spaced solo shiny" onclick="processBin();">
            Recycle
          </li>
          <li style="display:inline-block; text-align:center; float:right;">
            <strong>Total Recycle Value:</strong>
            <span id="rGoldDisplay">0</span><img src="assets/site/coin-gold.png" />
            <span id="rSilverDisplay">0</span><img src="assets/site/coin-silver.png" />
          </li>
        </ul>
        <!-- <hr /> -->
        <ul id="binBlocks">
          <li>Click on items in your inventory to add them to the Recyclotron</li>
        </ul>

      </div>



      <div id="lowerPane" class="lower_pane site_content static_content">
        <div id="inventoryContent">
          <div class="section_header">Your Inventory</div>
          <div id="lowerTitle"></div>
          <table style="width:100%; border-collapse:collapse;"><tr>
            <td id="inventoryNav" class="inventory_nav" rowspan="3">
              <?php echo $inventorySearch; ?>
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
  <?php echo $footer; ?>
</body>
</html>
