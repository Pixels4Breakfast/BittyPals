var petid = 0;

function register() {
  console.log('register...');
  var un = $("#r_username").val();
  var pw = $("#r_password").val();
  var em = $("#r_email").val();
  var pn = $("#r_petname").val();

  //check for blank values
  if (un == "" || pw == "" || em == "" || pn == "") {
    //make an error thingy
    showAlert("Your stuff is blank", RED);
  } else {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\ w+)*(\.\w{2,3})+$/.test(em)) {
      paramQuery({username:un, password:pw, email:em, petID:petid, petName:pn, token:tok}, validateRegister, REGISTER);
    } else {
      showAlert("Invalid email format", RED);
    }
  }
}
function validateRegister(response) {
  console.log(response);
  var ret = response.split(":");
  switch (ret[0]) {
    case "success":
      //do something
      window.location = "habitat";
    break;
    case "fail":
      showAlert(ret[1], RED);
    break;
    default: //something went wrong
      showAlert(ret, RED);
    break;
  }

}

function acceptInvite() {
  $("#invitationPane").fadeOut(500, function() { $("#petPane").fadeIn(500);})
}
function pickPet(id, src) {
  petid = id;
  $("#petPic").attr("src", src);
  $("#petPane").fadeOut(500, function() { $("#adoption").fadeIn(500);})
}
function cancel() {
  $("#adoption").fadeOut(500, function() { $("#petPane").fadeIn(500);})
}
function showTAC() {
  console.log("Need to get the Terms and Conditions in here so that we can show it");
}
