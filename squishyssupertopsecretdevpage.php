
<?php
require_once "overhead.php";


?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals</title>
<?php echo $requiredHead; ?>

<script>
  // <?php echo $baseJSVars; ?>
  var currentRemaining = 0;
  var currentTotal = 0;
  var errorCount = 0;
  function updateProgress(remainder) {
    currentRemaining = remainder;
    if (remainder == 0) {
      $("#progress").html("Progress: 100%");
      currentRemaining = currentTotal = 0;
    } else {
      currentRemaining = remainder;
      let per = Math.round((currentTotal - currentRemaining)/currentTotal*10000);
      per = per/100;
      console.log(`${currentRemaining}/${currentTotal} Remaining ${per}% complete.  Errors: ${errorCount}`)
      $("#progress").html(`Progress: ${per}%`);
    }
  }

  function issues() {
    if ($("#spooch").val() == "Some Jerk") { //yeah...SUPER secure...
      $("#daddy").hide();
      $("#junk").show();
    } else {
      alert("Bullshit");
    }
  }
  function dothething(isBegin) {
    if(isBegin) if (!confirm("Ready to bend over, put your head between your legs, and kiss the database goodbye?")) return;
    if (isBegin) console.log("Starting storage inventory split:\n");
    paramQuery({}, isitdone, 'split_inventory', 'flintQuery');
  }
  function dotheotherthing(isBegin, off) {
    if (isBegin) if (!confirm("You glorious bastard...")) return;
    if (isBegin) console.log("Starging active inventory split:\n");
    paramQuery({offset:off}, isthatdone, 'split_active', 'flintQuery');
  }
  function isitdone(r) {
    // console.log(r.remaining + " remaining");
    if (currentTotal == 0) currentTotal = r.total;
    if (r.remaining == undefined) {
      errorCount++;
      dothething(false);
    } else if (Number(r.remaining) > 0) {
      updateProgress(r.remaining);
      dothething(false);
    } else {
      updateProgress(0);
      console.log("End storage inventory split\n");
    }
  }
  function isthatdone(r) {
    // console.log(r.remaining + " remaining");
    if (r.remaining == undefined) {
      errorCount++;
      dotheotherthing(false);
    } else if (currentTotal == 0) currentTotal = r.total;
    if (Number(r.remaining) > 0) {
      updateProgress(r.remaining);
      dotheotherthing(false, r.offset);
    } else {
      updateProgress(0);
      console.log("End active inventory split\n");
    }
  }
  $('document').ready(function() {
    $("#junk").hide();
    $("#spooch").on('keypress', function(e) { if (e.keyCode == 13) { issues(); }});
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
          <div id="daddy">
            Who's your daddy?
            <input type="text" id="spooch" placeholder="Not da momma!" />
          </div>
          <div id="junk">
            <button type="button" onclick="dothething(true)">Do The Thing</button><br />
            <button type="button" onclick="dotheotherthing(true,0)">Do The Other Thing</button><br />
            <span id="progress"></span>
          </div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
