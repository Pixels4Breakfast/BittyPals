
<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:home");
}

$userName = "Your";
$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
$por = $conn->query("SELECT level, xp, username, id FROM player WHERE id = $pid") or die($conn->error);
$po = $por->fetch_object();
$playerob = json_encode($po);

if (isset($_GET["userid"])) {
  //this is for visiting other players
  //pull stuff from database
  $loadpid = $_GET["userid"];
  $h = $conn->query("SELECT id, username FROM player WHERE id = $loadpid") or die($conn->error);


  if ($h->num_rows != 1) {
    echo "Invalid user ID";
    //TODO: build a damn 404 page for Bitty-Pals...
    return;
  }

  $u = $h->fetch_object();
  $userName = $u->username."'s";
  $baseJSVars .= "var userID = $u->id; var userName = \"$userName\";";




} else {
  $baseJSVars .= "var userID = $pid; var userName = 'Your';";
}

$conn->close();

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals</title>
<?php echo $requiredHead; ?>
<link rel="stylesheet" href="css/habitat.css?v=<?php echo mktime(); ?>" />
<link rel="stylesheet" href="css/garden.css?v=<?php echo mktime(); ?>" />

<!--[if IE]>
<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->

<!-- <script src="js/Item.js?v=<?php echo mktime(); ?>"></script>
<script src="js/editing.js?v=<?php echo mktime(); ?>"></script> -->
<!-- <script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script> -->
<!-- <script src="js/Effect.js?v=<?php echo mktime(); ?>"></script> -->
<script src="js/constructors.js?v=<?php echo mktime(); ?>"></script>
<script src="js/garden/garden.js?v=<?php echo mktime(); ?>"></script>
<script src="js/garden/Plot.js?v=<?php echo mktime(); ?>"></script>
<script src="js/jqtp.js?v=<?php echo mktime(); ?>"></script>
<script src="js/sounds.js?v=<?php echo mktime(); ?>"></script>


<script>
  <?php echo $baseJSVars; ?>
  var gib = undefined;
  var playerOb = <?php echo $playerob; ?>;

  $('document').ready(function() {
    if (userID != playerID) {
      $("#gardenSettingsDiv").hide();
      $("#gBackButton").attr("onclick", "window.location='habitat?userid=" + userID + "'");
    } else {
      $("#gBackButton").hide();
    }
    loadSounds();
    closePlantingPanel();
    setPage("Garden");
    currentPage = "garden";
    updatePlayerMoney(playerID);
    $("#habName").html(userName + " Garden");

    gib = $("#gardenInfoBox");


    fetchGarden();
  })
</script>

</head>
<body class="site">
<?php echo $alertPanes; ?>
<div id="pageMask"></div>
<div id="plantingPanel" class="centerHV"></div>
<div id="gardenInfoBox"></div>

  <main class="site_content"><center>
    <?php echo $playerTab; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo $gameHeader; ?>


          <div id="habitat" class="habitat">
            <div id="gBackButton" title="Back to Habitat"></div>
            <div id="gardenSettingsDiv">
              <img id="gSettingsImg" src="assets/site/garden_settings.png" onclick="toggleGardenSettings()" title="Show/Hide Settings">
              <br />
              <table>
                <tr>
                  <td><strong>Show Tips</strong></td>
                  <td>
                    <input type="checkbox" id="g_showTips_cb" value="1" checked="checked" onchange="setGardenTips()" />
                  </td>
                </tr>
                <tr>
                  <td><strong>Garden Privacy</strong></td>
                  <td>
                    <select id="g_privacySelect" onchange="setGardenPrivacy()" title="Who is allowed to tend your garden">
                      <option value="private" title="Only you can tend your garden">Private</option>
                      <option value="public" title="Everyone can tend your garden">Public</option>
                      <option value="friends" title="Only you and your friends can tend your garden">Friends</option>
                    </select>
                  </td>
                </tr>
              </table>
            </div>
            <div id="gardenBackground" style="position:absolute;"></div>
            <div style="position:absolute; width:100%; font-size:.9em; color:black; text-align:center;">
              Click on the plots to show information about them and interact with them
            </div>
            <div id="innerHab" style="position:absolute; top:0px; left:0px; width:100%;">

            </div>
          </div>
          <div id="helpDiv">
            <div id="helpSpan" onclick="toggleHelp()">Need help with the garden? Click here :)</div>
            <div style="font-size:1.1em">
              <center><h2><img src="assets/garden/sf/seed_coin_Silver.png" style="height:50px" />Welcome to the Bitty-Pals Garden Beta<span style="font-size:.5em;">v1.0</span>!<img src="assets/garden/sf/seed_dragon_ImperialBonsai.png" style="height:50px" /></h2></center>
              Ormyr's Bitty-Pals have only just begun to explore their new world, but they've already started finding new and exciting things, like exotic seeds from faraway lands, and they need your help to grow them!
              <br /><br />
              So, where do you start?  Well, let's learn a little about the things that go into the garden.
              <br /><br />

              <hr />
              <span style="font-size:1.3em; font-weight:bold; color:gray;">SEEDS</span><br />
              There are a whole bunch of different types of seeds out there, and the Bitty-Pals are finding more all the time, but every seed has some basic properties:
              <ul style="font-size:.9em">
                <li><strong>Name:</strong> This will give you a general idea of what kind of plant the seed might grow</li>
                <li><strong>Family:</strong> Some seeds belong to specific families, such as the "Coin" family.</li>
                <li><strong>Level:</strong> This indicates the level of the seed.  The two lowest levels are Silver and Gold, but there may be higher levels that are still unknown!</li>
                <li><strong>Mutate Chance:</strong> Some seeds have a chance to mutate and grow a higher level plant than they normally would.  If you are lucky enough to get a seed to mutate, it's a great way to find new families and rare plants!
                <li><strong>Rarity:</strong> Some seeds are harder to come by than others.  The rarity levels are <strong class="color_rarity_0">Common</strong>, <strong class="color_rarity_1">Uncommon</strong>, <strong class="color_rarity_2">Rare</strong>, <strong class="color_rarity_3">Epic</strong>, and <strong class="color_rarity_4">Legendary</strong>.
              </ul>
              <img src="assets/garden/help/seedpanel-1.jpg" style="float:right;display:inline-block" />
              To plant a seed in your garden, simply click on an empty plot and then hit the 'Plant Seed' button that pops up.<br />
              This will bring up your Planting Panel, which will show you all of the seeds that you have available, along with any fertilizers.
              <br /><br />
              We'll talk about those in a second.
              <br /><br />
              Simply choose a seed and drag it up to the seed slot to prepare it for planting.
              <br /><br />
              <img src="assets/garden/help/seedpanel-2.jpg" style="float:left; margin-right:4px;" />
              When you drop your seed into place, its information will be displayed to the left of the seed slot.<br />
              If you're ready, you can just hit the Plant button, and start growing!
              <br /><br />

              <hr />
              <span style="font-size:1.3em; font-weight:bold; color:gray;">FERTILIZERS</span><br />
              Using fertilizers can really enhance your gardening, from making your plants grow faster to giving you bonuses to the number of items you harvest, and more!
              <br />
              If you're still fairly new to the BittyVerse, you probably won't be able to use fertilizers yet, but don't worry, you'll get there!  Each of the three fertilizer slots open up at higher player levels (not Pal levels), starting with your first slot when you reach level 25.
              <br /><br />
              Just like seeds, fertilizers have different properties:
              <img src="assets/garden/help/seedpanel-3.jpg" style="float:right; margin-left:5px;" />
              <img src="assets/garden/help/seedpanel-4.jpg" style="float:right; margin-left:5px; margin-top:10px" />
              <ul style="font-size:.9em">
                <li><strong>Growth Time:</strong> This speeds up the growth of your plants.  Every plant has multiple stages to go through before its ready to be harvested.  Growth Time reduces the amount of time each stage takes.  This can make a big difference if your plant has several growth stages!</li>
                <li><strong>Harvest Count:</strong> This is a guaranteed number of items added to the standard number that you would normally harvest.</li>
                <li><strong>Harvest Rarity:</strong> Gives a better chance of getting rare items from the harvest.  There are even some plants that have items you <em>can't</em> get without using fertilizer to boost the rarity!</li>
                <li><strong>Mutate Chance:</strong> This improves the chances of the seed mutating into a higher level plant.  <strong>NOTE:</strong> If a plant has a 0% chance of mutating, this will not affect it.</li>
              </ul>
              All the bonuses from fertilizers stack if you use more than one that has the same bonus!


              <hr />
              <span style="font-size:1.3em; font-weight:bold; color:gray;">CHECKING ON YOUR PLOTS</span><br />
              <img src="assets/garden/help/tending-1.jpg" style="float:left; margin-right:5px;" />
              So you've planted a seed.  Now what?
              <br />
              After you've gotten your planting all squared away, a timer will appear above the plot.  This is the amount of time until your plant reaches its next stage of growth.  Some plants take longer to grow, both because they have longer grow times, and because larger plants (like trees) have more growth stages, but the payoff for all of your hard work and time will be better harvest results, so it's worth the effort!
              <br />
              The color of the timer bar indicates the rarity of the seed that was planted.
              <br /><br />
              You can click on any plot (even someone else's!) to see some information about what was planted there.  You will be able to see which seed and fertilizers (if any) were used as well as the cumulative bonuses from the planting.
              <br /><br />
              You will also be able to see which stage the plant is at out of how many total there are and how long it will take to grow each stage.
              <br /><br />
              If you are the owner of the garden, you will also have the option to Mulch your plant at any time.  Mulching a plant will give you a bag of mulch (fertilizer) to use on another planting, but you will lose the seed and any fertilizers that were used when you planted it.
              <br />
              Higher level plants will give better quality Mulches.
              <br />


              <hr />
              <span style="font-size:1.3em; font-weight:bold; color:gray;">WATERING</span><br />
              <img src="assets/garden/help/watering-1.jpg" style="float:left; margin-right:5px;" />
              <img src="assets/garden/help/watering-2.jpg" style="float:right;" />
              Of <em>course</em> you need to water your plants!  And the best part is that it's super-easy ;)  The water level will drop over time, but all you have to do is click on the water bar at the bottom of your plot and viola! Your plant is watered.  As a bonus, you'll get Experience points to help you level up so that you can get those fertilizer slots open!
              Be careful, though!  If you leave your garden unattended for too long, your plants will wither!  The time elapsed while a plant is withered does not count toward its growth.
              <br />
              You can resuscitate any of your plants to bring them back to life, but it will cost you a hefty amount of Gold Coins, so stay on it!
              <br /><br />
              <img src="assets/site/garden_settings.png" style="float:left; margin-right:5px; height:70px;" />
              But don't worry!  If you're not sure you'll be able to make it back to water your plants on a regular basis, you can always open your garden up to the public to allow other people to do your watering for you!<br />
              All you have to do is click on the Settings Icon and select 'Public' from the Privacy dropdown.  Whenever you water another player's garden, you'll be awarded 10<img src="assets/site/coin-silver.png" style="height:20px" title="Silver Coins" /> for your effort.  You can even set it so that only players on your Friends List can tend to your garden by selecting the 'Friends' option from the Privacy dropdown.

              <hr />
              <span style="font-size:1.3em; font-weight:bold; color:gray;">HARVESTING</span><br />
              <img src="assets/garden/help/harvest-1.jpg" style="float:left; margin-right:5px" />
              <div style="float:right;">
                <img src="assets/garden/help/harvest-3.jpg" />
                <br />
                <img src="assets/garden/help/harvest-2.jpg" />
              </div>
              Ah, finally!  The good stuff!<br />
              You've put in the time, the sweat, the seeds, and a healthy dose of smelly fertilizer, just for fun.  Now it's time for the payoff!
              <br /><br />
              Once your plant reaches maturity, you'll see the <strong>'Harvest Items'</strong> button above it, and in some cases a <strong>'Harvest Plant'</strong> button as well.
              <br /><br />
              If you choose to harvest the Items, you'll get up to three items (plus any bonus items from fertilizers).  In the case of the Coin family plants, you're likely to get Coin Stacks of various types that can be opened in your inventory to grant you Silver or Gold coins!
              <br />
              Other types of items you can get from harvesting include seeds, plushies, and items to decorate your habitat with that can't be gotten anywhere else!
              <br /><br />
              If you decide to harvest the Plant you won't get to use any harvest bonuses from fertilizers, but you'll get to keep the plant, itself, to decorate your habitat with or trade with friends.

              <br /><br /><br />
              <div style="font-size:1.4em;width:100%;text-align:center;">Happy Gardening!<br />
                <button type="button" onclick="toggleHelp()">Close</button>
              </div>


            </div>
          </div>

    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
