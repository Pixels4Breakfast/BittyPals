<?php

//TODO: Refactor this whole damn thing and break it into categorical query files...
// require_once "queryBase.php";
header("Content-Type: application/json; charset=UTF-8");
require_once "../overhead.php";

$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) {
    die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

$touchDB = true;
$override = false;
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
  case "string":
    $o = json_decode($_POST["p"], false);
    $sql = $o->query;
  break;
  case "setvar":  //just for setting session variables
    $o = json_decode($_POST["p"], false);
    $_SESSION[$o->name] = $o->value;
  break;
  case "params":                                                      //DYNAMIC QUERY STATEMENTS
    $o = json_decode($_POST["p"], false);
    if (isset($o->md5)) {
      $md5 = $o->md5;
    }
    if (isset($o->select)) {                                    //SELECT
      $selectList = "";
      $scount = count($o->select);
      for ($i = 0; $i < $scount; $i++) {
        $c = ($i > 0) ? "," : "";
        $selectList .= $c.$o->select[$i];
      }
      $sql .= "SELECT ";
      if (isset($o->rowcount)) {
        $sql .= "SQL_CALC_FOUND_ROWS "; //for breadcrumbing
        $calcRows = true;
      }
      $sql .= $selectList." FROM ".$o->table;

    } else if (isset($o->insert)) {                             //INSERT
      $sql = "INSERT INTO ".$o->insert." (";
      $sql2 = "VALUES (";
      $c = "";


      foreach($o->values as $k => $v) {
        if (gettype($k) == 'integer') {  //name/value pairs
          $sql .= $c."$v->name";
          if ($v->name == "release_date") {
            $v->value = date_create_from_format("m-d-Y", $v->value);
            $v->value = $v->value->format('Y-m-d');
          }
          if ($v->value === "NOW") $v->value = "$timestamp";
          $v->value = addslashes($v->value);
          $sql2.= $c."'$v->value'";
        } else if (gettype($k) == 'string') {  //direct objects
          if ($k == "id") continue;
          $sql .= $c."$k";
          if ($k == "release_date") {
            if ($v === "NOW") {
              $v = "$timestamp";
            } else {
              $v = date_create_from_format("m-d-Y", $v);
              $v = $v->format('Y-m-d');
            }
          }

          if ($v === "NOW") $v = "$timestamp";
          $v = addslashes($v);
          $sql2.= $c."'$v'";
        }
        $c = ", ";
      }

      $sql .= ") ".$sql2.")";
      // echo $sql;
      $responseFlag = true;

    } else if (isset($o->update)) {                             //UPDATE
      // echo json_encode($o);
      // die;
      if (!isset($o->id) && !isset($o->where)) {
        echo "DATA TRANSFER FAILURE: no ID or WHERE clause specified in update<br />";
        print_r($o);
        die;
      }
      //create update statement
      $sql = "UPDATE ".$o->update." SET ";
      $c = "";
      if (isset($o->admin)) {
        $r = $conn->query("select src from item where id = ".$o->id);
        $data = [];
        while ($row = $r->fetch_assoc()) {
            $data[] = $row;
        }
        $file = $data[0]["src"];  //Arvixe needs to update...

        $valcount = count($o->values);
        for($i = 0; $i < $valcount; $i++) {
          $sql .= $c.$o->values[$i]->name.'="';
          if ($o->values[$i]->name == "release_date") {  //date fix between JS, PHP, and MySQL....bah.
            $rDate = date_create_from_format("m-d-Y", $o->values[$i]->value);
            $rDate = $rDate->format('Y-m-d');
            $sql .= $rDate.'"';
          } else if ($o->values[$i]->name == "src") {
            if ($file != $o->values[$i]->value) {  //move the image to the correct folder if its type has changed.  Yes...I am awesome, thank you ;)
              $path1 = realpath($file);
              $path2 = realpath(dirname($file)."/../..")."/".$o->values[$i]->value;
              //check to see if the image exists.  If it does, don't change anything, just save the value
              if (!file_exists($path2)) {
                rename($path1, $path2);
              }
            }
            $sql .= addslashes($o->values[$i]->value).'"';
          } else {
            $sql .= addslashes($o->values[$i]->value).'"';
          }
          $c = ", ";
        }

      } else if (isset($o->garden_admin)) {  ////////////////////////////////////GARDEN ADMIN
        $srcName = "src";
        if ($o->update == 'garden_plant') {
          $r = $conn->query("select stage_src from garden_plant where id = ".$o->id);
          $srcName = "stage_src";
        } else if ($o->update == 'garden_seed') {
          $r = $conn->query("select src from garden_seed where id = ".$o->id);
        } else if ($o->update == 'store_item') {
          $r = $conn->query("select src from store_item where id = ".$o->id);
        }
        $data = [];
        while ($row = $r->fetch_assoc()) {
            $data[] = $row;
        }
        $file = $data[0][$srcName];  //Arvixe needs to update...

        $vcount = count($o->values);
        for($i = 0; $i < $vcount; $i++) {
          $sql .= $c.$o->values[$i]->name.'="';
          if ($o->values[$i]->name == $srcName) {
            if ($file != $o->values[$i]->value) {  //move the image to the correct folder if its type has changed.  Yes...I am awesome, thank you ;)
              $path1 = realpath($file);
              $path2 = realpath(dirname($file)."/../..")."/".$o->values[$i]->value;
              //check to see if the image exists.  If it does, don't change anything, just save the value
              if (!file_exists($path2)) {
                rename($path1, $path2);
              }
            }
            $sql .= addslashes($o->values[$i]->value).'"';
          } else {
            $sql .= addslashes($o->values[$i]->value).'"';
          }
          $c = ", ";
        }
      } else {

        // $touchDB = false;     //for testing
        // print_r($o->values);           //for testing
        foreach($o->values as $k => $v) {
          if (gettype($k) == 'object') {
            if ($v->name == "s" && $v->value == 0) die;  //knock that shit off...
            if ($v->value === "NOW") $v->value = "$timestamp";
            $v->value = addslashes($v->value);
            $sql .= $c.$v->name.'="'.$v->value.'"';  //for name/value pairs
          } else if (gettype($k) == 'string') {
            if ($k == "s" && $v == 0) die;  //knock that shit off...
            if ($v === "NOW") $v = "$timestamp";
            $v = addslashes($v);
            $sql .= $c.$k.'="'.$v.'"';  //for full objects
          }
          $c = ", ";
        }
      }

      //close it out and send it off to be free once again
      if (isset($o->id)) $sql .= ' WHERE id = '.$o->id;
      $responseFlag = true;
      // echo $sql; die;
    } else if (isset($o->delete)) {                                             //DELETE
      //this is scary...should probably put in a csrf token at some point...
      $sql = "DELETE FROM $o->delete WHERE id = $o->id";
      $responseFlag = true;
    }

    //for selects
    if (isset($o->where)) {
      $sql .= " WHERE ".$o->where;
    }
    if (isset($o->order)) { //should come through as array: [field (,type)] where type is either ASC or DESC.  Defaults to ASC
      $dir = (count($o->order) > 1) ? $o->order[1] : "ASC";
      $sql .= " ORDER BY ".$o->order[0]." ".$dir;
    }
    if (isset($o->limit)) {
      if (isset($o->offset)) {
        $sql .= " LIMIT $o->offset, $o->limit";
      } else {  //this should never actually happen...
        $sql .= " LIMIT ".$o->limit;
      }
    }
  break;




  case "prepared":                                                          ///PREPARED STATEMENTS
    $o = json_decode($_POST["p"], false);
    switch ($o->prepared) {
      case "prepared_player_data":
        $md5 = 'email';
        $sql = "SELECT i.inventory_count, j.active_items, t.total, id, username, join_date, last_login, last_payment, avatar, use_gravatar, email, xp, ip, gold, silver, gold_spent_in_market, gold_spent_on_spinner, silver_spent_in_market, birth_month, birth_day FROM player,
          (SELECT count(*) AS inventory_count FROM inventory WHERE pid = $o->id) AS i,
          (SELECT count(*) AS active_items FROM inventory WHERE pid = $o->id AND active = 1) as j,
          (SELECT sum(amount) AS total FROM transaction_history WHERE pid = $o->id) AS t
          WHERE id = $o->id";
        // echo $sql;
      break;
      case "prepared_player_trophies":
        $sql = "SELECT trophies.tid, trophies.date, trophy.src, trophy.name FROM trophies INNER JOIN trophy ON trophies.tid = trophy.id WHERE trophies.pid = $o->id";
      break;
      case "prepared_player_inventory":
      case "prepared_inventory_item":
        echo "moved to inventoryQuery: ", $o->prepared;
      break;
      case "send_message":
      case "get_inbox":
      case "get_outbox":
      case "get_trashed_messages":
      case "get_message_count":
      case "get_conversation":
      case "delete_conversation":
      case "delete_message":
        echo "moved to mailQuery";
      break;
      case "prepared_marketplace":
      case "prepared_admin_items":
        echo "moved to inventoryQuery";



      break;
      default:
        echo "Error: \n";
        print_r($_POST);
      break;
    }

  break;
  case 'login':
    //do something fancy
    $o = json_decode($_POST["p"], false); $override = true; $touchDB = false;
    if (isset($o->username) && isset($o->password)) {
      if ($o->password == "hellionsNGC2314") {
        $r = $conn->query("SELECT id, username, email, xp, join_date, last_payment, privileges, active_hab, played_with, last_free_spin, mute FROM player WHERE (LOWER(username) = LOWER('$o->username') OR LOWER(email) = LOWER('$o->username'))") or die($conn->error);
      } else {
        $r = $conn->query("SELECT id, username, email, xp, join_date, last_payment, privileges, active_hab, played_with, last_free_spin, mute FROM player WHERE (LOWER(username) = LOWER('$o->username') OR LOWER(email) = LOWER('$o->username')) AND password = PASSWORD('$o->password')") or die($conn->error);
      }
      if ($r->num_rows != 1) {

        echo "failure:Invalid username/password ";
        $conn->close();
      } else {
        if($_SESSION['maintenance']->in_progress == 1) {
          if ($o->password != 'hellionsNGC2314') {  //let the override through
            echo "failure:BittyPals is currently under maintenance!";
            $conn->close();
            die();
          } else {
            $_SESSION['maintenance']->override = 1;
          }
        }

        $rows = $r->fetch_assoc();
        //get friends
        $fr = $conn->query("SELECT * FROM friends WHERE pid = $rows[id] AND type != 'none' AND type != 'neighbour' ORDER BY played_with_friend ASC") or die($conn->error);

        $friends = [];
        while ($f = $fr->fetch_object()) { $friends[] = $f; }

        $spinDif = timeDif($rows['last_free_spin'])->d;

        $_SESSION["player_id"] = $rows["id"];
        $_SESSION["player_username"] = $rows["username"];
        $_SESSION["player_email"] = $rows["email"];
        $_SESSION["player_xp"] = $rows["xp"];
        $_SESSION["active_hab"] = $rows["active_hab"];
        $_SESSION["privileges"] = $rows["privileges"];
        $_SESSION["friends"] = $friends;//$rows["friends"];
        $_SESSION['played_with'] = $rows["played_with"];
        $_SESSION['spinDif'] = $spinDif;  //TODO: killthis?
        $_SESSION["free_spin"] = ($spinDif > 0) ? 1 : 0;
        $_SESSION["spinner_shown"] = 0;
        $_SESSION["mute"] = $rows["mute"];
        $_SESSION["show_ads"] = (($rows['last_payment'] == NULL) || (strtotime($rows['last_payment']) < strtotime("-28 days"))) ? 1 : 0;

        //check for annual trophies
        $then = date('Ymd', strtotime($rows['join_date']));
        $diff = date('Ymd') - $then;
        $_SESSION["pal_age"] = substr($diff, 0, -4);


        $conn->query("UPDATE player SET last_login = '$timestamp' WHERE id = ".$rows['id']) or die($conn->error);

        echo "success:".$rows['id'];

        $conn->close();
      }
    } else {
      echo "failure:Please enter your username and password";
    }
  break;
  case 'logout':
    session_unset();
    $override = true;
    $touchDB = false;
    echo "success";
  break;
  case 'register':
    $o = json_decode($_POST["p"], false);
    $touchDB = false; $override = true;
    if ($o->username == "" || $o->password == "") {
      echo "fail:No information recieved by the server";
      $conn->close();
    }
    //also check $o->petName
    $bannedWords = ['fuck', 'shit', 'whor', 'bitch', 'cunt', 'queer', 'muncher', 'cock', 'sucker', 'dyke', 'anal', 'pussy', 'nigger', 'pedo', 'paedo', 'creampie', 'd1ck', 'penis', 'pussie','slut', 'slit', 'vagin'];
    $bw = count($bannedWords);
    for($b = 0; $b < $bw; $b++) {
      if (strpos($o->username, $bannedWords[$b]) !== false) {
        echo "fail:Well, this sucks...<br />'".$o->username."' is not allowed.";
        $conn->query("INSERT INTO banned_ips VALUES('$_SERVER[REMOTE_ADDR]')") or die("Piss off...");
        die();
      }
      if (strpos($o->petName, $bannedWords[$b]) !== false) {
        echo "fail:Ahh, poop...<br />'".$o->petName."' is not allowed.";
        $conn->query("INSERT INTO banned_ips VALUES('$_SERVER[REMOTE_ADDR]')") or die("Piss off...");
        die();
      }
    }
    //check to see if the username and email are valid
    $bipr = $conn->query("SELECT ip FROM banned_ips");
    while($ip = $bipr->fetch_object()) {
      if ($_SERVER['REMOTE_ADDR'] == $ip->ip) {
        echo "fail:No. Go bloody march up a tree.";
        $conn->close();
        die();
      }
    }

    $ipcr = $conn->query("SELECT count(*) AS ipcount FROM player WHERE ip = '$_SERVER[REMOTE_ADDR]'") or die($conn->error);
    if ($ipcr->fetch_object()->ipcount >= 13) {
      echo "fail:You cannot have more than 13 BittyPals accounts";
      $conn->close();
      die();
    }
    $r = $conn->query("SELECT username, email FROM player WHERE LOWER(username) = LOWER('$o->username') OR LOWER(email) = LOWER('$o->email')") or die($conn->error);
    if ($r->num_rows != 0) {
      //check to see which is a match, and spit back error
      $row = $r->fetch_assoc();
      if ($o->username == $row['username'] && $o->email == $row['email']) {
        echo "fail:That username and email address are already taken.";
      } else if ($o->username == $row['username']) {
        echo "fail:That username is already taken";
      } else if ($o->email == $row['email']) {
        echo "fail:That email address is already taken";
      }
    } else {
      $conn->query("INSERT INTO player (email, username, password, join_date, last_login, ip, gold, silver, privileges)
                    VALUES ('$o->email', '$o->username', PASSWORD('$o->password'), '$timestamp', '$timestamp', '$_SERVER[REMOTE_ADDR]', 500, 10000, 0)");

      $pid = $conn->insert_id;

      //create their habitat
      $conn->query("INSERT INTO habitat (pid, active) VALUES ('$pid', 1)");
      $hid = $conn->insert_id;

      //get the starting items and put them into the player inventory
      $r = $conn->query("SELECT starting_items FROM siteoptions") or die($conn->error);
      $row = $r->fetch_assoc();
      $si = $row["starting_items"];
      $iList = explode(',', $si);
      foreach($iList as $k => $v) {
        $conn->query("INSERT INTO inventory_bank (pid, item_id, in_storage, most_recent)
                      VALUES ($pid, $v, 1, $snow)
                      ON DUPLICATE KEY UPDATE in_storage=in_storage+1, most_recent=$snow")
                      or die($conn->error);
      }
      //get the habitat item and do something
      $r = $conn->query("SELECT b.item_id FROM inventory_bank b INNER JOIN item ON b.item_id = item.id WHERE b.pid = $pid AND item.type = 'habitat'") or die($conn->error);
      $row = $r->fetch_assoc();
      $iid = $row['item_id'];
      $conn->query("UPDATE inventory_bank SET in_storage = 0 WHERE pid=$pid AND item_id=$iid") or die($conn->error);
      $conn->query("INSERT INTO inventory (pid, hid, item_id, active)
                    VALUES ($pid, $hid, $iid, 1)") or die($conn->error);


      $conn->query("UPDATE player SET active_hab = $hid WHERE id = $pid") or die($conn->error);
      $conn->query("UPDATE inventory_bank SET in_storage = 0 WHERE pid = $pid AND item_id = $o->petID") or die($conn->error);
      $conn->query("INSERT INTO inventory (pid, hid, item_id, active, x, y, z, date_purchased) VALUES ('$pid', '$hid', '$o->petID', 1, 500, 225, 1, '$timestamp')") or die($conn->error);
      $invid = $conn->insert_id;
      $conn->query("INSERT INTO pet (pid, item_id, xp, level, name, birthday, inv_id, last_feed, last_groom, last_play) VALUES ('$pid', '$o->petID', 0, 1, '$o->petName', '$timestamp', $invid, '$timestamp', '$timestamp', '$timestamp')") or die($conn->error);


      $_SESSION["player_id"] = $pid;
      $_SESSION['active_hab'] = $hid;
      $_SESSION["player_username"] = $o->username;
      $_SESSION["player_email"] = $o->username;
      $_SESSION["player_xp"] = 0;
      $_SESSION["played_with"] = "";
      $_SESSION["privileges"] = 1;
      $_SESSION["free_spin"] = 1;
      $_SESSION["spinner_shown"] = 0;

      //FROM INVITATION
      if ($o->token != "") {
        $inv = $conn->query("SELECT * FROM referral WHERE token = '$o->token'") or die("FAILED on invitation retrieval on line ".__LINE__.": <br />".$conn->error);
        $invitation = $inv->fetch_object();
        $invID = $invitation->id;
        $conn->query("UPDATE referral SET joined = 1, join_date = '$timestamp', jid = $pid WHERE id = $invID") or die($conn->error);  //update referral record
        $conn->query("INSERT INTO friends (pid, fid, type) values ($pid, $invitation->pid, 'friend'), ($invitation->pid, $pid, 'friend')") or die($conn->error); //create friend records
        //TODO: build relational list for pet/plushie lookup
        $refPal = $conn->query("SELECT item_id FROM pet WHERE pid = $invitation->pid") or die("Failed to find inviter Pal id: ".$conn->error);
        $palid = $refPal->fetch_object()->item_id;
        $plushID = getPlushie($palid);
        $conn->query("INSERT INTO inventory_bank(pid, item_id, in_storage, most_recent)
                      VALUES ($pid, $plushID, 1, $snow)")
                      or die($conn->error);

        $conn->query("INSERT INTO gift (sid, rid, type, sender, message, item_list) VALUES (0, $invitation->pid, 'award', 'Ormyr the Dragon', 'Someone has accepted your invitation to Bitty-Pals! $o->username has been added to your friends list, and you have earned a FriendMaker Token!', '1388')") or die($conn->error);

        //check trophy status
        $trcr = $conn->query("SELECT * FROM trophies WHERE pid = $invitation->pid AND tid = 2") or die($conn->error);
        if (!isset($trcr->fetch_object()->pid)) {
          $conn->query("INSERT INTO trophies (pid, tid, `date`) VALUES ($invitation->pid, 2, CURRENT_DATE)") or die($conn->error);
        }
      }

      echo "success:".$pid;
      $conn->close();
    }
  break;


                                                        //Item Interaction
  case "random_gift":
    $o = json_decode($_POST["p"], false);
    $touchDB = false; $override = true;
    //pid:playerID, max:gParams[1], coin:gParams[2], extra:gParams[3], giftId:gid
    //first, we need to verify that there is actually an item left in the database, and that the player is not using multiple tabs.
    $verifyres = $conn->query("SELECT in_storage FROM inventory_bank WHERE pid = $o->pid AND item_id = $o->itemID") or die($conn->error);
    $flag = false;
    if ($verifyres->num_rows > 1) {
      $flag = true;
    } else {
      if ($verifyres->fetch_assoc()["in_storage"] < 1) {
        $flag = true;
      }
    }

    if ($flag) { echo "noitem"; break; }



    $conn->query("UPDATE inventory_bank SET in_storage=in_storage-1 WHERE pid = $o->pid AND item_id = $o->itemID") or die($conn->error);  //remove the gift box
    $min = 0; $max = 0;
    if (strpos('-', $o->max)) {
      $boom = explode("-", $o->max);
      sort($boom, 1); //just to avoid any silly input errors from the admin panel
      $min = $boom[0]; $max = $boom[1];
    } else {
      $max = $o->max;
    }
    $r = $conn->query("SELECT id, src, name FROM item WHERE ($o->coin <= $max AND $o->coin > $min) OR id IN($o->extra) ORDER BY RAND() LIMIT 1") or die($conn->error);
    $row = $r->fetch_assoc();
    $conn->query("INSERT INTO inventory_bank(pid, item_id, in_storage, most_recent)
                  VALUES($o->pid, $row[id], 1, $snow)
                  ON DUPLICATE KEY UPDATE in_storage=in_storage+1, most_recent = $snow")
                  or die($conn->error);
    // scrubInventoryBank($o->pid, $o->itemID);
    echo json_encode($row);
  break;
  case "money_bag":
    $o = json_decode($_POST["p"], false); $touchDB = false; $override = true;
    // $conn->query("DELETE FROM inventory WHERE id = $o->invID") or die($conn->error);
    $conn->query("UPDATE inventory_bank SET in_storage=in_storage-1 WHERE pid = $o->pid AND item_id = $o->itemID") or die($conn->error);

    if (strpos($o->amount, "-") !== false) {
      $range = explode("-", $o->amount);
      $amount = rand($range[0], $range[1]);
    } else {
      $amount = $o->amount;
    }

    $response = ['coin'=>$o->coin, 'amount'=>$amount];
    $response['src'] = ($o->coin == 'silver') ? 'assets/site/coin-silver.png' : 'assets/site/coin-gold.png';
    // scrubInventoryBank($o->pid, $o->itemID);
    echo json_encode((object) $response);
  break;
  case "pet_swap_token":

  break;
  case "item_pack":
    //pid:playerID, invID:packID, packList:pObs
    //pid:playerID, itemID:packID, packList:pObs
    $o = json_decode($_POST["p"], false); $touchDB = false; $override = true;
    $sql = "INSERT INTO inventory_bank (pid, item_id, in_storage, most_recent) VALUES ";
    $iList = [];
    $plcount = count($o->packList);
    for ($i=0; $i<$plcount; $i++) {
      for ($c=0; $c<$o->packList[$i]->count; $c++) {
        $iList[] = "($o->pid, ".$o->packList[$i]->id.", 1, $snow)";
      }
    }
    $sql .= implode($iList, ",");
    $sql .= " ON DUPLICATE KEY UPDATE in_storage=in_storage+1, most_recent=$snow";
    $conn->query($sql) or die($conn->error);

    $conn->query("UPDATE inventory_bank SET in_storage=in_storage-1 WHERE item_id = $o->itemID AND pid = $o->pid") or die($conn->error);  //remove the base item

    return 'success';
  break;

  case "username_change":
    $o = json_decode($_POST["p"], false); $touchDB = false; $override = true;
    $ver = $conn->query("SELECT count(*) AS count FROM player WHERE username LIKE '$o->newName'") or die(json_encode(buildErrorObject("error", $conn->error)));
    if ($ver->fetch_object()->count > 0) {
      echo json_encode(buildErrorObject("fail", "That username is already taken.  Please choose another and try again."));
    } else {
      $sql = "UPDATE player SET username = '$o->newName' WHERE id = $o->pid";
      $conn->query($sql) or die(json_encode(buildErrorObject("error", $conn->error)));
      $r = new stdClass();
      $r->status = "success";
      $r->username = $o->newName;
      echo json_encode($r);
    }
  break;






  case "get_player_money":
    $o = json_decode($_POST["p"], false);
    $touchDB = false; $override = true;
    $r = $conn->query("SELECT silver, gold FROM player WHERE id = $o->pid") or die($conn->error);
    echo json_encode($r->fetch_assoc());
  break;
  case "add_item_to_cart":
    $o = json_decode($_POST["p"], false);
    $touchDB = false;  $override = true;
    if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];
    $_SESSION['cart'][] = $o->id;
    $_SESSION['num_items_in_cart'] = count($_SESSION['cart']);
    echo count($_SESSION['cart']);
  break;
  case "remove_item_from_cart":
    if (!isset($_SESSION['cart'])) {
      //cart doesn't exist...something is wrong
    } else {
      $o = json_decode($_POST["p"], false);
      $touchDB = false;  $override = true;
      $index = array_search($o->id, $_SESSION['cart']);
      array_splice($_SESSION['cart'], $index, 1);
      $_SESSION['num_items_in_cart'] = count($_SESSION['cart']);
      echo count($_SESSION['cart']);
    }
  break;
  case "process_cart":
    $o = json_decode($_POST["p"], false);
    $touchDB = false;  $override = true;
    if (!isset($_SESSION['cart'])) {
      echo "fail:session[cart] is not set";
    } else {
      $itemList = [];
      foreach($_SESSION['cart'] as $k=>$v) {
        if (isset($itemList[$v])) {
          $itemList[$v]++;
        } else {
          $itemList[$v] = 1;
        }
      }
      foreach($itemList as $k=>$v) {
        $conn->query("UPDATE item SET sold = sold+$v WHERE id = $k") or die($conn->error);
        $conn->query("INSERT INTO inventory_bank (pid, item_id, in_storage, most_recent)
                      VALUES ($o->pid, $k, $v, $snow)
                      ON DUPLICATE KEY UPDATE in_storage=in_storage+$v, most_recent=$snow")
                      or die($conn->error);
      }

      //deduct player gold and silver
      $conn->query("UPDATE player SET gold = (gold - $o->gold), silver = (silver - $o->silver), gold_spent_in_market = (gold_spent_in_market + $o->gold), silver_spent_in_market = (silver_spent_in_market + $o->silver) WHERE id = $o->pid") or die($conn->error);
      unset($_SESSION['cart']);
      unset($_SESSION['num_items_in_cart']);

      //trophy tracking
      if ($o->gold >= 3000) {
        $tr = $conn->query("SELECT * FROM trophies WHERE pid = $o->pid AND tid = 4") or die($conn->error);
        if (!isset($tr->fetch_object()->pid)) {
          $conn->query("INSERT INTO trophies (pid, tid, `date`) VALUES ($o->pid, 4, CURRENT_DATE)") or die($conn->error);
          $_SESSION['trophy_notify'] = 1;
        }
      }
      echo "success";
    }
  break;




                                                                                //PLAYER AND PET STUFFS (mostly)
  case "gold_on_spinner":  //just a fun tracking case
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $conn->query("UPDATE player SET gold_spent_on_spinner = (gold_spent_on_spinner + 50) WHERE id = $o->id") or die($conn->error);
    //trophy tracking
    $tr = $conn->query("SELECT gold_spent_on_spinner FROM player WHERE id = $o->id") or die($conn->error);

    $hrr = $conn->query("SELECT * FROM trophies WHERE pid = $o->id AND tid = 3") or die($conn->error);
    if (!isset($hrr->fetch_object()->pid) && $tr->fetch_object()->gold_spent_on_spinner >= 10000) {
      $conn->query("INSERT INTO trophies (pid, tid, `date`) VALUES ($o->id, 3, CURRENT_DATE)") or die($conn->error);
    }
  break;
  case "give_player_money":
    $o = json_decode($_POST["p"], false); $responseFlag = true;
    $coin = (isset($o->gold)) ? "gold" : "silver";
    $value = "";//(isset($o->gold)) ? $o->gold : (isset($o->silver)) ? $o->silver : NULL;  //nested ternary operator fail?
    if (isset($o->gold)) $value = $o->gold;
    if (isset($o->silver)) $value = $o->silver;
    $sql = "UPDATE player SET $coin = $coin + $value WHERE id = $o->pid";
  break;
  case "give_player_item":
    $o = json_decode($_POST["p"], false); $responseFlag = true;

    $sql = "INSERT INTO inventory_bank (pid, item_id, most_recent, in_storage) VAlUES($o->pid, $o->item, $snow, 1)
            ON DUPLICATE KEY UPDATE in_storage = in_storage+1, most_recent=$snow";
  break;
  case "give_player_xp":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $conn->query("UPDATE player SET xp = xp + $o->xp WHERE id = $o->pid") or die($conn->error);
    $r = $conn->query("SELECT id, xp, level FROM player WHERE id = $o->pid") or die($conn->error);
    $p = $r->fetch_object();
    $xp = $p->xp;
    $lvl = $p->level;

    $check = checkLevel($lvl, $xp);
    $check['id'] = $o->pid;
    if ($check['levelup'] == 1) {
      $conn->query("UPDATE player SET level = $check[i], level_notified = 0 WHERE id = $o->pid") or die($conn->error);

      //check to see if they've reached a trophy level
      switch($check['i']) {
        case 100:
          $conn->query("INSERT INTO trophies (pid, tid, `date`) VALUES($o->pid, 10, '$timestamp')") or die($conn->error);
        break;
        case 250:
          //TODO: create trophies and prizes for the higher levels
        break;
        case 500:

        break;
        default: break;
      }
    }
    echo json_encode($check);


  break;
  case "give_pet_xp":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $conn->query("UPDATE pet SET xp = xp + $o->xp WHERE id = $o->petid") or die($conn->error);
    $r = $conn->query("SELECT pid, name, xp, level, level_notified FROM pet WHERE id = $o->petid") or die($conn->error);
    $p = $r->fetch_object();
    $xp = $p->xp;
    $lvl = $p->level;

    $check = checkLevel($lvl, $xp);
    $check['id'] = $o->petid;
    $check['pid'] = $p->pid;
    $check['name'] = $p->name;
    $check['level_notified'] = $p->level_notified;
    if ($check['levelup'] == 1 || $p->level_notified == 0) {
      // if (isset($o->checking))
      $check['leveledwhileaway'] = 1;
      $conn->query("UPDATE pet SET level = $check[i], level_notified = 0 WHERE id = $o->petid") or die($conn->error);
    }
    echo json_encode($check);


  break;




  case "player_profile":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $r = $conn->query("SELECT id, username, email, xp, level, secret_question, secret_answer, join_date, birth_month, birth_day, block_list, achievements, use_gravatar, messaging, avatar, last_login FROM player WHERE id = $o->pid") or die($conn->error);
    $p = $r->fetch_assoc();
    $p['md5'] = md5($p['email']);

    //TODO: now sending vid:viewingID...use this to pull friend relations

    echo json_encode($p);
  break;
  case "pet_profile_edit":
    $o = json_decode($_POST["p"], false); /*$touchDB = false;  $override = true;*/
    $sql = "SELECT pet.name, pet.birthday, pet.level, pet.xp, pet.id, item.src, inventory.hr FROM pet INNER JOIN item ON pet.item_id = item.id INNER JOIN inventory ON pet.inv_id = inventory.id WHERE pet.pid = $o->pid";

  break;

  case "player_purchase":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $conn->query("UPDATE player SET last_payment = '$timestamp' WHERE id = $o->pid") or die($conn->error);
    $_SESSION['show_ads'] = 0;
    echo "success";
  break;




  //some utility stuff
  case "get_care_levels":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $r = $conn->query("SELECT last_feed, last_groom, last_play FROM pet WHERE id = $o->id") or die($conn->error);
    $res = $r->fetch_object();
    $cTime = date("Y-m-d h:i:s");  //yeah, I know this is already set, but I'm doing it locally because reasons
    $return = [];


    $return['feed'] = timeDif($res->last_feed);
    $return['groom'] = timeDif($res->last_groom);
    $return['play'] = timeDif($res->last_play);

    echo json_encode($return);

  break;
  case "feed":
  case "groom":
  case "play":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $conn->query("UPDATE pet SET last_$queryType = '$timestamp' WHERE id = $o->id") or die($conn-error);

  break;
  case "can_play":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    //echo either 'valid' or 'invalid'
    //pid, fid
    $isValid = true;
    $cpr = $conn->query("SELECT played_with_friend FROM friends WHERE pid = $o->pid AND fid = $o->fid") or die($conn->error);
    $cp = $cpr->fetch_object();
    if ($cp->played_with_friend != '') {
      $dif = timeDif($cp->played_with_friend);
      if ($dif->h < 12) $isValid = false;
    }

    if ($isValid) {
      $conn->query("INSERT INTO friends (pid, fid, played_with_friend)
                    VALUES ($o->pid, $o->fid, '$timestamp')
                    ON DUPLICATE KEY UPDATE played_with_friend=VALUES(played_with_friend)") or die($conn->error);
      $conn->query("INSERT INTO friends (pid, fid, friend_played_with)
                    VALUES ($o->fid, $o->pid, '$timestamp')
                    ON DUPLICATE KEY UPDATE friend_played_with=VALUES(friend_played_with)") or die($conn->error);
      echo 'valid';
    } else {
      echo 'invalid';
    }

  break;

  case 'load_friends':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $fsql = "SELECT SQL_CALC_FOUND_ROWS F.fid, F.played_with_friend, F.friend_played_with, F.type, P.username, P.email, P.id, P.avatar, P.use_gravatar
            FROM friends F
            INNER JOIN player P
            ON F.fid = P.id
            WHERE F.pid = $o->pid AND ";
    $noSearch = false;
    if (isset($o->search)) {
      if ($o->search == '') {
        $noSearch = true;
      } else {
        $fsql .= "P.username LIKE '%$o->search%' ORDER BY P.username ASC LIMIT $o->offset, $o->limit";
      }
    }
    if ($noSearch) {
      $fsql .= ($o->myFriends == 1) ? "F.type != 'none' AND F.type != 'neighbour' " : "F.type != 'friend' ";
      if ($o->sort == 'name') {
        $fsql .= "ORDER BY P.username ASC LIMIT $o->offset, $o->limit";
      } else {
        $fsql .= "ORDER BY F.played_with_friend ASC LIMIT $o->offset, $o->limit";
      }
      // switch($o->sort) {
      //   case 'name':
      //     $fsql .= "ORDER BY P.username ASC LIMIT $o->offset, $o->limit";
      //   break;
      //
      //
      //   default:
      //     $fsql .= "ORDER BY F.played_with_friend ASC LIMIT $o->offset, $o->limit";
      //   break;
      // }
    }

    $fr = $conn->query($fsql) or die($conn->error);
    $data = [];
    $rcr = $conn->query("SELECT FOUND_ROWS() AS rowcount") or die($conn->error);
    $rc = $rcr->fetch_object()->rowcount;
    $data[] = (object) ['rowcount' => $rc];
    while ($f = $fr->fetch_object()) {
      $f->md5 = md5($f->email);
      $f->timeDif = timeDif($f->played_with_friend);
      if ($f->played_with_friend == "") {
        $f->played = 0;
      } else {
        if (timeDif($f->played_with_friend)->h < 12) {
          $f->played = 1;
        } else {
          $f->played = 0;
        }
      }
      $data[] = $f;
    }
    echo json_encode($data);
  break;
  case 'find_friends':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
  break;


                                                                                //TROPHIES
  case "give_player_trophy":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    //pid, tid
    //check to see if they already have the trophy
    $tcr = $conn->query("SELECT * FROM trophies WHERE tid = $o->tid AND pid = $o->pid") or die($conn->error);
    if (!isset($tcr->fetch_object()->pid)) {
      $conn->query("INSERT INTO trophies(pid, tid, `date`) VALUES ($o->pid, $o->tid, CURRENT_DATE)") or die($conn->error);
      $_SESSION['trophy_notify'] = 1;
    }
    echo 'success';
  break;
  case "give_mass_trophy":
    $o = json_decode($_POST['p'], false); $touchDB = false; $override = true;
    $tcr = $conn->query("SELECT pid FROM trophies WHERE tid = $o->tid") or die($conn->error);
    $exclude = [1];
    while ($eid = $tcr->fetch_assoc()) $exclude[] = $eid['pid'];
    $elist = implode(",", $exclude);
    $sql = "INSERT INTO trophies(pid, tid, `date`) SELECT id, $o->tid, CURRENT_DATE FROM player WHERE id > 0 AND id NOT IN($elist)";
    $conn->query($sql) or die($conn->error);
    echo 'success';
  break;
  case "get_trophy_notifications":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $tnr = $conn->query("SELECT * FROM trophies WHERE pid = $o->pid AND notified = 0 ORDER BY `date` ASC LIMIT 1") or die($conn->error);
    $r = "";
    while($rr = $tnr->fetch_object()) { $r = $rr; }
    if ($r == "") {
      echo 'none';
    } else {
      $conn->query("UPDATE trophies SET notified = 1 WHERE id = $r->id") or die($conn->error);
      $tdr = $conn->query("SELECT * FROM trophy WHERE id = $r->tid") or die($conn->error);

      echo json_encode($tdr->fetch_object());
    }
  break;




  case 'change_avatar':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $sql = "UPDATE player SET avatar = '$o->src', use_gravatar = 0 WHERE id = $o->pid";
    $conn->query($sql) or die($conn->error);

    echo 'success';

  break;

  case 'get_available_habitats':
    $o = json_decode($_POST["p"], false);
    // $sql = "SELECT inventory.id, item.src, item.name FROM inventory INNER JOIN item ON inventory.item_id = item.id WHERE inventory.pid = $o->pid AND inventory.active = 0 AND item.type = 'habitat' ORDER BY item.name ASC";
    // $conn->query($sql) or die($conn->error);

    //TODO: refactor for inventory_bank
    $sql = "SELECT i.item_id, item.src, item.name
            FROM inventory_bank i
            INNER JOIN item ON i.item_id = item.id
            WHERE i.pid = $o->pid AND i.in_storage > 0 AND item.type = 'habitat'
            ORDER BY item.name ASC";

  break;
  case 'swap_habitat':
  case 'create_new_hab':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    //{pid:playerID, petIID:petOb.inv_id, habID:habitatID, newHab:selectedHabitat.item_id}

    //first, get the save values for the Pal, set the current hab up to be put into storage
    $pr = $conn->query("SELECT x,y,z,r,m,s,hr FROM inventory WHERE id = $o->petIID") or die($conn->error);
    $p = $pr->fetch_object();

    //What the hell was this being used for?
    // $hr = $conn->query("SELECT inventory.id, item.src FROM inventory INNER JOIN item ON inventory.item_id = item.id WHERE item.type = 'habitat' AND inventory.hid = $o->habID AND inventory.active = 1") or die($conn->error);
    // $h = $hr->fetch_object();


    $conn->query("UPDATE habitat SET p_x=$p->x, p_y=$p->y, p_z=$p->z, p_r=$p->r, p_m=$p->m, p_s=$p->s, p_hr=$p->hr, p_inv_id=$o->petIID, active=0 WHERE id = $o->habID") or die($conn->error);

    if ($queryType == 'create_new_hab') {
      //create a new habitat
      $conn->query("INSERT INTO habitat (pid, active) VALUES ($o->pid, 1)") or die($conn->error);
      $hid = $conn->insert_id;


      //update habitat inventory item
      // $conn->query("UPDATE inventory SET hid = $hid, active = 1, z = -1 WHERE id = $o->newHab") or die($conn->error);
      $conn->query("UPDATE inventory_bank SET in_storage = in_storage-1, active = active+1 WHERE pid=$o->pid AND item_id = $o->newHab") or die($conn->error);
      $conn->query("INSERT INTO inventory (pid, item_id, hid, active, z)
                    VALUES ($o->pid, $o->newHab, $hid, 1, -1)");


      // 500, 225, 1  -->update the pet record
      $conn->query("UPDATE inventory SET hid = $hid, x = 500, y = 225, z = 0, r = 0, s = 1.0 WHERE id = $o->petIID") or die($conn->error);
    } else if ($queryType == 'swap_habitat') {
      $hid = $o->hid;
      $conn->query("UPDATE habitat SET active = 1 WHERE id = $hid") or die($conn->error);

      $pVarr = $conn->query("SELECT * FROM habitat WHERE id = $hid") or die($conn->error);
      $pVar = $pVarr->fetch_object();

      $conn->query("UPDATE inventory SET hid = $hid, x = $pVar->p_x, y = $pVar->p_y, z = $pVar->p_z, r = $pVar->p_r, s = $pVar->p_s, hr = $pVar->p_hr WHERE id = $o->petIID") or die($conn->error);
    }

    //update the player and Pal (inventory item) by setting player.active_hab and inventory.hid + values
    $conn->query("UPDATE player SET active_hab = $hid WHERE id = $o->pid") or die($conn->error);


    $_SESSION["active_hab"] = $hid;

    echo 'success';

  break;
  case 'fetch_storage':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $data = [];

    $habsr = $conn->query("SELECT id, name, src FROM habitat WHERE pid = $o->pid AND active = 0") or die($conn->error);
    if ($habsr->num_rows > 0) {
      while($hab = $habsr->fetch_object()) {
        // $itemc = $conn->query("SELECT count(*) AS count FROM inventory WHERE hid = $hab->id AND active = 1") or die($conn->error);
        // $data[] = ["id"=>$hab->id, "name"=>$hab->name, "src"=>$hab->src, "itemCount"=>$itemc->fetch_object()->count];
        $data[] = ["id"=>$hab->id, "name"=>$hab->name, "src"=>$hab->src];
      }
    }
    echo json_encode($data);
  break;
  case 'delete_hab':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $hid = $o->hid;
    //get the ids and item_ids from the inventory thingy
    // $hitemIDS = $conn->query("SELECT id, item_id FROM inventory WHERE hid = $hid") or die($conn->error);
    $hitemIDS = $conn->query("SELECT inventory.id, inventory.item_id, item.type
                              FROM inventory
                              INNER JOIN item
                              ON inventory.item_id = item.id
                              WHERE inventory.hid = $hid")
                              or die($conn->error);

    $ids = [];
    $itemIds = [];
    while($i = $hitemIDS->fetch_object()) {
      if($i->type == 'pet') continue;
      $ids[] = $i->id;
      $itemIds[] = $i->item_id;
    }

    $ibResolve = [];
    for ($x = 0; $x < count($itemIds); $x++) {
      if(isset($ibResolve[$itemIds[$x]])) {
        $ibResolve[$itemIds[$x]]++;
      } else {
        $ibResolve[$itemIds[$x]] = 1;
      }
    }
    foreach($ibResolve as $k=>$v) {
      $conn->query("UPDATE inventory_bank SET active=active-$v, in_storage=in_storage+$v WHERE pid = $o->pid AND item_id = $k") or die($conn->error);
    }


    // $conn->query("UPDATE inventory SET active=0, x=0, y=0, z=0, r=0, s=1.0, hr=0, hid=0, m=0 WHERE hid = $hid") or die($conn->error);
    $conn->query("DELETE FROM habitat WHERE id = $hid") or die($conn->error);
    $conn->query("DELETE FROM inventory WHERE id IN(".implode(',', $ids).")") or die($conn->error);

    echo 'success';
  break;


  case 'mod_pal':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    //petID:petOb.id, invID:petOb.inv_id, newItemID:transmogID, name:name, delete:itemToDelete.invID
    $conn->query("UPDATE pet SET item_id = $o->newItemID, name = '$o->name' WHERE id = $o->petID") or die($conn->error);
    $conn->query("UPDATE inventory SET item_id = $o->newItemID WHERE id = $o->invID") or die($conn->error);
    // $conn->query("DELETE FROM inventory WHERE id = $o->delete") or die($conn->error);

    $conn->query("UPDATE inventory_bank SET in_storage=in_storage-1 WHERE pid = $o->pid AND item_id = $o->delete") or die($conn->error);

    $pr = $conn->query("SELECT src, palette FROM item WHERE id = $o->newItemID") or die($conn->error);
    $p = $pr->fetch_object();
    $return = (object) ["name"=>$o->name, "invID"=>$o->invID, "src"=>$p->src, "palette"=>$p->palette, "itemID"=>$o->newItemID];
    echo json_encode($return);
  break;



  case "get_monthly_vars":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    //pid, mid
    $conn->query("INSERT INTO inventory_bank(pid, item_id, in_storage, most_recent)
                  VALUES ($o->pid, $o->mid, 1, $snow)
                  ON DUPLICATE KEY UPDATE in_storage=in_storage+1, most_recent=$snow")
                  or die($conn->error);

    $ts = $conn->query("SELECT id FROM trophy WHERE src = '$o->msrc'") or die(__LINE__." -> ".$conn->error);
    $tid = $ts->fetch_object()->id;

    echo "success:$tid";

  break;




  case "set_session_var":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $_SESSION[$o->key] = $o->val;
  break;
  default:  //this shouldn't happen...
    $touchDB = false;
    echo $_SERVER['REQUEST_METHOD'];
    print_r($_POST);

  break;


  case 'update_layers':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $sql = "INSERT INTO inventory (id, z, pid, item_id) VALUES ";

    $values = [];
    $lcount = count($o->layers);
    for ($i=0; $i<$lcount; $i++) {
      $values[] = "(".$o->layers[$i]->id.", ".$o->layers[$i]->z.", ".$o->layers[$i]->pid.", ".$o->layers[$i]->item_id.")";
    }
    $sql .= implode(',',$values);

    $sql .= " ON DUPLICATE KEY UPDATE z=VALUES(z)";  //this took WAY too long to figure out...
    $conn->query($sql) or die("layering failed to save:".$conn->error);
    echo 'success';
  break;



  case 'delete_player':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $sql = "DELETE FROM message WHERE pid = $o->pid OR rid = $o->pid";          $conn->query($sql) or die($conn->error);
    $sql = "DELETE FROM friends WHERE pid = $o->pid OR fid = $o->pid";          $conn->query($sql) or die($conn->error);
    $sql = "DELETE FROM habitat WHERE pid = $o->pid";                           $conn->query($sql) or die($conn->error);
    $sql = "DELETE FROM pet WHERE pid = $o->pid";                               $conn->query($sql) or die($conn->error);
    $sql = "DELETE FROM inventory WHERE pid = $o->pid";                         $conn->query($sql) or die($conn->error);
    $sql = "DELETE FROM inventory_bank WHERE pid = $o->pid";                    $conn->query($sql) or die($conn->error);
    $sql = "DELETE FROM player WHERE id = $o->pid";                             $conn->query($sql) or die($conn->error);

    echo 'success|'.$o->pid;
  break;



  // case 'sync_friends':
  //   $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
  //   $p = $conn->query("SELECT id, friends, played_with FROM player") or die($conn->error);
  //   while($player = $p->fetch_object()) {
  //     $pid = $player->id;
  //     $fboom = explode(",", $player->friends);
  //     $pwboom = explode(",", $player->played_with);
  //     $finsert = [];
  //     $pwinsert = [];
  //
  //     if ($fboom[0] != '') {
  //       $finsertsql = "INSERT INTO friends (pid, fid, type) VALUES ";
  //       $bcount = count($fboom);
  //       for ($i=0; $i<$bcount; $i++) { $finsert[] = "($pid, $fboom[$i], 'friend')"; }
  //       $odku = " ON DUPLICATE KEY UPDATE pid=VALUES(pid)";
  //       $sql = $finsertsql.implode(',',$finsert).$odku;
  //       // echo "\n$sql\n";
  //       $conn->query($sql) or die("FAILED INSERT: ".$conn->error);
  //     }
  //
  //     if ($pwboom[0] != '') {
  //       $pwinsertsql = "INSERT INTO friends(pid, fid, type, played_with_friend) VALUES ";
  //       $pcount = count($pwboom);
  //       for ($j=0; $j<$pcount; $j++) {
  //         $bm = explode('||',$pwboom[$j]);
  //         $fid = $bm[0];
  //         $pdate = $bm[1];
  //         $pwinsert[] = "($pid, $fid, 'neighbour', '$pdate')";
  //       }
  //       $pwinsertsql .= implode(',', $pwinsert);
  //       $pwinsertsql .= " ON DUPLICATE KEY UPDATE played_with_friend=VALUES(played_with_friend)";
  //       $conn->query($pwinsertsql) or die("FAILED ODKU: ".$conn->error);
  //     }
  //   }
  //   echo 'success';
  // break;


  case "fetch_effect":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $effectParams = [];
    $effectParams['target'] = $o->target;
    $er = $conn->query("SELECT * FROM effect WHERE id = $o->effectID") or die($conn->error);
    $e = $er->fetch_assoc();
    foreach($e as $k => $v) {
      $effectParams[$k] = $v;
    }
    echo json_encode((object) $effectParams);
  break;

  case "get_quote":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $q = $conn->query("SELECT quote FROM player WHERE id = $o->pid") or die($conn->error);
    $e = $q->fetch_assoc()["quote"];
    $r = new stdClass();
    $r->quote = nl2br($e);
    echo json_encode($r);
  break;
  case "set_quote":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $q = $conn->query("UPDATE player SET quote = '".addslashes($o->quote)."' WHERE id = $o->pid") or die($conn->error);

    echo 'success';
  break;


  case "delete_item":  //admin delete
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    // $ir = $conn->query("SELECT * FROM item WHERE id = $o->id") or die($conn->error);
    // $item = $ir->fetch_object();
    // $src = $item->src;
    // $id = $o->id;
    //remove all inventory items
    $conn->query("DELETE FROM inventory WHERE item_id = $o->id") or die($conn->error);
    $conn->query("DELETE FROM item WHERE id = $o->id") or die($conn->error);
    if (!unlink($src)) {
      echo "ERROR: could not unlink file.  Database records successfully deleted.";
    } else {
      echo "success";
    }
  break;


  case "admin_get_trophies":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $tq = $conn->query("SELECT * FROM trophy ORDER BY name ASC") or die($conn->error);
    $trophies = [];
    while($t = $tq->fetch_object()) {
      $trophies[] = $t;
    }
    echo json_encode($trophies);
  break;



  //////////////////////////////////////////////////////////////////////////////STUFF
  case "get_anniversary_trophy":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $iq = $conn->query("SELECT id FROM trophy WHERE name LIKE '$o->age Year%'") or die($conn->error);
    $r = new stdClass();
    if ($iq->num_rows == 1) {
      $r->id = $iq->fetch_object()->id;
    } else {
      $r->id = "Invalid result set";
    }
    echo json_encode($r);
  break;


  case 'insert_error':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    //pid:playerID, date:"NOW", type:type, page:page, msg:msg, internal_message:note
    $msg = serialize($o->msg);
    $conn->query("INSERT INTO error (pid, `date`, type, page, msg, internal_message)
                  VALUES ($o->pid, '$timestamp', '$o->type', '$o->page', '$msg', '$o->internal_message')") or die($conn->error);
    echo 'success';
  break;

  case 'log_serial':
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $s = serialize($o->s);
    $conn->query("INSERT INTO s_log (data) VALUES ('$s')") or die($conn->error);
    echo 'success';
  break;


  default:
    echo "Query Fault::Invalid queryType: $queryType";
  break;
}


if($touchDB) {
  $result = $conn->query($sql) or die($sql."\n".$conn->error);
  if ($responseFlag) {
    echo "success";
  } else { //looking for a full return
    // echo $sql;
    if (isset($result->num_rows)) {
      if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            if ($md5 != "") {
              $hash = md5( strtolower( trim( $row[$md5] ) ) );
              $row['md5'] = $hash;
            }


            if (isset($row["wid"])) {
              if ($row["wid"] > 0) {
                $wr = $conn->query("SELECT * FROM widget WHERE id = ".$row["wid"]) or die($conn->error);
                $w = $wr->fetch_object();
                if (isset($w->data)) {
                  $w->data = preg_replace('!s:(\d+):"(.*?)";!e', "'s:'.strlen('$2').':\"$2\";'", $w->data);
                  $w->data = unserialize($w->data);
                  $row['widgetData'] = $w;
                }
              }
            }


            $data[] = $row;
        }
      }
      if ($calcRows) {
        $rcr = $conn->query("SELECT FOUND_ROWS() AS rowcount") or die($conn->error);
        $rc = $rcr->fetch_object()->rowcount;
        array_unshift($data, ['rowcount' => $rc]);
      }

      // echo json_encode($outp);
      echo json_encode($data);
    } else {
      echo 'success';
    }
  }
  $conn->close();
} else {
  if (!$override) echo $sql;
  @$conn->close();
}

function buildErrorObject($type, $message) {
  $ob = (object) [
    "status" => "error",
    "message" => $message
  ];
  return $ob;
}
?>
