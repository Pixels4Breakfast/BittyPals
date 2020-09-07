<?php
  $displayName = "Foobarius";
  $tokenLink = "pretendThisIsATokenString";
  $message = "Sample message...";

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
    <span style=\"font-size:smaller;\">Bitty-Pals.com is &copy; 2017 MythPlaced Treasures, LLC</span>
  </center>
  </body>
  </html>
  ";
?>
<html>
<head>
  <title></title>
</head>
<body>
  <?php echo $content; ?>
</body>
</html>
