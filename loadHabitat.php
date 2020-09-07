<?php
$lconn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($lconn->connect_error) {
    die("Connection failed: " . $lconn->connect_error);
}
$underConstruction = 0;

$ucr = $lconn->query("SELECT under_construction, current_room FROM habitat WHERE id = $loadhid") or die(__LINE__.$lconn->error);
$hstuff = $ucr->fetch_object();
$underConstruction = $hstuff->under_construction;
$currentRoom =       $hstuff->current_room;


$habHasGarden = 0;


$fr = $lconn->query("SELECT * FROM friends WHERE pid = $_SESSION[player_id] AND type != 'none' AND type != 'neighbour' ORDER BY played_with_friend ASC") or die(__LINE__.$lconn->error);
$friends = [];
while ($f = $fr->fetch_object()) { $friends[] = $f; }
$_SESSION['friends'] = $friends;


$hJSON = ""; //JSON object to be injected onto base habitat page for database inventory
$hJSON_interior = "";

if (!$underConstruction != 0 || $editable == 1) {
  $habbyFound = false;
  $sql = "SELECT inventory.id, inventory.item_id, inventory.pid,
                inventory.active, inventory.hid, inventory.z,
                inventory.x, inventory.y, inventory.r, inventory.m,
                inventory.s, inventory.hr, item.name, item.src, item.type,
                item.is_sprite, item.frame_count, item.frame_height, item.frame_width,
                item.is_effect, item.effect_id, item.rooms, item.room_dir, item.start_room,
                item.palette, item.wid, item.id as 'base_id'
          FROM inventory
          INNER JOIN item ON inventory.item_id=item.id WHERE inventory.pid = $loadpid AND inventory.hid = $loadhid AND inventory.active = 1";

  $result = $lconn->query($sql) or die(__LINE__.$lconn->error);
  if ($result->num_rows > 0) {
    global $hJSON_interior;
      // output data of each row
      $c = "";
      while($row = $result->fetch_assoc()) {
        $spriteOb = false;
        if ($row['is_sprite'] == 1) {
          $spriteOb = (object) ['frameWidth'=>$row['frame_width'], 'frameHeight'=>$row['frame_height']];
        }
        //get the widget info if it exists
        if ($row['wid'] > 0) {
          $wr = $lconn->query("SELECT * FROM widget WHERE id = ".$row['wid']) or die(__LINE__.$lconn->error);
          $w = $wr->fetch_object();
          if (isset($w->data)) {  //just in case there isn't a proper widget record
            $w->data = preg_replace('!s:(\d+):"(.*?)";!e', "'s:'.strlen('$2').':\"$2\";'", $w->data);
            $w->data = unserialize($w->data);
            $row['widgetData'] = $w;
          }
        }
        if ($row["is_effect"] != 1) createItem($row["id"], $row['src'], $spriteOb);
        if ($row["palette"]) createPalette($row["id"], $row['src'], $row['type'], $spriteOb);
        if ($row["type"] == 'pet') {
          $p = $lconn->query("SELECT * FROM pet WHERE pid = $loadpid AND inv_id = $row[id]") or die(__LINE__.$lconn->error);
          $r = $p->fetch_object();
          $petid = $r->id;
          $petname = $r->name;
          $petob = json_encode($r);
        }
        if ($row["type"] == 'habitat') {
          //make sure that the habitat record is correct to avoid future issues
          $lconn->query("UPDATE habitat SET inv_id = $row[id], item_id = $row[item_id], src = '$row[src]' WHERE id = $loadhid") or die(__LINE__.$lconn->error);
          $habbyFound = true;
        }
        $hJSON_interior .= $c.json_encode($row);
        $c = ",";
      }
      //hopefully this will result in a self-repairing system for the mysterious disappearing habbies
      if (!$habbyFound) {

        //TODO: insert new inventory record for missing habitat inventory item.  item_id and inv_id should be in the habitat record


        echo '<span style="color:white; font-weight:bold;">No Habby Found.  Attempting to repair.<br />Please refresh this page.</span>';
        //gotta fix the damn thing...
        $fix = $lconn->query("SELECT * FROM habitat WHERE id = $loadhid") or die ('habitat query failed on line:'.__LINE__.$lconn->error);
        if ($fix->num_rows > 0) {
          $hOb = $fix->fetch_object();
          $f_inv = $hOb->inv_id;

          //pleasedon'tbreak pleasedon'tbreak pleasedon'tbreak...
          $hit = $lconn->query("SELECT * FROM inventory WHERE id = $f_inv") or die('inventory query failed on line:'.__LINE__.$lconn->error);

          if ($hit->num_rows == 1) {
            $hitr = $hit->fetch_object();
            $iid = $hitr->item_id;
            $lconn->query("UPDATE inventory SET hid = $loadhid, active = 1 WHERE id = $f_inv") or die('update query failed on line:'.__LINE__.$lconn->error);


            $fixed = $lconn->query("SELECT * FROM inventory WHERE id = $f_inv") or die(__LINE__.$lconn->error);
            $hi = $fixed->fetch_assoc();
            $hJSON_interior = json_encode($hi).','.$hJSON_interior;
          } else {
            //inventory item does not exist.  Replace.
            $lconn->query("INSERT INTO inventory (id, pid, item_id, hid, active) VALUES ($hOb->inv_id, $hOb->pid, $hOb->item_id, $hOb->id, 1)") or die($lconn->error);
            $fixed = $lconn->query("SELECT * FROM inventory WHERE id = $hOb->inv_id") or die($lconn->error);
            $hi = $fixed->fetch_assoc();
            $hJSON_interior = json_encode($hi).','.$hJSON_interior;
            echo '<script>document.location.reload();</script>';  //is this cross-browser?
          }
        } else {
          //fuckstix...
        }

      }

      //find out if they have plants in their garden so that we can give some sort of visual notification
      $gv = $lconn->query("SELECT id FROM garden_plot WHERE plant_id != 0 AND pid = $loadpid") or die(__LINE__.$lconn->error);
      if ($gv->num_rows > 0) $habHasGarden = 1;

  } else {
    echo "There has been an error with retrieving the database records.<br />Please make sure that you are visiting a valid player.<br />$loadpid -- $loadhid";  //TODO:build a damn 404 page
      //echo "0 results";  //something is wrong...
      session_destroy();
  }

} else {
  //just get the pet info
  $p = $lconn->query("SELECT pet.*, inventory.hid FROM pet INNER JOIN inventory ON pet.inv_id = inventory.id WHERE pet.pid = $loadpid AND inventory.hid = $loadhid") or die(__LINE__.$lconn->error);
  $r = $p->fetch_object();
  $petid = $r->id;
  $petname = $r->name;
  $petob = json_encode($r);
}

$mi = $lconn->query("SELECT * FROM siteoptions") or die(__LINE__.$lconn->error);
$mie = $mi->fetch_assoc();
$siteOptions = json_encode($mie);


$hJSON = "var dbi = [$hJSON_interior];";

                                                                                //Collection stuff
if (!isset($_SESSION['active_collection'])) $_SESSION['active_collection'] = $mie['active_collection'];


//for visiting other's habitats
$canPlayOther = 1;
$firstFriend = 0;
$giftCount = 0;
$playerob = new stdClass();
if ($editable == 0) {
  // $playerob = json_encode($playerob);  //initialize it so JavaScript doesn't break...

  $por = $lconn->query("SELECT level, xp, username, id FROM player WHERE id = $loadpid") or die(__LINE__.$lconn->error);
  $po = $por->fetch_object();
  $playerob = json_encode($po);


  $pwfr = $lconn->query("SELECT * FROM friends WHERE pid = $_SESSION[player_id] AND fid = $loadpid ORDER BY played_with_friend ASC LIMIT 1") or die(__LINE__.$lconn->error);
  $pwf = $pwfr->fetch_object();
  if (isset($pwf->played_with_friend)) {
    if ($pwf->played_with_friend != '') {
      if (timeDif($pwf->played_with_friend)->h < 12) {
        $canPlayOther = 0;
      }
    }
  }
} else {
  $por = $lconn->query("SELECT level, xp, username, id FROM player WHERE id = $_SESSION[player_id]") or die(__LINE__.$lconn->error);
  $po = $por->fetch_object();
  $playerob = json_encode($po);

  $ffr = $lconn->query("SELECT fid FROM friends WHERE pid = $_SESSION[player_id] AND type != 'none' AND type != 'neighbour' ORDER BY played_with_friend ASC LIMIT 1") or die(__LINE__.$lconn->error);
  $ff = $ffr->fetch_object();
  if (isset($ff->fid)) {
    $firstFriend = $ff->fid;
    if ($firstFriend == '') $firstFriend = 0;
  } else {
    $firstFriend = 0;
  }

  $gnr = $lconn->query("SELECT count(*) AS count FROM gift WHERE rid = $_SESSION[player_id] AND gotten = 0") or die(__LINE__.$lconn->error);
  $giftCount = $gnr->fetch_object()->count;
}


////////////////////////////////////////////////////////////////////////////////TROPHIES
$displayid = $loadpid;
$tr = $lconn->query("SELECT * FROM trophies WHERE pid = $displayid ORDER BY `date` DESC LIMIT 4") or die(__LINE__.$lconn->error);
$trophies = [];
$trophyLookup = [];
while($trophy = $tr->fetch_object()) {
  array_push($trophies, $trophy);
  array_push($trophyLookup, $trophy->tid);
}

$trophyData = [];
if (count($trophyLookup) > 0) {
  $tlr = $lconn->query("SELECT DISTINCT id, name, src, description FROM trophy WHERE id IN (".implode($trophyLookup, ',').")") or die(__LINE__.$lconn->error);
  while($t = $tlr->fetch_object()) {
    array_push($trophyData, $t);
  }
}
$lconn->close();
?>
