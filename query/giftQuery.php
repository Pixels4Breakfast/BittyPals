<?php
require_once "queryBase.php";

if ($queryType == 'send_system_gift') {
  $msg = addslashes($o->message);

  $giftsql = "INSERT INTO gift (sid, rid, silver, gold, type, message, sender";
  $gcount = count($o->gifts);
  if ($gcount > 0) {
    $giftsql .=  ", item_list) VALUES (0, $o->rid, $o->silver, $o->gold, '$o->type', '$msg', '$o->sender', '";
    $gList = [];
    for ($i=0; $i<$gcount; $i++) {
      if (isset($o->gifts[$i]->itemID)) {
        $gList[] = $o->gifts[$i]->itemID;
      } else {
        $gList[] = $o->gifts[$i];
      }
    }
    $giftsql .= implode(",",$gList)."')";
  } else {
    $giftsql .= ") VALUES (0, $o->rid, $o->silver, $o->gold, '$o->type', '$msg', '$o->sender')";
  }
  $conn->query($giftsql) or die($conn->error);

  echo $conn->insert_id;
}

else if ($queryType == 'send_system_mass_gift') {
  $players = $o->players; //set criteria



  $msg = addslashes($o->message);

  $giftsql = "INSERT INTO gift ";
  $gcount = count($o->gifts);
  if ($gcount > 0) {
    // $giftsql .=  "(sid, rid, silver, gold, type, message, sender, item_list) VALUES (0, $o->rid, $o->silver, $o->gold, '$o->type', '$msg', '$o->sender', '";
    $giftsql .=  "(sid, rid, silver, gold, type, message, sender, item_list) SELECT 0, id, $o->silver, $o->gold, '$o->type', '$msg', '$o->sender', '";
    $gList = [];
    for ($i=0; $i<$gcount; $i++) {
      if (isset($o->gifts[$i]->itemID)) {
        $gList[] = $o->gifts[$i]->itemID;
      } else {
        $gList[] = $o->gifts[$i];
      }
    }
    $giftsql .= implode(",",$gList)."' FROM player WHERE id > 1";
  } else {
    // $giftsql .= ") VALUES (0, $o->rid, $o->silver, $o->gold, '$o->type', '$msg', '$o->sender')";
    $giftsql .= "(sid, rid, silver, gold, type, message, sender) SELECT 0, id, $o->silver, $o->gold, '$o->type', '$msg', '$o->sender' FROM player WHERE id > 1";
  }
  $conn->query($giftsql) or die($conn->error);

  echo 1;
}

else if ($queryType == 'gift_from_ob') {
  //TODO:what was this supposed to be?

}

else if ($queryType == 'send_gift') {
  //validation/anti-exploit...because people suck :`(
  $itemList = [];
  if (count($o->gifts) > 0) {
    foreach($o->gifts as $k=>$v) {
      if (isset($itemList[$v])) {
        $itemList[$v]++;
      } else {
        $itemList[$v] = 1;
      }
    }

    //need to make sure that the sender currently has enough of all of the items to actually send the gift.  Otherwise, they're an asshole.

    foreach($itemList as $key=>$val) {
      $vres = $conn->query("SELECT in_storage FROM inventory_bank WHERE pid = $o->pid AND item_id = $key") or die($conn->error);
      if ($vres->fetch_assoc()['in_storage'] < $val) {
        die("You do not have enough items to send this gift.  Please make sure you have not already sent these items in another tab");
      }
    }
  }


  $msg = addslashes($o->message);
  if (count($o->gifts) > 0) {
    $gl = implode(",", $o->gifts);
    $sql = "INSERT INTO gift (sid, rid, silver, gold, message, sender, item_list)
            VALUES ($o->pid, $o->rid, $o->silver, $o->gold, '$msg', '$o->sender', '$gl')";
    $conn->query($sql) or die($conn->error);

    //build the deletion query

    foreach($itemList as $key=>$val) {
      $conn->query("UPDATE inventory_bank SET in_storage = in_storage-$val WHERE item_id = $key AND pid = $o->pid") or die($conn->error);
      $sres = scrubInventoryBank($o->pid, $key);
      if ($sres != 'success') {
        echo "FAIL:Failed to scrub bank on item $key\n\t\t$sres\n\n";
      }
    }
  } else {
    // $giftsql .= ") VALUES ($o->pid, $o->rid, $o->silver, $o->gold, '$msg', '$o->sender')";
    $sql = "INSERT INTO gift (sid, rid, silver, gold, message, sender)
            VALUES ($o->pid, $o->rid, $o->silver, $o->gold, '$msg', '$o->sender')";
    $conn->query($sql) or die($conn->error);
  }
  echo 'success';
}

else if ($queryType == 'get_gifts') {
  $rsql = "SELECT * FROM gift WHERE rid = $o->pid AND gotten = 0";
  $r = $conn->query($rsql) or die("Failed on get_gifts::select-> ".$conn->error);
  $data = [];
  $debug = $rsql;
  $itemLookup = [];
  while($gift = $r->fetch_object()) {
    if ($gift->sender == "") {
      $snsql = "SELECT username FROM player WHERE id = $gift->sid";
      $sn = $conn->query($snsql) or die("Failed on r->fetch_ob ($snsql): ".$conn->error);
      $gift->sender = $sn->fetch_object()->username;
    }
    $giftob = (object) ['id'=>$gift->id, 'type'=>"$gift->type", 'sid'=>$gift->sid, 'sender'=>"$gift->sender", 'gold'=>$gift->gold, 'silver'=>$gift->silver, 'message'=>stripslashes($gift->message)];
    $list = explode(',', $gift->item_list);
    $ilist = [];
    if ($list[0] == "") {
      $giftob->list = [];
    } else {
      $irsql = "SELECT id, src, is_sprite, frame_height, frame_width, frame_count, name FROM item WHERE id IN ($gift->item_list)";
      $irr = $conn->query($irsql) or die("Failed on get_gifts::select2-> ".$conn->error."\nList count:".count($list)."\n".$irsql);
      while($g = $irr->fetch_object()) {
        $itemLookup[$g->id] = $g;
      }
      $lcount = count($list);
      for ($i=0; $i<$lcount; $i++) {
        $ilist[] = $itemLookup[$list[$i]];
      }
      $giftob->list = $ilist;
    }
    $data[] = $giftob;
  }
  // $return = (object) ['data'=>$data, 'debug'=>$debug];
  echo json_encode($data);
}

else if ($queryType == 'accept_gift') {
  $conn->query("UPDATE gift SET gotten = 1 WHERE id = $o->giftID") or die($conn->error);

  if ($o->items != '') {
    $ilist = explode(',', $o->items);
    $itemList = [];
    foreach($ilist as $k=>$v) {
      if (isset($itemList[$v])) {
        $itemList[$v]++;
      } else {
        $itemList[$v] = 1;
      }
    }
    foreach($itemList as $key=>$val) {
      $conn->query("INSERT INTO inventory_bank (pid, item_id, in_storage, most_recent)
                    VALUES ($o->pid, $key, $val, $snow)
                    ON DUPLICATE KEY UPDATE in_storage = in_storage+$val, most_recent=$snow")
                    or die($conn->error);
    }
    echo 'success';
  } else {
    echo 'success';
  }
}

else {
  echo "giftQuery::Invalid queryType: $queryType";
}
@$conn->close();
?>
