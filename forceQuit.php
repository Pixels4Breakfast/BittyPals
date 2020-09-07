<?php
  session_start();
  unset($_SESSION['player_id']);
  session_destroy();
  header("Location:https://bittypals.com");
?>
