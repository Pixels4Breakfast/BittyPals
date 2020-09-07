<?php
require_once "queryBase.php";

if ($queryType == 'f_get_player') {
  $fsql = "SELECT F.fid, F.played_with_friend, F.friend_played_with, F.type, P.username, P.id, P.avatar, P.use_gravatar, P.join_date, P.email
          FROM friends F
          INNER JOIN player P
          ON F.fid = P.id
          WHERE F.pid = $o->pid";
  $f = $conn->query($fsql) or die($conn->error);
  echo json_encode($f->fetch_object());
}

else if ($queryType == 'fetch_new_players') {
  $data = [];
  $nlq = $conn->query("SELECT id, username, avatar, use_gravatar, email FROM player WHERE id != $o->pid ORDER BY id DESC LIMIT 9") or die($conn->error);
  while($p = $nlq->fetch_object()) $data[] = $p;

  for ($i=0; $i<count($data); $i++) {
    //get the correct avatar
    if ($data[$i]->use_gravatar == 1) $data[$i]->avatar = getAvatar(md5($data[$i]->email));

    $fr = $conn->query("SELECT * FROM friends WHERE pid = $o->pid AND fid = ".$data[$i]->id." LIMIT 1") or die($conn->error);
    if ($fr->num_rows == 1) {
      $fd = $fr->fetch_object();

      if ($fd->played_with_friend == "") {
        $fd->timeDif = -1;
        $fd->played = 0;
      } else {
        $fd->timeDif = timeDif($fd->played_with_friend)->h;
        $fd->played = ($fd->timeDif < 12) ? 1 : 0;
      }

      $data[$i]->friendData = $fd;

    }
  }
  echo json_encode($data);
}

else if ($queryType == 'add_friend') {
  $o = json_decode($_POST["p"], false);
  $touchDB = false;  $override = true;

  $conn->query("INSERT INTO friends (pid, fid, type) VALUES ($o->pid, $o->fid, 'friend') ON DUPLICATE KEY UPDATE type=VALUES(type)") or die($conn->error);
  $flr = $conn->query("SELECT * FROM friends WHERE pid = $o->pid AND type != 'none' AND type != 'neighbour' ORDER BY played_with_friend ASC") or die($conn->error);
  $fl = [];
  while($f = $flr->fetch_object()) $fl[] = $f;
  $_SESSION['friends'] = $fl;
  echo 'success';

}

else if ($queryType == 'remove_friend') {
  $o = json_decode($_POST["p"], false);
  $touchDB = false;  $override = true;

  $conn->query("INSERT INTO friends (pid, fid, type) VALUES ($o->pid, $o->fid, 'none') ON DUPLICATE KEY UPDATE type=VALUES(type)") or die($conn->error);
  $flr = $conn->query("SELECT * FROM friends WHERE pid = $o->pid AND type != 'none' AND type != 'neighbour' ORDER BY played_with_friend ASC") or die($conn->error);
  $fl = [];
  while($f = $flr->fetch_object()) $fl[] = $f;
  $_SESSION['friends'] = $fl;
  echo 'success';

}

else {
  echo "friendQuery::Invalid queryType: $queryType";
}




@$conn->close();


?>
