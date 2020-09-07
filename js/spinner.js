var CHECKFREESPIN = 'check_free_spin';
var autoOpenSpinner = false;
var spinnerInitialized = false;
var spinner;

function spinnerQuery(ob, cb, str) { paramQuery(ob, cb, str, 'spinnerQuery'); }

function initSpinner(auto) {
  autoOpenSpinner = (auto != undefined && auto == true) ? true : false;
  startTick();
  var spinnerContainer = $("<div/>", {id:"spinnerContainer"});
  // if (autoOpenSpinner) {
  //   spinnerContainer.append('<h1 id="spinnerTitle">You have a free spin!<br />&#9660;</h1>');
  // } else {
  //   spinnerContainer.append('<h1 id="spinnerTitle">Chance Wheel</h1>');
  // }


  var oBack = $("<div/>", { id:"spinner_backer", class:"centerH" });
  var oFront = $("<div/>", { id:"spinner_front", class:"centerH" });
  spinnerContainer.append(oBack, oFront);


  var spinnerBox = $("<div/>", {id:"spinnerBox", style:"pointer-events:none;"});
  spinnerContainer.append(spinnerBox);
  spinner = new Spinner(spinnerBox);
  var buttons = $("<div/>", {class:"scButtons"});
  buttons.append($("<button/>", {id:"spinButton", onclick:"spinSpinner()", style:"z-index:10000;"}).html("Spin!"));
  if (autoOpenSpinner) $("#spinButton").html("Free Spin!");
  buttons.append($("<button/>", {onclick:"hideSpinner()", style:"z-index:10000;"}).html("CLOSE"));
  spinnerContainer.append(buttons);

  $('body').append(spinnerContainer);
  if (!autoOpenSpinner) spinnerContainer.hide();
  spinnerQuery({}, loadPrizes, 'get_spinner_prizes');
}

function showSpinner() {
  if (!spinnerInitialized) {
    initSpinner(true);
  } else {
    $("#spinnerContainer").show();
    // if (freeSpin == 0) $("#spinnerTitle").html('Chance Wheel');
    $("#spinButton").html((freeSpin == 0) ? "SPIN!" : "FREE SPIN!");
    $("#utilityPane").addClass("mask");
    $("#utilityPane").addClass("darker");
    $("#spinnerContainer").animate({
      top: "0px"
    }, 500, function() {
      // Animation complete.
    });
  }
}
function hideSpinner() {
  $("#spinnerContainer").animate({
    top: "-800px"
  }, 500, function() {
    $("#spinnerContainer").hide();
    $("#utilityPane").removeClass("mask");
    $("#utilityPane").removeClass("darker");
    checkTrophyNotification();
  });


}

function loadPrizes(r) {
  spinnerInitialized = true;
  spinner.background = r.background;
  spinner.generateSlices(r.prizes);
}

function Spinner(el) {
  var o = {
    _el:el, //jQuery friendly HTML element
    _sc:0, //slice count
    _deg:0, //degrees when calculating tick rotation
    _arc:0, //arc range for each slice
    _sp:0, //staying power.  Higher number means the force takes longer to degrade.
    _spCount:0,  //degradation monitor
    _force:0,
    _free:false,
    _prizes:null,
    _ranges:[],
    _fps:200,
    _tCount:0,

    get el() { return this._el; },
    get arc() { return this._arc },
    get prizes() { return this._prizes },
    set background(src) { this._el.css('background-image', "url('"+src+"')"); },
    set free(v) { this._free = v; },

    generateSlices: function (c) {
      // console.log(c);
      this._prizes = c;
      this._sc = c.length;
      this._arc = 360/c.length;
      for (var i=0; i<c.length; i++) {
        var slice = $("<div/>",{class:"slice", id:"s"+i});
        var content = $("<div/>", {title:this._prizes[i].description}).html(this._prizes[i].title);

        var prize = this._prizes[i];
        if (prize.img != undefined) {
          if (prize.prize.data == undefined || prize.prize.data.is_sprite == 0) {
            content.append($("<img/>",{src:prize.img, style:"max-height:60px;max-width:60px"}));
          } else {
            var imgCon = $("<div/>", { style:"position:relative; top:20px;" });
            var image = new Sprite({id:prize.id, framecount:prize.prize.data.frame_count, src:prize.img, width:prize.prize.data.frame_width, height:prize.prize.data.frame_height});
            if (image.init()) {
              image.setClass("centerHV");
              image.appendTo(imgCon);
              image.max(60, 60);
              image.start();
            }
            content.append(imgCon);
          }
        }






        var tran = 'rotate(-90deg) translateX(-55%)';
        if (this._prizes[i].title == "") tran = "translateY(15px)";
          content.css('-moz-transform', tran);
          content.css('-webkit-transform', tran);
          content.css('-o-transform', tran);
          content.css('-ms-transform', tran);
        slice.append(content);
        var degree = this._arc*i;
        this._ranges.push({min:Number(degree - this._arc/2), max:Number(degree + this._arc/2)});
        // console.log(degree);
        slice.css('-moz-transform', 'rotate(' + degree + 'deg)');
        slice.css('-moz-transform-origin', '50% 100%');
        slice.css('-webkit-transform', 'rotate(' + degree + 'deg)');
        slice.css('-webkit-transform-origin', '50% 100%');
        slice.css('-o-transform', 'rotate(' + degree + 'deg)');
        slice.css('-o-transform-origin', '50% 100%');
        slice.css('-ms-transform', 'rotate(' + degree + 'deg)');
        slice.css('-ms-transform-origin', '50% 100%');
        this._el.append(slice);
      }
      this._ranges.reverse();  //reciprocate
      this._ranges.unshift({min:0, max:0});
      if (autoOpenSpinner) showSpinner();
    },

    tick: function () {
      if (this._tCount < 1000/this._fps) {
        this._tCount++;
        return;
      } else { this._tCount = 0; }
      if (this._force == 0) {
        this.stop();
      }
      this._deg = this._deg + this._force;
      this._spCount++;
      if (this._spCount == this._sp) {  //degrade force after hitting staying power
        this._spCount = 0;
        this._force--;
      }
      if (this._deg >= 360) while(this._deg > 360) this._deg = this._deg - 360;
      //console.log("Spinner::tick");
      this._el.css('-moz-transform', 'rotate(' + this._deg + 'deg)');
      this._el.css('-webkit-transform', 'rotate(' + this._deg + 'deg)');
      this._el.css('-o-transform', 'rotate(' + this._deg + 'deg)');
      this._el.css('-ms-transform', 'rotate(' + this._deg + 'deg)');
      sounds.singleclick.play();
    },
    start: function () {
      deactivateSpinButton();
      this._sp = Math.floor((Math.random() * 6) + 3);
      this._spCount = 0;
      this._force = Math.floor((Math.random() * 10) + 15);
      // console.log("starting force:" + o._force + ", staying power:" + o._sp);
      ticklist.push(this);
    },
    stop: function () {
      //remove from ticklist
      for (var t=0; t<ticklist.length; t++)  if (ticklist[t] == this) ticklist.splice(t, 1);
      //get the prize index
      var r = this._ranges;
      var prize;
      for (var i=0; i<r.length; i++) {
        if (this._deg >= r[i].min && this._deg <= r[i].max) {
          prize = this._prizes[i];
        }
      }
      if (prize == undefined) prize = this._prizes[0]; //jackpot
      activateSpinButton();
      spinnerPrize(prize);
    }

  }
  return o;
}

function spinnerPrize(o) {
  switch(o.prize.type) {
    case "gold":
      givePlayerMoney(playerID, {gold:o.prize.value});
      swal({
        title:"You won " + o.prize.value + o.description +"!",
        closeOnConfirm:true,
        confirmButtonText:"Sweet! Thanks!",
        imageUrl:"assets/site/coin-gold.png"
      });
    break;
    case "silver":
      givePlayerMoney(playerID, {silver:o.prize.value});
      swal({
        title:"You won " + o.prize.value + o.description +"!",
        closeOnConfirm:true,
        confirmButtonText:"Sweet! Thanks!",
        imageUrl:"assets/site/coin-silver.png"
      });
    break;
    case "xp":
      swal({
        title:"You won " + o.prize.value + o.description +"!",
        closeOnConfirm:true,
        confirmButtonText:"Cool! Thanks!"
      }, function() {
        givePlayerXP(playerID, o.prize.value);
      });
    break;
    case "item":
      // paramQuery({insert:'inventory', values:{pid:playerID, item_id:o.prize.value, date_purchased:'NOW'}}, validateItem);
      paramQuery({pid:playerID, item:o.prize.value}, validateItem, 'give_player_item');

      swal({
        title:"You won " + o.description + "!",
        closeOnConfirm:true,
        confirmButtonText:"Awesome!  Thanks!",
        imageUrl:o.img
      });




    break;
    case "jackpot":
      sounds.jackpot.play();
      swal({
        title:'You won the Jackpot!!<br />100 <img src="assets/site/coin-gold.png" /><br />1000 <img src="assets/site/coin-silver.png" /><br />500 XP',
        html:true,
        closeOnConfirm:true,
        confirmButtonText:"Whoa! Thanks!"
        //TODO: create jackpot image
      },function() { //jackpot is hardcoded at the moment...
        givePlayerMoney(playerID, {gold:100});
        givePlayerMoney(playerID, {silver:1000});
        givePlayerXP(playerID, 500);
      });
    break;
    default:
      console.error("spinner prize error: ", o);
    break;
  }
}

function validateItem(r) {
  searchInventory();
}


function deactivateSpinButton() {
  $("#spinButton").attr('disabled', true);
}
function activateSpinButton() {
  $("#spinButton").attr('disabled', false);
}

function spinSpinner() {
  //check for free spin
  if (freeSpin) {
    spinnerQuery({pid:playerID}, confirmFreeSpin, CHECKFREESPIN);
  } else {
    usePaySpin();
  }
}

function confirmFreeSpin(r) {
  // console.log('confirmFreeSpin', r);
  if (r) {
    useFreeSpin();
  } else {
    usePaySpin();
  }
}
function useFreeSpin() {
  var d = new Date(dateToday);  //depracated
  var dString = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();  //depracated
  paramQuery({update:'player', id:playerID, values:{last_free_spin:dateToday}}, validateSave);
  setSessionVar("free_spin", 0);
  freeSpin = !1;
  spinner.start();
}
function usePaySpin() {
  if (getPlayerMoney().gold >= 50) {
    swal({
      title:"You are out of free spins for the day",
      text:"Spinning will cost you 50 Gold Coins.  Do you want to pay for a spin?",
      closeOnCancel:true,
      closeOnConfirm:true,
      showCancelButton:true,
      confirmButtonText:"Yes, please",
      cancelButtonText:"No, thank you"
    }, function (isConfirm) {
      if (isConfirm) {
        givePlayerMoney(playerID, {gold:-50});
        paramQuery({id:playerID}, validateSave, "gold_on_spinner");
        spinner.start();
      }
    });
  } else {
    swal({
      title:"Whoops!",
      text:"You do not have enough Gold Coins to spin the wheel.  \nIt costs 50 Gold Coins, and you only have " + getPlayerMoney().gold,
      closeOnConfirm:true,
      confirmButtonText:"Aw, shucks",
      imageUrl:"assets/site/coin-gold.png"
    })
  }
}
