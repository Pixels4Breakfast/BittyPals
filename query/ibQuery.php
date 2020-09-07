<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "../overhead.php";

$conn = new mysqli($ibServername, $ibUsername, $ibPassword, $ibDBName);
if ($conn->connect_error) {
    die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

$touchDB = true;
$override = false;
$responseFlag = false;
$calcRows = false;
$sql = "";
$sql2 = "";
$levelCap = 500;

$data = [];  //return data to be json encoded

date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
$now = date("Y-m-d");
$now = "$now";
$timestamp = date("Y-m-d H:i:s");
$timestamp = "$timestamp";


// @param: cl -> current level
// @param: cxp -> current xp
// @return: levelup flag (boolean)
function checkLevel($cl, $cxp) {
  global $levelCap;
  $lvl = intval($cl);
  $xp = intval($cxp);
  //base + (1000 * cLevel)
  $base = 0;
  $levelFlag = 0;
  for ($i=0; $i < $levelCap; $i++) {
    $next = $base + (1000 * $i);
    if ($xp >= $next) {
      $base = $next;
    } else {
      if ($i > $lvl) $levelFlag = 1;

      $r = ['i'=>$i, 'cl'=>$lvl, 'cxp'=>$xp, 'next'=>$next, 'base'=>$base, 'levelup'=>$levelFlag];
      return $r;
    }
  }
}

mysqli_set_charset($conn, 'utf8');

$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";
switch ($queryType) {

  default:

  break;
}


?>
