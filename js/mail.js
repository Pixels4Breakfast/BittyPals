//MAIL
var DELETECONVO = 'delete_conversation';

function showMessagePrompt(rid, sub) {
  sub = (sub == undefined) ? "" : sub;
  swal({
    title:"Compose Message",
    html:true,
    showCancelButton:true,
    confirmButtonText:"Send",
    cancelButtonText:"Cancel",
    closeOnConfirm:false,
    text:'Subject: <textarea id="messageSubject" style="height:24px; font-size:22px; overflow:hidden; width:100%; resize:none;">'+sub+'</textarea><br /><textarea id="messageContent" style="width:100%; height:200px; overflow-y:scroll; font-size:22px;"></textarea>'
  },
  function(isConfirm) {
  if (isConfirm) {
    //send the message into the database and pop up a confirmation (in callback)
    // console.log($("#messageContent").val(), rid, playerID);
    if ($("#messageContent").val() != "") {
      var sub = ($("#messageSubject").val() == "") ? "No Subject" : $("#messageSubject").val();

      var message = $("#messageContent").val().replace(/\r\n|\r|\n/g,"<br />");
      sub = sanitize(sub);
      message = sanitize(message);
      mailQuery({pid:playerID, rid:rid, cid:0, subject:encodeURIComponent(sub), message:encodeURIComponent(message)}, messageSent, SENDMESSAGE);
    } else {
      swal({title:"No Content", text:"Message not sent", type:"warning", timer:2000});
    }

  } else {
    // console.log("cancel");
    }
  })
}

function messageSent(r) {
  // console.log(r);
  if (r == "success") {
    swal({title:"Message Sent!", type:"success", timer:2000});
  } else {
    console.error(r);
  }
}



var navButtons = ["Inbox", "Sent"/*, "Trash Bin"*/];
var activeMailbox = "inbox";
var isAdminMail = false;
function loadMailWindow(isAdmin) {
  isAdminMail = (isAdmin) ? true : false;
  $("#utilityPane").addClass("mask");
  var m = $("#mailPane");
  m.addClass("mail_pane");
  m.addClass("centerHV");

  var header = $("<div/>",{
    class:"mail_header"
  });
  header.append($("<button />", { //close button
    style:"position:relative; float:right; margin-right:5px; margin-top:5px;",
    class:"close_button_sprite",
    onclick:"closeMailWindow()",
    title:"Close Panda Post"
  }));
  header.append($("<img/>",{src:"assets/site/PandaExpress.gif", style:"position:absolute; left:5px; top:5px; height:90px;"}));
  header.append($("<img/>",{src:"assets/site/PandaExpressText.png", style:"position:relative; top:5px;"}));
  if (isAdmin) header.append("ADMIN");
  m.append(header);
  var nav = $("<div/>", { id:"mailNav" });
  //nav buttons
  for (var i = 0; i < navButtons.length; i++) {
    var n = $("<div/>", {
      id:"nav_" + navButtons[i],
      onclick:"handleNav('"+navButtons[i]+"')",
      title:navButtons[i]
    }).html(navButtons[i]);
    nav.append(n);
  }
  m.append(nav);
  m.append($("<div/>", { id:"mailContent" }));

  handleNav("Inbox", isAdmin);
}

function handleNav(type) {
  for (var i=0; i<navButtons.length; i++) {
    $("#nav_"+navButtons[i]).removeClass("active");
    $("#nav_"+navButtons[i]).attr("onclick", "handleNav('"+navButtons[i]+"')");
  }
  $("#nav_" + type).addClass("active");

  let fetchID = (isAdminMail) ? 0 : playerID;

  switch(type) {
    case "Inbox":
      activeMailbox = "inbox";
      mailQuery({pid:fetchID}, loadMessages, GETINBOX);
    break;
    case "Sent":
      activeMailbox = "outbox";
      mailQuery({pid:fetchID}, loadMessages, GETOUTBOX);
    break;
    case "Trash Bin":
      // activeMailbox = "trashbin";
      //TODO paramQuery({pid:playerID}, loadMessage, GETTRASHBIN);
    break;

    default:
      //do something?
    break;
  }
}

var tempMessages;
function loadMessages(r) {
  console.log("loadMessages", r);
  if ($("#replyBlock") != undefined) $("#replyBlock").remove();
  var mc = $("#mailContent");
  mc.css("bottom", "0px");
  mc.empty();
  mc.removeClass("mc_reply");
  mc.addClass("mc_full");
  if (r.length > 0) {
  tempMessages = r;
  var table = $("<table/>", { id:"mailTable", style:"text-align:left;" });
    mc.append(table);
    for (var i = 0; i < r.length; i++) {
      var m = r[i];//message
      var tr = $("<tr/>");
      if (m.isread == '0') tr.addClass("unread");
      tr.append($("<td/>", {class:"trash_conversation", onclick:"trashConversation('"+m.cid+"')", title:"Move Entire Conversation to Trash"}));
      tr.append($("<td/>", {
          style:"width:200px;",
          class:"ellip",
          title:"From: " + m.from,
          onclick:"loadMessage("+i+")"}).html(m.from));
      tr.append($("<td/>", {class:"ellip", onclick:"loadMessage("+i+")", title:"Subject: "+m.subject}).html(m.subject));
      tr.append('<td style="width:200px; cursor:pointer;">' + m.date + "</td>");
      table.append(tr);
    }
  } else {
    mc.append("<center>You have no messages</center>");
  }
}

function trashConversation(cid) {
  swal({
    title:"Delete Conversation",
    text:"This will delete all messages in this conversation.\nAre you sure you want to do this?\nThis action cannot be undone!",
    type:"warning",
    showCancelButton:true,
    confirmButtonText:"Yep, I'm sure",
    cancelButtonText:"Whoops!  Nope!",
    closeOnCancel:true,
    closeOnConfirm:true
  },
  function (isConfirm) {
    if (isConfirm) {
      //"delete" the conversation
      trashConvoConfirm(cid);
    }
  })
}
function trashConvoConfirm(cid) {
  // console.log("confirm kill", cid);
  let pid = (isAdminMail) ? 0 : playerID;
  mailQuery({pid:pid, cid:cid, frombox:activeMailbox}, cTCC, DELETECONVO);
}
function cTCC(r) {
  if (r == 'success') {
    if (activeMailbox == "inbox") {
      handleNav("Inbox");
    } else if (activeMailbox == "outbox") {
      handleNav("Sent");
    }
  } else { console.error("Conversation failed on delete: ", r); }
}


function closeConversations() {
  console.log("closeConversations");
  tempMessages = undefined;
  let pid = (isAdminMail) ? 0 : playerID;
  mailQuery({pid:pid}, loadMessages, GETINBOX);
  mailQuery({pid:pid}, notifyMail, CHECKMAIL);
}

var conversationID;
function loadMessage(index) {
  var m = tempMessages[index];
  conversationID = m.cid;
  handleNav("none");
  // paramQuery({update:"inbox", id:m.id, values:{isread:1}}, confirmRead);
  let cpid = (isAdminMail) ? 0 : playerID;
  mailQuery({rid:cpid, cid:m.cid}, confirmRead, "set_is_read");

  var mc = $("#mailContent");
  mc.empty();
  mc.removeClass("mc_full");
  mc.addClass("mc_reply");
  appendMessageBlock(m.avatar, m.pid, m.from, m.date, m.subject, m.message, m.cid);

  // mailQuery({pid:playerID, cid:m.cid}, showMessageCount, 'get_message_count');
  mailQuery({pid:m.rid, cid:m.cid}, showMessageCount, 'get_message_count');

  var replyBlock = $("<div/>", {
      id:"replyBlock",
      class:"reply_block"
    });
  replyBlock.append('<textarea id="replyMsg" style="font-size:24px;" placeholder="Reply to conversation"></textarea>');
  replyBlock.append('<button onclick="sendReply('+m.cid+','+m.pid+', \''+m.subject+'\', '+m.rid+')">Reply</button>');
  $("#mailPane").append(replyBlock);
}
function confirmRead(r) {
  if (r != 'success') console.error(r);
}

function appendMessageBlock(avatar, sid, from, date, subject, message, cid) {
  var owned = (sid == playerID) ? true : false;
  var msgBlock = $("<table/>",{
      id:"messageBlock",
      class:"message_block"
    });
  var row = $("<tr/>");
  msgBlock.append(row);
  var infoBlock = $("<td/>", {
      class:"message_info_block"
    });

  infoBlock.append($("<img/>", { src:avatar, style:"height:50px; width:50px; cursor:pointer;", title:"Go to Habitat", onclick:"window.location = 'habitat/"+sid+"'" }));
  if (owned) {
    row.append('<td style="white-space:pre-wrap;"><span title="Date Sent" style="font-size:.8em;">'+date+'</span><br />' + demystify(message) + "</td>");
    infoBlock.append('<br /><span title="You">'+playerUsername+"</span>");
    row.append(infoBlock);
  } else {
    // otherId = m.pid;
    infoBlock.append('<br /><span onclick="window.location=\'habitat/'+sid+'\'" title="Visit Them" style="cursor:pointer;">'+from+'</span>');
    // infoBlock.append('<br /><button onclick="reportMessage('+m.id+')" title="Report Message" style="position:relative; bottom:0px;">Report</button>');
    row.append(infoBlock);
    row.append('<td style="white-space:pre-wrap;"><span title="Date Sent" style="font-size:.8em;">'+date+'</span><br />' + demystify(message) + "</td>");
  }


  $("#mailContent").append(msgBlock);
}

function showMessageCount(r) {
  if (r > 1) {
    var mc = $("#mailContent");
    mc.append($("<div/>", {id:"fullConversation"}));
    mc.append($("<div/>", {
      id:"toggleConvo",
      onclick:"appendConversation("+conversationID+")"
    }).html("&#x25BC; Show full conversation ("+r+" messages)"))

  }
}

function appendConversation(cid) {
  mailQuery({pid:playerID, cid:cid}, displayConversation, 'get_conversation');
}

function displayConversation(r) {
  // console.log(r);
  var mc = $("#mailContent");
  mc.empty();
  for (var i=0; i<r.messages.length; i++) {
    var m = r.messages[i];
    var avatar = (m.pid == playerID) ? r.playerAvatar : r.otherAvatar;
    appendMessageBlock(avatar, m.pid, r.otherUsername, m.date, m.subject, m.message, m.cid);
  }
}


function sendReply(cid, rid, subject, sid) {
  var msg = $("#replyMsg").val();
  var message = msg.replace(/\r\n|\r|\n/g,"<br />");//fix stupidity
  // console.log("sendReply: ", cid, rid, subject, msg);
  subject = sanitize(subject);
  message = sanitize(message);
  if (subject.substring(0,2) != "RE:") substring = "RE: " + subject;

  let pid = (sid != undefined) ? sid : playerID;

  var sendOb = {pid:sid, rid:rid, cid:cid, subject:encodeURIComponent(subject), message:encodeURIComponent(message)};
  // var sendOb = {pid:playerID, rid:rid, cid:cid, subject:subject, message:message};

  mailQuery(sendOb, replySent, SENDMESSAGE);
}
function replySent(r) {
  // console.log(r);
  if (r == "success") {
    swal({title:"Reply Sent!", showConfirmButton:false, customClass:"little_confirm", timer:2000});
    let pid = (isAdminMail) ? 0 : playerID;
    mailQuery({pid:pid}, loadMessages, GETINBOX);
  } else {
    showAlert("Uh oh!  The Panda dropped your message!<br />Try resending it in a few moments.");
    console.error(r);
  }
}

function reportMessage(id) {
  swal({
      title:"Report Message",
      type:"warning",
      html:true,
      confirmButtonText:"Report",
      cancelButtonText:"Cancel",
      confirmButtonColor:"#ff0000",
      closeOnConfirm:false,
      closeOnCancel:true,
      showCancelButton:true,
      text:'Please tell us why you are reporting this message:<br /><textarea id="reportReason" style="height:50px; width:100%; resize:none;"></textarea>'
    },
    function(isConfirm) {
      if (isConfirm) {
        sendReport($("#reportReason").val(), id);
        swal({title:"Message Reported", timer:2000});
      } else {
      //just closing
      }
    })
}

function notifyMail(r) {
  // console.log("New messages: " + r);
  let id = r.split(",")[0];
  let c = r.split(",")[1];
  if (+id > 0) {
    if (c > 0) popNotify("You have " + c + " unread messages");
    $("#mailIcon").html(c);
    $("#mailIcon").attr("title", "You have " + c + " unread messages");
  } else {
    if (c > 0) popNotify("There are " + c + " unread ADMIN messages");
    $("#adminMailIcon").html(c);
    $("#adminMailIcon").attr("title", "There are " + c + " unread ADMIN messages");
  }
}

function sendReport(reason, id) {
  console.log("sendReport", reason, id);
}

function closeMailWindow() {
  $("#mailPane").empty();
  $("#mailPane").removeClass("mail_pane");
  $("#utilityPane").removeClass("mask");
  mailQuery({pid:playerID}, notifyMail, CHECKMAIL);
  if (privileges == 9) {mailQuery({pid:0}, notifyMail, CHECKMAIL)};
}
