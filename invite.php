<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:home");
}

$pageAction = 'form';
if (isset($_GET['action'])) { $pageAction = $_GET['action']; }

if ($pageAction == 'token') {
  $token = md5(date("Y-m-d H:i:s"));
  $tokenLink = "https://bittypals.com/adoption?t=$token";

  //create the referral record so that it can actually be used...
  $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
  if ($conn->connect_error) {   die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }

  date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
  $timestamp = date("Y-m-d H:i:s");
  $sql = "INSERT INTO referral (pid, token, sent, email) VALUES ($_SESSION[player_id], '$token', '$timestamp', 'tokenized')";
  $conn->query($sql) or die($conn->error);
  $conn->close();

  $pageAction = 'sent';
  $confText = "Copy the link below and send it to your friend to invite them to come play Bitty-Pals!<br /><br />".$tokenLink;
}


if ($pageAction == 'send') {
  $email = $_POST['email'];
  $message = $_POST['message'];
  $displayName = $_POST['displayName'];

  //create token
  $token = md5(date("Y-m-d H:i:s"));
  $tokenLink = "https://bittypals.com/adoption?t=$token";

  $to = $email;
  $subject = "$displayName has invited you to play BittyPals!";

  $content = "
  <html>
  <head>
  <title></title>
  <style>
    body {background-color:#acc6ef;}
    hr {border:1px solid gray;}
    h1 {width:100%;text-align:center;}
    #container {background-color:#eeeeee;position:relative;text-align:left;width:800px;padding:5px;border-radius:15px;}
  </style>
  </head>
  <body>
  <center>
    <div id=\"container\">
      <h1>You've been invited to the Bitty 'Verse!</h1>
      Your friend, $displayName, has sent you this invitation to adopt a Bitty Pal, meet other Bitty Pals, and make friends with their Human Companions.
      <br />
      Bitty Pals live in a Bitty 'Verse that exists on the other side of your screen.  They are smart little creatures who thrive best when partnered with a Human Companion.  When you adopt a Bitty Pal, your friend will get a reward, and you will get a special gift.
      <br /><br />
      Come play with us today!
      <br />
      <br />

      <hr />
      <strong>Message from $displayName:</strong><br />
      $message
      <br />
      <br />

      Click the link below, or copy and paste it into your browser to join Bitty-Pals!
      <br />
      Link: <a href=\"$tokenLink\" target=\"_blank\">$tokenLink</a>

      <br />
      <br />
    </div>
    <span style=\"font-size:smaller;\">Bitty-Pals and BittyPals.com are &copy; 2017 MythPlaced Treasures, LLC</span>
  </center>
  </body>
  </html>
  ";

  // Always set content-type when sending HTML email, dork
  $headers = "MIME-Version: 1.0" . "\r\n";
  $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

  // More headers
  $headers .= 'From: <invite_noreply@bittypals.com>' . "\r\n";

  mail($to,$subject,$content,$headers);


  //create the referral record so that it can actually be used...
  $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
  if ($conn->connect_error) {   die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }

  date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
  $timestamp = date("Y-m-d H:i:s");
  $sql = "INSERT INTO referral (pid, token, sent, email) VALUES ($_SESSION[player_id], '$token', '$timestamp', '$email')";
  $conn->query($sql) or die($conn->error);
  $conn->close();


  $pageAction = 'sent';
  $confText = "Your invitation has been sent!";
}

?>

<!DOCTYPE html>
<html>
<head>
<title>BittyPals</title>
<?php echo $requiredHead; ?>


<script>
  <?php echo $baseJSVars; ?>

  $('document').ready(function() {
    setPage("Invite");
    currentPage = "invite";
    updatePlayerMoney(playerID);


  })

  function verifyEmailForm() {
    var form = $("#inviteForm");

    var allGood = false;
    var dn = $("#displayName").val();
    var em = $("#email").val();

    if (dn == "" || em == "") {
      //make an error thingy
      showAlert("You have not filled out all required fields", RED);
    } else {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\ w+)*(\.\w{2,3})+$/.test(em)) {
        allGood = true;
      } else {
        showAlert("Invalid email format", RED);
      }
    }

    if (allGood) {
      document.getElementById("inviteForm").submit();
    }
  }

  function showEmailForm() {
    var ef = $('<form/>', {action:"invite?action=send", method:"post", onsubmit:"verifyForm()"});
    var table = $("<table/>");
    table.append('<tr><td id="emailInput">Friend\'s Email:</td><td><input id="email" name="email" type="text" placeholder="my_friend@email.com" /></td></tr>');
    table.append('<tr><td>Your Name:</td><td><input id="displayName" name="displayName" type="text" placeholder="Your Name" title="This is the name that your friend will see in their email" /></td></tr>');
    ef.append(table);
    ef.append('<br /> <br /> Add a Message:<br /> <textarea id="message" name="message" style="height:100px; width:400px;" placeholder="Write them a short message :)"></textarea> <br /> <button type="button" onclick="verifyForm()">Send Invitation</button>');
    $("#formBlock").replaceWith(ef);
  }
  function showTokenForm() {
    window.location = "invite?action=token";
  }


</script>

  <style>
    #inviteBlock {
      width:600px;
      text-align: left;
    }
  </style>
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

          <?php if ($pageAction == 'form') :                                    /*FORM*/ ?>
            <br /><br />
            <div id="inviteBlock">

                <img src="https://bittypals.com/assets/item/FriendMakerToken.png" style="float:left;" />
                Invite your friends to adopt a Bitty Pal, and you'll receive a special Friend-Maker Token from Ormyr the Dragon!
                <br /><br />
                Along with the Token, as soon as your friend Adopts a Pal, they will automatically be added to your friend list, and you will be added to theirs.
                Not only that, but they will get a special gift of a Plushie version of your Pal!
                <br /><br />
                <div id="formBlock">
                  To send your friend an invitation by email <button type="button" onclick="showEmailForm()">Click Here</button>
                  <br />
                  If you want to send them a link instead, just <button type="button" onclick="showTokenForm()">Click Here</button>
                </div>

            </div>

          <?php endif;  if ($pageAction == 'sent') :                            /*SENT*/ ?>
            <?php echo $confText; ?>
            <br />
            <br />
            <a href="invite">Send Another Invitation</a> or <a href="habitat">Go Back Home</a>

          <?php endif; ?>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
