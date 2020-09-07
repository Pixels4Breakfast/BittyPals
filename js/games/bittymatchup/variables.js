var modules = ["Card"];
var styles = ["bittymatchup"];

var imgPath = "assets/arcade/bittymatchup/";

var sPath = "assets/arcade/bittymatchup/sounds/";

var soundList = {
  noMatch:"noMatch.mp3",
  matchFound:"matchFound.mp3",
  win:"win.mp3",
  loop0:"loop1.mp3",
  loop1:"loop2.mp3",
  loop2:"loop3.mp3"
};


var rulesTitle = "Bitty Matchup";
var rulesText = "The game is simple.  You'll be given a brief glance at the what's in each box before the game starts.  All you have to do is remember them and match up the boxes.  Easy, right?";
    rulesText += "<br /><br />Each difficulty level gives you a number of free chances to try to match up the boxes.  7, 15, and 30, respectively.";
    rulesText += "<br />You can buy more chances in the game at a cost of 10<img src=\"assets/site/coin-gold.png\" height=12 /> each.";
    rulesText += "<br /><br />For each match that you make, you'll be given 1 point.";
    rulesText += "<br /><br />Each round, you'll win your points multiplied by how many chances you have left in Gold Coins and your score and bonus points will be added to your totals.<br />That means if you're playing the easy mode, which has 8 total pairs, and you finish with 4 chances left, you'll win 32 gold.  If you finish with all 7 chances left, you'll earn double the gold, which is 7x8x2 = <strong>112</strong><img src=\"assets/site/coin-gold.png\" height=12 />!";
    rulesText += "<br /><br />Your winnings will be added to your account when you decide to leave the game, but if you leave before the round is done, you will not get the earnings from that round!";
    rulesText += "<br /><br />What are bonus points?  Your bonus points are equal to the number of chances you have left at the end of a round, and they accumulate across multiple games.  This is important because if you earn enough of them, you'll get trophies and prizes!";

    rulesText += "<br /><br /><span style=\"color:darkRed; font-weight:bold;\">Leaderboard, prizes, and trophies are not yet available, but coming soon!</span>";

//setting up the gameboards needs to have three levels, easy, medium, and hard.
//easy: 4x4 - 8 sets
//medium: 6x6 - 18 sets?
//hard: 8x8 - 32 sets


//okay...we need to make themed sets of assets to provide variety to the game.  Should pull from a random set each time.
//each set should contain the full 32 possible sets, so that we can include them in every level of play.  Need at least 5 sets.
//this...is going to be tedious.
//each graphic should be pulled down to 200x200px at the min so that we can scale, and so that the board stays square at any difficulty level.
//can wireframe and number for now.

//image sets
var cardBacker = "cardBacker.png";
var set_0 = {folder:"Owl", prefix:"Owl", suffix:"png"};
var set_1 = {folder:"Aminal", prefix:"Aminal", suffix:"png"};
var set_2 = [];
var set_3 = [];
var set_4 = [];

var cardImageSets = [set_0, set_1];
