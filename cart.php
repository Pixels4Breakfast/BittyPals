
<?php
require_once "overhead.php";

  if (!isset($_SESSION['player_id'])) header("Location: home");

  $cItems = [];
  if (!isset($_SESSION["cart"])) {
    $_SESSION['cart'] = [];  //because people click on silly things...
  } else {
    if (count($_SESSION['cart']) > 0) {
      $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
      if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
      $sItems = join(',',$_SESSION['cart']);

      $r = $conn->query("SELECT id, src, gold, silver, name, is_sprite, frame_count, frame_height, frame_width, wid, palette FROM item WHERE id IN ($sItems)") or die($conn->error);
      while($row = $r->fetch_assoc()) {
        if (isset($row["wid"])) {
          if ($row["wid"] > 0) {
            $wr = $conn->query("SELECT * FROM widget WHERE id = ".$row["wid"]) or die($conn->error);
            $w = $wr->fetch_object();
            if (isset($w->data)) {
              $w->data = preg_replace('!s:(\d+):"(.*?)";!e', "'s:'.strlen('$2').':\"$2\";'", $w->data);
              $w->data = unserialize($w->data);
              $row['widgetData'] = $w;
            }
          }
        }
        $cItems[] = $row;
      }
    }
  }

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals</title>
<?php echo $requiredHead; ?>
<!-- <script src="js/market.js"></script> -->
<?php
  includeJSDir('js/widgets/');
?>

<script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/inventory.js?v=<?php echo mktime(); ?>"></script>

<script>
  <?php echo $baseJSVars; ?>

  var cartItems = <?php echo json_encode($cItems); ?>;
  var cartOb = <?php echo json_encode($_SESSION['cart']); ?>;
  var totalItems = cartOb.length;
  var totalGold = 0;
  var totalSilver = 0;

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Market");
    currentPage = 'cart';
    updatePlayerMoney(playerID);

    console.error("CartItems", cartItems);

    var cd = $("#itemBlocks");
    if (cartItems.length > 0) {
      cd.empty();
      cd.append($("<div/>").html('<span id="cartItemCount">' + totalItems + "</span> Items in Shopping Bag"));
      for (var i=0; i<cartItems.length; i++) {
        var count = 0;
          for (var j = 0; j < cartOb.length; j++) {
            if (cartOb[j] == cartItems[i].id) count++;
          }
          cartItems[i].count = count;
          var ib = new ItemBlock(cartItems[i]);
        cd.append(ib.display);
        //add cost
        totalSilver = totalSilver*1 + cartItems[i].silver*count;
        totalGold = totalGold*1 + cartItems[i].gold*count;
      }

    } else {
      cd.append("You have no items in your Shopping Bag");
    }
    $("#totalSilver").html(totalSilver);
    $("#totalGold").html(totalGold);
  });
  function itemLookup(id) {
    for (var i = 0; i < cartItems.length; i++) {
      if (cartItems[i].id == id) return cartItems[i];
    }
  }

  function increment(id) {
    paramQuery({id:id}, function(r){}, ADDTOCART);
    totalItems++;
    $("#cartItemCount").html(totalItems);
    var ic = $("#item_" + id + "_count");
    var cc = Number(ic.html()) + 1;
    ic.html(cc);
    $(".cart_counter").html(totalItems);
    var item = itemLookup(id);
    if (item.gold > 0) {
      changeTotal('Gold', 'add', item.gold);
    } else if (item.silver > 0) {
      changeTotal('Silver', 'add', item.silver);
    }
  }
  function decrement(id) {
    var ic = $("#item_" + id + "_count");
    if (ic.html() == "0") return;
    paramQuery({id:id}, function(r){}, REMOVEFROMCART);
    totalItems--;
    $(".cart_counter").html(totalItems);
    $("#cartItemCount").html(totalItems);
    var cc = Number(ic.html()) - 1;
    ic.html(cc);
    var item = itemLookup(id);
    if (item.gold > 0) {
      changeTotal('Gold', 'sub', item.gold);
    } else if (item.silver > 0) {
      changeTotal('Silver', 'sub', item.silver);
    }
  }

  function changeTotal(type, func, amount) {
    var t = (type == "Silver") ? totalSilver : totalGold;
    var nt = (func == 'add') ? Number(t) + Number(amount) : Number(t) - Number(amount);
    if (type == "Silver") { totalSilver = nt; } else { totalGold = nt; }
    $("#total" + type).html(nt);
  }

  function checkout() {
    //make sure they have enough money
    var pMoney = getPlayerMoney();
    if (pMoney.silver >= totalSilver && pMoney.gold >= totalGold) {
        paramQuery({pid:playerID, gold:totalGold, silver:totalSilver}, validateCheckout, PROCESSCART);
    } else {
      swal("Whoops!", "You do not have enough money to complete this purchase.");
    }
  }

  function validateCheckout(response) {
    console.log(response);

    // return;
    if (response == "success") {
      // window.location = "habitat";
      swal({
          title: "Purchase Successful!",
          text: "The items have been added to your inventory<br />Where would you like to return to?",
          html: true,
          type: "success",
          showCancelButton: true,
          confirmButtonColor: "#88a372",
          cancelButtonColor: "#88a372",
          confirmButtonText: "Habitat",
          cancelButtonText: "Marketplace",
          closeOnConfirm: false,
          closeOnCancel: false
        },
        function(isConfirm) {
          if (isConfirm) {
            window.location = "habitat";
          } else {
            window.location = "market";
          }
        });
    }
  }

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
          <div style="background-color:#acc6ef; border-radius:5px; padding:5px 10px 5px 10px; color:white; cursor:pointer;" onclick="window.location = 'market'">&lt;&lt; Back to Marketplace</div>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td id="inventoryList" class="inventory_list">
              <ul id="itemBlocks"></ul>
            </td></tr>
          </table>


          <div id="totalCost" style="position:relative; text-align:right; border-top:1px solid #acc6ef;">
            <div class="gridItem" style="background-color:#88a372; border-radius:5px; padding:5px 10px 5px 10px; margin-right:50px; color:white; cursor:pointer; width:100px; text-align:center;" onclick="checkout();">Checkout</div>
            Total:
            <img src="assets/site/coin-gold.png" class="gridItem"><span id="totalGold">0</span class="gridItem" style="margin-right:20px;">
            <img src="assets/site/coin-silver.png" class="gridItem"><span id="totalSilver">0</span class="gridItem" style="margin-right:20px;">
          </div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
