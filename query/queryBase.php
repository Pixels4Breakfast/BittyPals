<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "../overhead.php";

$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) {
    die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

$touchDB = false;
$override = true;
$responseFlag = false;
$calcRows = false;
$sql = "";
$sql2 = "";
$md5 = "";
$levelCap = 500;

$data = [];  //return data to be json encoded

date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
$now = date("Y-m-d");
$now = "$now";
$timestamp = date("Y-m-d H:i:s");
$timestamp = "$timestamp";

mysqli_set_charset($conn, 'utf8');

$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";

if ($queryType == 'default') {
  die("No query type specified");
}

$o = json_decode($_POST["p"], false);

function scrubInventoryBank($pid = 0, $itemID = 0) {
  $conn = $GLOBALS['conn'];
  if ($pid > 0 && $itemID > 0) {
    //this will be the slowest one...and we probably shouldn't use it if we can help it.
    $r = $conn->query("DELETE FROM inventory_bank WHERE active = 0 AND in_storage = 0") or die($conn->error);
  } else if ($pid > 0 && $itemID == 0) {
    $r = $conn->query("DELETE FROM inventory_bank WHERE active = 0 AND in_storage = 0 AND pid = $pid") or die($conn->error);
  } else if ($itemID > 0 && $pid == 0) {
    $r = $conn->query("DELETE FROM inventory_bank WHERE active = 0 AND in_storage = 0 AND item_id = $itemID") or die($conn->error);
  } else {
    $r = $conn->query("DELETE FROM inventory_bank WHERE active = 0 AND in_storage = 0 AND item_id = $itemID AND pid = $pid") or die($conn->error);
  }

  if ($r !== TRUE) return $conn->error;
  return 'success';
}
?>
