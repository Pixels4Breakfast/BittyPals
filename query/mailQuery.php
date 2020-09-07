<?php
require_once "queryBase.php";

if ($queryType == "send_message") {
  // echo $_POST['p'];
  $o = json_decode($_POST["p"], false);
  $touchDB = false;  $override = true;
  $message = addslashes($o->message);
  $subject = addslashes($o->subject);
  if ($o->cid == 0) {
    $conn->query("INSERT INTO conversation (title) VALUES('$subject')") or die($conn->error);  //this is redundant as of 2018
    $cid = $conn->insert_id;
  } else {
    $cid = $o->cid;
    // $conn->query("UPDATE conversation SET deleted_by = NULL WHERE id = $cid") or die($conn->error);
  }
  //reactivate full conversation for recipient
  $conn->query("UPDATE inbox SET deleted = 0 WHERE cid = $cid") or die($conn->error);
  // $msql = "INSERT INTO message (cid, pid, rid, subject, msg, `date`) VALUES ($cid, $o->pid, $o->rid,'$subject', '$message', '$timestamp')";
  $isql = "INSERT INTO inbox (cid, pid, rid, subject, message, `date`) VALUES ($cid, $o->pid, $o->rid,'$subject', '$message', '$timestamp')";
  $osql = "INSERT INTO outbox (cid, pid, rid, subject, message, `date`) VALUES ($cid, $o->pid, $o->rid,'$subject', '$message', '$timestamp')";
  $conn->query($isql) or die("Failed to insert message into inbox: \n\t$isql\n\t".$conn->error);
  $conn->query($osql) or die("Failed to insert message into outbox: \n\t$osql\n\t".$conn->error);

  echo "success";
}

else if ($queryType == 'get_inbox') {
  $o = json_decode($_POST["p"], false);
  $touchDB = false;  $override = true;

  $bres = $conn->query("SELECT id, cid, `date` FROM inbox WHERE rid = $o->pid AND deleted = 0 ORDER BY `date` DESC") or die($conn->error) or die("Failed to retrive inbox: ".$conn->error);
  $messageIDs = [];
  $usedCIDs = [];
  while ($msg = $bres->fetch_object()) {
    if (array_search($msg->cid, $usedCIDs) === false) {
      $usedCIDs[] = $msg->cid;
      $messageIDs[] = $msg->id;
    } else { continue; }
  }

  $data = [];
  if (count($messageIDs) > 0) {
    $mres = $conn->query("SELECT * FROM inbox WHERE id IN (".implode(",", $messageIDs).") ORDER BY `date` DESC") or die($mres.": ".$conn->error);
    while($m = $mres->fetch_object()) {
      $from = $conn->query("SELECT username, avatar FROM player WHERE id = $m->pid") or die($conn->error);
      $foo = $from->fetch_object();
      if (isset($foo->username)) {
        $m->from = $foo->username;
        $m->avatar = $foo->avatar;
      } else {
        $m->from = "Bitty-Pals";
        $m->avatar = '';
      }
      $data[] = $m;
    }
  }

  echo json_encode($data);
}

else if ($queryType == 'get_outbox') {
  $o = json_decode($_POST["p"], false);
  $touchDB = false;  $override = true;

  $bres = $conn->query("SELECT id, cid, `date` FROM outbox WHERE pid = $o->pid AND deleted = 0 ORDER BY `date` DESC") or die($conn->error) or die("Failed to retrive outbox: ".$conn->error);
  $messageIDs = [];
  $usedCIDs = [];
  while ($msg = $bres->fetch_object()) {
    if (array_search($msg->cid, $usedCIDs) === false) {
      $usedCIDs[] = $msg->cid;
      $messageIDs[] = $msg->id;
    } else { continue; }
  }

  $data = [];
  if (count($messageIDs) > 0) {
    $mres = $conn->query("SELECT * FROM outbox WHERE id IN (".implode(",", $messageIDs).") ORDER BY `date` DESC") or die($mres.": ".$conn->error);
    while($m = $mres->fetch_object()) {
      $from = $conn->query("SELECT username, avatar FROM player WHERE id = $m->pid") or die($conn->error);
      $foo = $from->fetch_object();
      $m->from = $foo->username;
      $m->avatar = $foo->avatar;
      $data[] = $m;
    }
  }

  echo json_encode($data);
}

else if ($queryType == 'get_trashed_messages') {
  $o = json_decode($_POST["p"], false);
  $touchDB = false;  $override = true;
}

else if ($queryType == 'get_message_count') {
  $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
  $sql = "SELECT
    (SELECT count(*) FROM inbox WHERE rid = $o->pid AND cid = $o->cid AND deleted = 0) AS icount,
    (SELECT count(*) FROM outbox WHERE pid = $o->pid AND cid = $o->cid AND deleted = 0) AS ocount";
  $cres = $conn->query($sql) or die($conn->error);
  $co = $cres->fetch_object();
  $total = $co->icount + $co->ocount;
  echo $total;
}

else if ($queryType == 'get_conversation') {
  $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
  $conn->query("UPDATE inbox SET isread = 1 WHERE cid = $o->cid AND rid = $o->pid") or die($conn->error);
  $sql = "SELECT pid, rid, `date`, subject, message FROM inbox WHERE rid = $o->pid AND cid = $o->cid
          UNION ALL
          SELECT pid, rid, `date`, subject, message FROM outbox WHERE pid = $o->pid AND cid = $o->cid
          ORDER BY `date` DESC";
  $res = $conn->query($sql) or die($conn->error);
  $messages = [];
  $data = [];
  while ($m = $res->fetch_object()) $messages[] = $m;

  $otherID = ($messages[0]->pid == $o->pid) ? $messages[0]->rid : $messages[0]->pid;
  $pavRes = $conn->query("SELECT avatar FROM player WHERE id = $o->pid") or die($conn->error);
  $playerAvatar = $pavRes->fetch_object()->avatar;
  $oavRes = $conn->query("SELECT avatar, username FROM player WHERE id = $otherID") or die($conn->error);
  $other = $oavRes->fetch_object();
  $data['otherID'] = $otherID;
  $data['playerAvatar'] = $playerAvatar;
  if (isset($other->username)) {
    $data['otherAvatar'] = $other->avatar;
    $data['otherUsername'] = $other->username;
  } else {
    $data['otherAvatar'] = '';
    $data['otherUsername'] = "Bitty-Pals";
  }
  $data['messages'] = $messages;

  echo json_encode((Object) $data);
}

else if ($queryType == 'delete_conversation') {
  $wherefield = ($o->frombox == 'inbox') ? 'rid' : 'pid';
  $sql = "UPDATE $o->frombox SET deleted = 1 WHERE $wherefield = $o->pid AND cid = $o->cid";
  $conn->query($sql) or die($conn->error);
  echo 'success';
}

else if ($queryType == 'delete_message') {
  $sql = "UPDATE inbox SET deleted = 1 WHERE id = $o->mid";
  $conn->query($sql) or die($conn->error);
  echo 'success';
}

else if ($queryType == 'check_new_mail') {
  $r = $conn->query("SELECT rid, count(*) AS count FROM inbox WHERE rid = $o->pid AND isread = 0 AND deleted = 0") or die($conn->error);
  $c = $r->fetch_object()->count;
  echo "$o->pid, $c";
}

else if ($queryType == 'set_is_read') {
  $r = $conn->query("UPDATE inbox SET isread = 1 WHERE rid = $o->rid AND cid = $o->cid") or die($conn->error);
  echo "success";
}

else {
  echo "Invalid queryType: $queryType";
}

@$conn->close();
?>
