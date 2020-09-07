<?php
require "overhead.php";
echo "Don't fuck this up...<br /><br />";

$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


if (isset($_GET['id'])) {
  $uID = $_GET['id'];
  $next = $uID + 1;
  echo "<a href=\"fixit.php?id=$next\" style=\"font-size:24px;\">Next Player >></a><br />";
  $ires = $conn->query("SELECT id, active_hab FROM player WHERE id = $uID") or die($conn->error);
  $count = 0;
  if ($ires->num_rows == 0) echo "No player found with that ID";
  while($i = $ires->fetch_object()) {
    $iFlag = false;

                            echo "Player:<br /><pre>";
                            print_r($i);
                            echo "</pre>";

    $pid = $i->id;
    $activeHab = $i->active_hab;
    $j = $conn->query("SELECT inventory.id, inventory.hid, inventory.item_id, item.type, item.src
      FROM inventory
      INNER JOIN item ON inventory.item_id = item.id
      WHERE inventory.hid = $activeHab
        AND inventory.active = 1
        AND inventory.pid = $pid
        AND item.type = 'habitat'")
        or die($conn->error);
    if ($j->num_rows > 0) {
      $iFlag = true;
      $jr = $j->fetch_object();
                            echo "<br />Pulling inventory/item join:";
                            print_r($jr);
                            echo "<br /><br />";
    } //else {
      echo "No matching inventory record found for habby on player $pid<br />";
      echo "Searching...<br />";
      //this...is going to suck...
      $habObs = $conn->query("SELECT inventory.id, inventory.hid, inventory.item_id, inventory.active, item.type FROM inventory INNER JOIN item ON inventory.item_id = item.id WHERE item.type = 'habitat' AND inventory.pid = $pid") or die($conn->error);
      if ($habObs->num_rows > 0) {
        echo "<br />";
        $habitats = [];
        $oddDucks = [];
        //get all of the habitats owned by the player
        $hq = $conn->query("SELECT id FROM habitat WHERE pid = $pid") or die($conn->error);
        while ($hh = $hq->fetch_object()) {
          $habitats[] = $hh->id;
        }
                            echo "Owned Habitat IDs:<pre>";
                            print_r($habitats);
                            echo "</pre>";
                            echo "<br />Owned Habitat Items<pre>";
        while ($hab = $habObs->fetch_object()) {
          //now to find the odd duck...
          if ($hab->hid == 0) {
            // echo "Item $hab->id >> hid: $hab->hid, active: $hab->active<br />";
            continue;
          }
          if ($hab->active == 0) {
            $conn->query("UPDATE inventory SET hid = 0 WHERE id = $hab->id") or die($conn->error);
            continue;
          }
                            // print_r($hab);
          $found = array_search($hab->hid, $habitats);
          if ($found === false) {
            //this is where we'll find the odd ones out, I hope.
            $oddDucks[] = $hab;
            // echo "<br />Odd Habs Out (inventory): ";
            // print_r($oddDucks);
            // echo "<br />";
          } else {
            echo "Item found in habitat $hab->hid<br />";
            array_splice($habitats, array_search($hab->hid, $habitats), 1);
            //fix the habby record
            //get the item src
            $itemRecord = $conn->query("SELECT src FROM item WHERE id = $hab->item_id") or die($conn->error." on line ".__LINE__);
            $iSrc = $itemRecord->fetch_object()->src;
            $conn->query("UPDATE habitat SET inv_id = $hab->id, item_id = $hab->item_id, src = '$iSrc' WHERE id = $hab->hid") or die($conn->error);
            // echo "New Habitats Array: ";
            // print_r($habitats);
            // echo "<br />";
          }
        }
        echo "<br /><br />Habitat IDs: ";
        print_r($habitats);
        echo "<br />Odd Ducks: ";
        print_r($oddDucks);
        echo "</pre>";

        if (count($habitats) == count($oddDucks)) {
          echo "Exact count match found<br />";
          if (count($habitats) == 1) {
            echo "Autofixing single match<br />";
            //get the item record
            $hab = $oddDucks[0];
            $itemRecord = $conn->query("SELECT src FROM item WHERE id = $hab->item_id") or die($conn->error." on line ".__LINE__);
            $iSrc = $itemRecord->fetch_object()->src;
            $conn->query("UPDATE inventory SET hid = $habitats[0] WHERE id = $hab->id") or die($conn->error." on line ".__LINE__);
            $conn->query("UPDATE habitat SET inv_id = $hab->id, item_id = $hab->item_id, src = '$iSrc' WHERE id = $habitats[0]") or die($conn->error." on line ".__LINE__);
          } else {
            //multiples found
            echo "Multiple records found";
          }
        } else {
          //mismatch in habby count and owned habby items
          echo "<div style=\"position:absolute;  top:0px;  left:200px; color:white; background-color:red; padding:5px;\">Mismatch in inventory/habitat count</div><br />";
          if (count($oddDucks) == 1) {
            if (array_search($activeHab, $habitats) === false) {
              //active hab already taken...now what?
            } else {
              echo "Single odd duck.  Applying to active habitat<br />";
              $hab = $oddDucks[0];
              $itemRecord = $conn->query("SELECT src FROM item WHERE id = $hab->item_id") or die($conn->error." on line ".__LINE__);
              $iSrc = $itemRecord->fetch_object()->src;
              $conn->query("UPDATE inventory SET hid = $activeHab WHERE id = $hab->id") or die($conn->error." on line ".__LINE__);
              $conn->query("UPDATE habitat SET inv_id = $hab->id, item_id = $hab->item_id, src = '$iSrc' WHERE id = $activeHab") or die($conn->error." on line ".__LINE__);
            }
          }
        }

      } else {
        echo "No habitat items found...WTF?";
      }





    // }






    //we have a viable inventory record to work with
    if ($iFlag) {
      //get the owned habby that match the item src
      echo "<br /><p style=\"color:blue; font-size:20px; \">Pulling existing habby record:</p>";
      $vr = $conn->query("SELECT * from habitat where id = $jr->hid") or die($conn->error);
      if ($vr->num_rows == 1) {
        $v = $vr->fetch_object();
        echo "<pre>";
        print_r($v);
        echo "</pre>";
        $conn->query("UPDATE habitat SET inv_id = $jr->id, item_id = $jr->item_id, src = '$jr->src' WHERE id = $i->active_hab") or die($conn->error);
      } else {
        echo "Found $vr->num_rows for habitat.id $jr->hid<br />";
      }
    }
    $count++;
  }

} else {
  echo "Put a damn id in, dipshit...";
}
// echo "$count records updated.  ...Please let this shit work.";

?>
<html>
<head><title>Fuckstix...</title>
  <body></body>
</html>
