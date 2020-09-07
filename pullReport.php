<?php
require_once("overhead.php");
$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) {
  die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

$type = ($_GET['type'] == 'item') ? "Item" : "Player";
$verbose = false;

if (isset($_GET['verbose'])) {
  $verbose = ($_GET['verbose'] == 'true') ? true : false;
}

$filename = $type."Report.xls";
header('Content-type: application/ms-excel');
header('Content-Disposition: attachment; filename='.$filename);

if ($type == "Item") {
  $sql = ($verbose) ?
    "SELECT id, name, type, release_date, gold, silver, instore, sold, palette,
      (SELECT count(id)
      FROM inventory V
      WHERE V.item_id = I.id) AS activecount
    FROM item I ORDER BY I.id ASC"
    :
    "SELECT * FROM item";
  $res = $conn->query($sql) or die($conn->error);

  echo "<table><tr>".
  	"<th>ID</th>".
  	"<th>Name</th>".
  	"<th>Type</th>".
  	"<th>Date</th>".
  	"<th>Gold</th>".
  	"<th>Silver</th>".
  	"<th>In Store</th>".
  	"<th># Sold</th>";
    if ($verbose) echo "<th>In Game</th>";
    echo "<th>ColChng</th>".
  	"</tr>";
  while($item = $res->fetch_object()) {
    $cc = ($item->palette == '1') ? "yes" : "no";
    $is = ($item->instore == '1') ? "yes" : "no";
    echo "<tr>";
    echo "<td>$item->id</td>";
    echo "<td>$item->name</td>";
    echo "<td>$item->type</td>";
    echo "<td>$item->release_date</td>";
    echo "<td>$item->gold</td>";
    echo "<td>$item->silver</td>";
    echo "<td style=\"text-align:right;\">$is</td>";
    echo "<td>$item->sold</td>";
    if ($verbose) echo "<td>$item->activecount</td>";
    echo "<td style=\"text-align:right;\">$cc</td>";
    echo "</tr>";
  }
} else if ($type == "Player") {
  $sql = ($verbose) ?
    "SELECT id, username, email, join_date, last_login, gold, silver, last_payment, level, gold_spent_in_market, silver_spent_in_market, gold_spent_on_spinner,
      (SELECT count(id)
      FROM inventory I
      WHERE I.pid = P.id) AS itemcount
    FROM player P ORDER BY id ASC"
    :
    "SELECT * FROM player";
  $res = $conn->query($sql) or die($conn->error);

  echo "<table><tr>".
    "<th>ID</th>".
    "<th>Username</th>".
    "<th>Email</th>".
    "<th>Joined</th>".
    "<th>Last Login</th>".
    "<th>Gold</th>".
    "<th>Silver</th>".
    "<th>Last Purchase</th>".
    "<th>Level</th>";
    if ($verbose) echo "<th>#Items</th>";
    echo "<th>GoldSpent</th>".
    "<th>SlvrSpent</th>".
    "<th>SpinnerSpent</th>".
    "</tr>";
  while($player = $res->fetch_object()) {
    echo "<tr>";
    echo "<td>$player->id</td>";
    echo "<td>$player->username</td>";
    echo "<td>$player->email</td>";
    echo "<td>$player->join_date</td>";
    echo "<td>$player->last_login</td>";
    echo "<td>$player->gold</td>";
    echo "<td>$player->silver</td>";
    echo "<td>$player->last_payment</td>";
    echo "<td>$player->level</td>";
    if ($verbose) echo "<td>$player->itemcount</td>";
    echo "<td>$player->gold_spent_in_market</td>";
    echo "<td>$player->silver_spent_in_market</td>";
    echo "<td>$player->gold_spent_on_spinner</td>";
    echo "</tr>";
  }
}
echo "</table>";
$conn->close();
?>
