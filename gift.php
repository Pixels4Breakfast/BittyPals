
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
<title>BittyPals Gift</title>
<?php echo $requiredHead; ?>

<?php
  includeJSDir('js/widgets/');
?>
<script src="js/gift.js?v=<?php echo mktime(); ?>"></script>
<script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Effect.js?v=<?php echo mktime(); ?>"></script>
<script src="js/inventory.js?v=<?php echo mktime(); ?>"></script>
<script>
  <?php echo $baseJSVars; ?>
  cID = playerID;
  var rid = <?php echo $_GET['r']; ?>;
  var rname = "<?php echo $rname; ?>";

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Home");
    currentPage = "gift";
    updatePlayerMoney(playerID);
    $("#habName").html("Give " + rname + " a gift package!");

    paramQuery(cParams, loadCats);  //getting the categories for nav
    searchInventory();  //load the inventory

  })
</script>

<style>
  #giftBlocks {
    position:relative;
    width:100%;
    display:inline-block;
  }
  #giftBlocks li {
    display:inline-block;
    border-spacing:0px;
  }

  #giftMessage {
    height:50px;
    width:90%;
    font-size:1.3em;
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

          <!-- Coin gifting temporarily disabled
          <input type="hidden" id="giftGold" value="" />
          <input type="hidden" id="giftSilver" value="" /> -->
          <li style="display:inline-block; font-weight:bold;">Give Coins: </li>
          <li style="display:inline-block;" title="Give Gold Coins">
            <input type="text" id="giftGold" class="gift_input" /><img src="assets/site/coin-gold.png"/>
          </li>
          <li style="width:20px; display:inline-block;"></li>
          <li style="display:inline-block;" title="Give Silver Coins">
            <input type="text" id="giftSilver" class="gift_input" /><img src="assets/site/coin-silver.png"/>
          </li>

          <li style="display:inline-block; float:right; width:75px; margin-right:30px; text-align:center;" class="spaced solo shiny" id="sgButton" onclick="sendGift();">
            Send Gift
          </li>
        </ul>
        Add a message:<br />
        <textarea id="giftMessage"></textarea>
        <!-- <hr /> -->
        <ul id="giftBlocks">
          <li>Click on items in your inventory to add them to the gift package</li>
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
