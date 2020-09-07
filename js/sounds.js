////////////////////////////////////////////////////////////////////////////////SOUNDS
function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        if (mute == 1) return;
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
    this.autoplay = function() {
      this.sound.setAttribute("autoplay", 'autoplay');
    }
    this.loop = function() {
      this.sound.setAttribute("loop", true);
      //hax for smooth(ish) looping
      this.sound.addEventListener('timeupdate', function(){
                  var buffer = .16
                  if(this.currentTime > this.duration - buffer){
                      this.currentTime = 0
                      this.play()
                  }}, false);
    }
}

function toggleSound() {
  mute = (mute == 0) ? 1:0;
    setSessionVar("mute", mute);
    var src = (mute == 0) ? "soundOn" : "soundOff";
    $("#soundIcon").attr("src", "assets/site/"+src+".png");
    paramQuery({update:"player", id:playerID, values:{mute:mute}}, verifySoundToggle);
}
function verifySoundToggle(r) {
  console.log("soundToggle", r);
}

//here should be the basic game sounds that every page should support.
var sounds = {};
function loadSounds() {
  var src = (mute == 0) ? "soundOn" : "soundOff";
  $("#soundIcon").attr("src", "assets/site/"+src+".png");

  sounds.coin = new Sound("assets/sound/coins.mp3");
  sounds.negcoin = new Sound("assets/sound/negcoin.mp3");
  sounds.lotsocoins = new Sound("assets/sound/lotsocoins.mp3");
  sounds.singleclick = new Sound("assets/sound/singleclick.mp3");
  sounds.jackpot = new Sound("assets/sound/jackpot.mp3");
  sounds.addItem = new Sound("assets/sound/addItem.mp3");
  sounds.removeItem = new Sound("assets/sound/removeItem.mp3");
}
