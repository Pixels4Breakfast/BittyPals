var modules = ["Snowball", "Toon"];
var styles = ["snowballhero"];


var obstacleList = [
  {type:"obstacle", id:"obstaclePL_1", popoutDirection:"vertical", h:115, w:449, src:"assets/arcade/snowballhero/test_mound.png"}
];
var preloadedObstacles = [];

var enemyList = [
  {type:"enemy", id:"enemyPL_1", special:false, h:118, w:75, src:"assets/arcade/snowballhero/test_enemy.png", frameHeight:118, frameWidth:75, standv:[], standh:[], throwv:[], throwh:[], duckv:[], duckh:[], hit:[], victory:[], tauntv:[], taunth:[]}
]
var preloadedEnemies = [];

//these will change as soon as I figure out how I'm going to pull all of this off...
//figure out a backround image setup to add different backgrounds at different levels
var levelVars = [
  {accuracy:0, speed:0, points:1, enemyCount:3, obstacleCount:2, specials:[]},
  {accuracy:0, speed:0, points:1, enemyCount:5, obstacleCount:3, specials:[]}
];

console.log("Variables module loaded");
