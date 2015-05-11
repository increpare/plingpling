 var contexts = new Array();
  var version="0.1";
  var gameTitle="My Game";
  var gameLink="www.plingpling.org"
  var winText="Congratulations! You won!"
  var width=125;
  var height=140;
  var zoomFactor=4;
  var radius=5;
  var stateIndex=0;
  var canvasIndex=0;
  var canvasses = new Array();
  var VERSION=2;
  for (var i=0;i<16;i++){
    canvasses[i] = new Uint8Array(width*height);
  }
  var dirty=false;
  var exitTriggered=false;
  var exitPointX=-1000;
  var exitPointY=-1000;
  var visibleCanvas;
  var visibleContext;
  var titleInput;
  var linkInput;
  var scoreText;
  var highScoreText;
  var winTextInput;
  var id;
  var id_d;
  var loaded=false;
  var lastX=-1;
  var lastY=-1;
  var shareLinkInner;
  var mainPaletteOffset=0;
  var layerCount=6;

  var levelCanvasses = new Array();
  for (var i=0;i<layerCount;i++){
    levelCanvasses[i] = new Uint8Array(width*height);
  }

  var lastDrawPosX=-1;
  var lastDrawPosY=-1;
  var score=0;
  var highScore =  0;

  var regionCanvasCount = 2;
  //canvas id 1 = empty space
  //canvas id 2 = regular wall
  var regionCanvas = new Uint32Array(width*height);
  var pivotPoints = [];
  var boundingBoxes = {};
  var regionTypes = [];

  var masterCanvas = new Uint8Array(width*height);
  var gameLevelCount=1;
  

/*
//arne
  var colorPalette = [
           "#000000",
            "#c2c2c2",
            "#0000ff",
            "#bfe3f3",
            "#ff8700",
            "#ffff00",
            "#b4772c",
            "#ff0000",
            "#00bd00",
            "#bc4499",
            "#ffaf00",
            "#ffadd5",
            "#00ffff",
            "#005784",
            "#31A2F2",
            "#B2DCEF"
            ];
*/

//dawnbringer
//http://www.pixeljoint.com/forum/forum_posts.asp?TID=12795
  var sourcePalette = [
          "#000000",//0
           "#000000",//1
            "#c2c2c2",//2
            "#0000ff",//3
            "#bfe3f3",//4
            "#ff8700",//5
            "#ffff00",//6
            "#b4772c",//7
            "#ff0000",//8
            "#00bd00",//9
            "#bc4499",//10
            "#ffaf00",//11
            "#00ffff",//12
            "#ffadd5",//13
            "#000079",//14
            "#8f0000",//15
            "#ff99ff", //16
            "#351d1d", //17
            "#8888ff" //18
            ];

  var colorPalette = sourcePalette;

    var layerElem = new Array();
  var thumbnailCanvas = new Array();
  var thumbnailContext = new Array();

var eraserCol=0;
var wallCol=2;
var bumperCol=3;
var bumperAuraCol=14;
var flipperCol=4;
var leftFlipperPivotCol=5;
var rightFlipperPivotCol=8;
var ballSpawnCol=15;
//var magnetCol=8;
//var magnetAuraCol=15;
var connectionCol=9;
var targetCol=10;
var targetActiveCol=16;
var togglableWallCol=11;
var togglableWallDisabledCol=17;
var exitCol=6;
var springCol=12;

var lastPlacedLeftPivot=false;
/*
//spectrum 
  var colorPalette = [
            "#000000",
            "#888888",
            "#CDCDCD",
            "#FFFFFF",
            "#0000CD",
            "#0000FF",
            "#CD0000",
            "#FF0000",
            "#CD00CD",
            "#FF00FF",
            "#00CD00",
            "#00FF00",
            "#00CDCD",
            "#00FFFF",
            "#CDCD00",
            "#FFFF00"
            ];
*/
  var colorElem = new Array();

var aurl = document.createElement('a');
function qualifyURL(url) {
  aurl.href = url;
  return aurl.href;
}



var standalone_HTML_String="";

if (PLAYER!==true){
  var clientStandaloneRequest = new XMLHttpRequest();

  clientStandaloneRequest.open('GET', 'play_inlined.txt');
  clientStandaloneRequest.onreadystatechange = function() {

      if(clientStandaloneRequest.readyState!=4) {
        return;
      }
      standalone_HTML_String=clientStandaloneRequest.responseText;
  }
  clientStandaloneRequest.send();
}

var get_blob = function() {
    return self.Blob;
}

function buildStandalone(sourceCode) {
  if (standalone_HTML_String.length===0) {
    alert("Can't export yet - still downloading html template.",true);
    return;
  }
  sourceCode=encodeURI(sourceCode);
  var htmlString = standalone_HTML_String.concat("");


  htmlString = "<!--Save as html file-->\n"+htmlString;
  htmlString = htmlString.replace(/__EMBED__/g,sourceCode);

  var BB = get_blob();
  var blob = new BB([htmlString], {type: "text/plain;charset=utf-8"});
  saveAs(blob, gameTitle+".html");
}

function exportClick(){
  var embedDat = stateToString();
  buildStandalone(embedDat);
}

function importClick(){
  var reader = new FileReader();

  reader.onload = function(e) {
   var text = reader.result;
  }

  reader.readAsText(file, encoding);
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

var connections=[];
function connectCables(region1,region2){
  var r1=null;
  var r1i=-1;
  var r2=null;
  var r2i=-1;
  for (var i=0;i<connections.length;i++){
    var r = connections[i];
    if (r.indexOf(region1)>=0){
      r1=r;
      r1i=i;
    }
    if (r.indexOf(region2)>=0){
      r2=r;
      r2i=i;
    }
    if ((r1!==null)&&(r1===r2)){
      return;
    }
  }

  //order them so I can splice
  if (r2i<r1i){
    var t = r1;
    r1=r2;
    r2=t;
    var ti = r1i;
    r1i=r2i;
    r2i=ti;
    var tr = region1;
    region1=region2;
    region2=tr;
  } 


  if (r2===null){
    r2=[region2];
  } else {
    connections.splice(r2i,1);
  }

  if (r1===null){
    r1=[region1];
  } else{  
    connections.splice(r1i,1);
  }

  connections.push(r1.concat(r2).unique());
}

function makeConnections(){
  var canvas=masterCanvas;
  connections=[];
  activatedConnections=[];
  for (var i=0;i<width-1;i++){
    for (var j=0;j<height-1;j++){
      var index=i+width*j;
      var v1=canvas[index];
      var v1Conducts = v1 === connectionCol || v1 === targetCol || v1 === togglableWallCol;
      if (v1Conducts===false){
        continue;
      }

      var rightIndex=index+1;
      var belowIndex=index+width;

      var mainRegion = regionCanvas[index];
      var rightRegion = regionCanvas[rightIndex];
      var belowRegion = regionCanvas[belowIndex];


      var v2=canvas[rightIndex];
      var v3=canvas[belowIndex];

      var v2Conducts = v2 === connectionCol || v2 === targetCol || v2 === togglableWallCol;
      var v3Conducts = v3 === connectionCol || v3 === targetCol || v3 === togglableWallCol;
      if (v2Conducts && mainRegion!==rightRegion) {
        connectCables(mainRegion,rightRegion);
      }
      if (v3Conducts && rightRegion!==belowRegion && mainRegion!==belowRegion){
        connectCables(mainRegion,belowRegion);
      }
    }
  }
}

function shareClick() {
  var title = gameTitle;
  var str = stateToString();

  var gistToCreate = {
    "description" : title,
    "public" : true,
    "files": {
      "readme.txt" : {
        "content": "A game made with www.flipcode.org"
      },
      "game.txt" : {
        "content": str
      }
    }
  };

  var githubURL = 'https://api.github.com/gists';
  var githubHTTPClient = new XMLHttpRequest();
  githubHTTPClient.open('POST', githubURL);
  githubHTTPClient.onreadystatechange = function() {    
    var errorCount=0;
    if(githubHTTPClient.readyState!=4) {
      return;
    }   
    var result = JSON.parse(githubHTTPClient.responseText);
    if (githubHTTPClient.status===403) {
      errorCount++;
      alert(result.message);
    } else if (githubHTTPClient.status!==200&&githubHTTPClient.status!==201) {
      errorCount++;
      alert("HTTP Error "+ githubHTTPClient.status + ' - ' + githubHTTPClient.statusText);
    } else {
      var id = result.id;
      var url = "play.html?p="+id;
      url=qualifyURL(url);

      var editurl = "editor.html?hack="+id;
      editurl=qualifyURL(editurl);
      var sourceCodeLink = "link to source code:<br><a href=\""+editurl+"\">"+editurl+"</a>";

      var shareLink = document.getElementById("shareLink");
      shareLink.innerHTML = "<a target=\"_blank\" href=\""+url+"\">&#8627;"+id+"</a><br>";
      shareLinkInner = shareLink.childNodes[0];

      if (errorCount>0) {
        alert("Cannot link directly to playable game, because there are errors.",true);
      } else {

      } 

      if(PLAYER!==true){
        window.history.pushState({}, "plingpling game maker", "index.html?p="+id);
      }


    }
  }
  githubHTTPClient.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  var stringifiedGist = JSON.stringify(gistToCreate);
  githubHTTPClient.send(stringifiedGist);
  lastDownTarget=masterCanvas;  
}

function RLE_encode(input) {
    var encoding = [];
    var prev, count, i;
    for (count = 1, prev = input[0], i = 1; i < input.length; i++) {
        if (input[i] != prev) {
            encoding.push(count);
            encoding.push(prev);
            count = 1;
            prev = input[i];
        }
        else 
            count ++;
    }
    encoding.push(count);
    encoding.push(prev);
    return encoding;
}

function RLE_decode(encoded) {
    var output = "";
    encoded.forEach(function(pair){ output += new Array(1+pair[0]).join(pair[1]) })
    return output;
}

function stateToString(){
  var state = new Object();
  state.gameTitle=gameTitle;
  state.winText=winText;
  state.gameLink=gameLink;
  state.canvasIndex=canvasIndex;
  state.canvasses=new Array();
  state.mainPaletteOffset=mainPaletteOffset;
  state.version=VERSION;
  for (var i=0;i<layerCount;i++){
    var canvas=levelCanvasses[i];
    var s="";
    for (var j=0;j<width*height;j++){
      s+=canvas[j].toString(16);
    }
    var pairs=RLE_encode(s);    
    state.canvasses.push(pairs);
  }
  var result=JSON.stringify(state);
  return result;
}

function findPageName() {
  var path = window.location.href;
  return path;
}


function makeKey(key){
  return findPageName() + key;
}

function stringToState(str){
  var state = JSON.parse(str);
  gameTitle=state.gameTitle;
  winText=state.winText;
  gameLink=state.gameLink;
  version = state.version;
  if (state.version==null){
    state.version=1;
  }

    mainPaletteOffset=0;
    var k = localStorage.getItem(makeKey('highScore'));
    highScore = k | 0;
  if ("mainPaletteOffset" in state){
    cyclePalette(state.mainPaletteOffset);
  } else {
  }
  stateIndex=0;

  canvasIndex = state.canvasIndex;
  if (canvasIndex==null){
    canvasIndex = 0;
  }

  levelCanvasses = new Array();
  for (var k=0;k<layerCount;k++){
    var s = state.canvasses[k];
    var ar = new Uint8Array(width*height);
    levelCanvasses.push(ar);
    if (state.version===1&&k>0){
      continue;
    }
    var index=0;
    for (var i=0;i<s.length;i+=2){
      var count=s[i];
      var ch=s[i+1];
      for (var j=0;j<count;j++){
        ar[index]=parseInt(ch,16);
        index++;
      }
    }
  }

  setLevel(1);
  stateIndex=0;
  compile();
  setScoreText(true);
}

document.addEventListener("keydown", press);
document.addEventListener("keyup", keyup);

var copyImage = null;

var savedString;

var keyBuffer=[];


function applyCanvasSweep(sweepArea){
  var x = Math.round(bpx);
  var y = Math.round(bpy);    
  var points = [
                              [x+1,y+0],[x+2,y+0],
                  [x+0,y+1],[x+1,y+1],[x+2,y+1],[x+3,y+1],
                  [x+0,y+2],[x+1,y+2],x+2+width*(y+2),[x+3,y+2],
                              [x+1,y+3],[x+2,y+3]
                  ];
    var maxDX=0;
    var maxDY=0;
  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      var pointIndex=px+width*py;
      var i2 = sweepArea[pointIndex];
      if (i2!==0){
        var tx = i2%(width);
        var ty = Math.floor(i2/width);
        var dx=tx-px;
        var dy=ty-py;
        if ( (dx*dx+dy*dy) > (maxDX*maxDX+maxDY*maxDY) ){
          maxDX=dx;
          maxDY=dy;
        }
      }
    }
  }


  if (maxDX!==0||maxDY!==0){
    //need to flip velocity about dx,dy
    var nSpeed = [-speedX,-speedY];
    var normal = [maxDX,maxDY];
    var refl = subV(mulV(2*dot(normal,nSpeed),normal),nSpeed);
    speedX=refl[0];
    speedY=refl[1];
  }

  bpx+=maxDX;
  bpy+=maxDY;
  speedX+=maxDX;
  speedY+=maxDY;
  clampSpeed();

  var xsign=0;
  var ysign=0;
  if (maxDX>0){
    xsign=1;
  } else if (maxDX<0){
    xsign=-1;
  }
  if (maxDY>0){
    ysign=1;
  } else if (maxDY<0){
    ysign=-1;
  }
  if(xsign===0&&ysign===0){
    ysign=-1;
  }

/*  while(ballCollides()){
    bpx+=xsign;
    bpy+=ysign;
  }
*/
}

var hasLeftPaddle=true;
var hasRightPaddle=true;
var hasSpring=true;

function interpolateAreas(oldstateIndex,newstateIndex){
  var oldLeft = oldstateIndex%2;
  var newLeft = newstateIndex%2;

  var oldRight = (Math.floor(oldstateIndex/2))%2;
  var newRight = (Math.floor(newstateIndex/2))%2;

  var oldDown = (Math.floor(oldstateIndex/4))%2;
  var newDown = (Math.floor(newstateIndex/4))%2;

  if (oldDown===1&&newDown===0){
    if (hasSpring){
      playSound(62826107,true);
    }
  } else if (oldDown===0&&newDown===1){
    if (hasSpring){
      playSound(67535707,true);    
    }
  } else if ((oldLeft===0&&newLeft===1)){
    if (hasLeftPaddle){
      playSound(64004107,true);
    } 
  }else if (oldRight===0&&newRight===1){
      if (hasRightPaddle){
        playSound(64004107,true);
      }
  }
  

  var result = [oldstateIndex];
  if (oldLeft!=newLeft){
    var newItem = result[result.length-1]-oldLeft+newLeft;
    result.push(newItem);
  }
  if (oldRight!=newRight){
    var newItem = result[result.length-1]-oldRight*2+newRight*2;
    result.push(newItem);
  }
  if (oldDown!=newDown){
    var newItem = result[result.length-1]-oldDown*4+newDown*4;
    result.push(newItem);
  }
  return result;
}

function setstateIndex(oldstateIndex,newstateIndex){
  if (dirty){
    compile();
  }

  var steps = interpolateAreas(oldstateIndex,newstateIndex);
  for (var i=0;i<steps.length-1;i++){
    var source = steps[i];
    var target = steps[i+1];
    
    var sweepArea =  sweepAreas[source][target];

    if (sweepArea==null){
      console.log( "setstateIndex not found " + source+" -> " + target );
      return;
    } 

    applyCanvasSweep( sweepArea );
  }
}

var tilting=false;

function setFlipperCanvas(){  
  var oldstateIndex=stateIndex;
  stateIndex=0;
  if (keyBuffer[37]===true){//left
    stateIndex=1;
  } 
  if (keyBuffer[39]===true){//right
    stateIndex+=2;
  }
  if (keyBuffer[40]===true){//down
    stateIndex+=4;
  }
  tilting = keyBuffer[38];//up

  if (oldstateIndex!=stateIndex){
    setstateIndex(oldstateIndex,stateIndex);
    //38 is up
    //40 is down
    setVisuals();
  }
}

function keyup(evt){
  evt = evt || window.event;
  keyBuffer[evt.keyCode]=false;
  setFlipperCanvas();
}

function prevent(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.stopPropagation) e.stopPropagation();
    e.returnValue=false;
    return false;
}


function setLevel(newCanvasIndex) {

  canvasIndex=newCanvasIndex-1;
  masterCanvas=levelCanvasses[canvasIndex];

  if (PLAYER!==true){
    for(var i=0;i<layerCount;i++){
      if (layerElem[i]!==null){
        layerElem[i].setAttribute("class","layerItem");
      }
    }
    layerElem[canvasIndex].setAttribute("class","layerItem selectedItem");
  }

  compile();
  setVisuals();
}

function drawThumbnail(n){
  thumbCtx=thumbnailContext[n];
  thumbCtx.fillStyle="#FF0000";
  thumbCtx.fillRect(0,0,16,10);
  var canvas=levelCanvasses[n];
  for (var i=0;i<25;i++){
    for (var j=0;j<28;j++){
      var max=0;
      for (var i2=0;i2<10;i2++){              
        for (var j2=0;j2<10;j2++){
            var sample = canvas[i*5+i2+width*(j*5+j2)];
            if (sample>max){
              max=sample;
            }
        }
      }
      thumbCtx.fillStyle=colorPalette[max];
      thumbCtx.fillRect(i,j,1,1);          
    }
  }

//      var dataUrl = thumbnailCanvas[n].toDataURL();
//      "dropdownOption"[0][0].style.backgroundImage="url("+dataUrl+")";
}

function press(evt){
  evt = evt || window.event;
  keyBuffer[evt.keyCode]=true;

  if ([32, 37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
    prevent(evt);
  }

  /*
  if (evt.keyCode==83){//S(ave)
    savedString = stateToString();
  } else if (evt.keyCode==76){//L(oad)
    stringToState(savedString);
    setVisuals();
    setLevel(stateIndex+1); 
  } */
  if (evt.keyCode===188){
    cyclePalette(-1);
  } else if (evt.keyCode===190){
    cyclePalette(1);
  }
  else if (evt.keyCode===38 && tilting===false){
    playSound(72335902,true);
  }
  else if (evt.keyCode===80 ){//p
    compile();
    spawnBall();
  }  else if (evt.keyCode===82){//r
    if (exitTriggered){
      compile();
    }
    spawnBall();
  }else if (evt.keyCode===67) { //c
    copyImage=JSON.stringify(masterCanvas);
    //copyImage=JSON.stringify(canvasses[stateIndex])
  } else if (evt.keyCode===86){ //v
    if (copyImage!==null){
      preserveUndoState();
      var ar = JSON.parse(copyImage);
      var arui8 = new Uint8Array(width*height);
      for (var i=0;i<width*height;i++){
        arui8[i]=ar[i];
      }
      masterCanvas=arui8;
      compile();
      setVisuals(true);
    }
  } else if (evt.keyCode ===189 || evt.keyCode===173 ) {//-
    var datArray = ['eraser', eraserCol,
                  'wall', wallCol,
                  'bumper', bumperCol,
                  'flipper', flipperCol,
                  'ballSpawn',ballSpawnCol,
                  'exitPoint',exitCol,
                  'spring',springCol,
                  'leftFlipperPivot', leftFlipperPivotCol,
                  'rightFlipperPivot', rightFlipperPivotCol,
                  'connection', connectionCol,
                  'target', targetCol,
                  'togglableWall', togglableWallCol];

                  var index = datArray.indexOf(activeTool);
                  if (index>0){
                    var newTarget = datArray[index-2];
                    var newTargetCol = datArray[index-1];
                    selectTool(newTarget,newTargetCol);
                  }

  } else if (evt.keyCode===187 || evt.keyCode===61){//+
        var datArray = ['eraser', eraserCol,
                  'wall', wallCol,
                  'bumper', bumperCol,
                  'flipper', flipperCol,
                  'ballSpawn',ballSpawnCol,
                  'exitPoint',exitCol,
                  'spring',springCol,
                  'leftFlipperPivot', leftFlipperPivotCol,
                  'rightFlipperPivot', rightFlipperPivotCol,
                  'connection', connectionCol,
                  'target', targetCol,
                  'togglableWall', togglableWallCol];

                  var index = datArray.indexOf(activeTool);
                  if (index+2<datArray.length){
                    var newTarget = datArray[index+2];
                    var newTargetCol = datArray[index+3];
                    selectTool(newTarget,newTargetCol);
                  }
  } else if (evt.keyCode===90){//z
    if (undoList.length>0){
      var dat = undoList.pop();
      masterCanvas=dat.canvasDat;
      compile();
      setVisuals(true);
      if (shareLinkInner!=null){
        shareLinkInner.style.color="gray";
      }
    }
  }

  setFlipperCanvas();
}
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  var bucketElem;
  function titleChange(newTitle){
    gameTitle=newTitle;    
  }

  function linkChange(newLink){
    gameLink=newLink;
  }
  function winTextChange(newWinText){
    winText=newWinText;
  }
function clearPalette(){
  preserveUndoState();
  var canvas=masterCanvas;
  for (var i=0;i<width*height;i++){
    canvas[i]=0;
  }

    var basicCanvas = canvasses[0];
    for (var i=0;i<basicCanvas.length;i++){
      basicCanvas[i]=masterCanvas[i];
    }
    bpx=-1000;
    bpy=-1000;
    speedX=0;
    speedY=0;
  setVisuals(true);
}


var colorElem = new Array();

var ballSpawnPointX=width/2;
var ballSpawnPointY=height/2;

var bpx=-2000;
var bpy=-2000;
var ballFrame=0;
var ballPointFrames = [
[
      [1,0],[2,0],
[0,1],[1,1],      [3,1],
[0,2],            [3,2],
      [1,3],[2,3]
],
[
      [1,0],[2,0],
[0,1],      [2,1],[3,1],
[0,2],            [3,2],
      [1,3],[2,3]
],
[
      [1,0],[2,0],
[0,1],            [3,1],
[0,2],      [2,2],[3,2],
      [1,3],[2,3]
],
[
      [1,0],[2,0],
[0,1],            [3,1],
[0,2],[1,2],      [3,2],
      [1,3],[2,3]
]
];


function ballCollides(){
  var x = Math.round(bpx);
  var y = Math.round(bpy);
  var indices = [
                              x+1+width*(y+0),x+2+width*(y+0),
                  x+0+width*(y+1),x+1+width*(y+1),x+2+width*(y+1),x+3+width*(y+1),
                  x+0+width*(y+2),x+1+width*(y+2),x+2+width*(y+2),x+3+width*(y+2),
                              x+1+width*(y+3),x+2+width*(y+3)
                  ];
  var canvas=canvasses[stateIndex];

  for (var i=0;i<indices.length;i++){
    var index = indices[i];
    var val = canvas[index];
    if (
          val>0 &&
          val!==bumperAuraCol &&
          val!==ballSpawnCol &&
          val!==exitCol &&
          val!==connectionCol){
      return true;
    }
  }
  return false;
}

  activatedConnections=[];
  function activateSwitch(index){
    var regionNumber = regionCanvas[index];
    var bbox = boundingBoxes[regionNumber];
    for (var x=bbox[0];x<=bbox[2];x++){      
      for (var y=bbox[1];y<=bbox[3];y++){   
        var i = x+width*y;
        if (regionCanvas[i]===regionNumber){
          for (var j=0;j<canvasses.length;j++){
            var canvas=canvasses[j];
            if (canvas[i]===targetCol){
              canvas[i]=targetActiveCol;
            }
          }
        }
      }
    }

    var connectionGroupIndex=-1;
    for (var i=0;i<connections.length;i++){
      var r = connections[i];
      if (r.indexOf(regionNumber)>=0){
        connectionGroupIndex=i;
        break;
      }
    }

    if (connectionGroupIndex===-1){
      playSound(89718103,true);
      return;
    }
    activatedConnections.push(regionNumber);

    var r = connections[connectionGroupIndex];

    var foundCables=0;
    var foundTriggers=0;
    var foundWalls=0;
    var triggeredTriggers=0;
    for (var i=0;i<r.length;i++){
      var rowRegionNum = r[i];
      var type = regionTypes[rowRegionNum];
      if (type === connectionCol){
        foundCables++;
      } else if (type === togglableWallCol){
        foundWalls++;
      } else if (type === targetCol){
        foundTriggers++;
        if (activatedConnections.indexOf(rowRegionNum)>=0){
          triggeredTriggers++;
        }
      }
    }
    if (triggeredTriggers===foundTriggers){
      removeTogglableWalls(r);
      playSound(66445903,true);
    } else {
      playSound(89718103,true);
    }
  }

  function removeTogglableWalls(row){

    for (var i=0;i<row.length;i++){
      var rowRegionNum = row[i];
      var type = regionTypes[rowRegionNum];
      if (type !== togglableWallCol){
        continue;
      }

      var bbox = boundingBoxes[rowRegionNum];

      for (var x=bbox[0];x<=bbox[2];x++){      
        for (var y=bbox[1];y<=bbox[3];y++){
          var index = x+width*y;
          if (regionCanvas[index]===rowRegionNum){            
            for (var j=0;j<canvasses.length;j++){
              var canvas=canvasses[j];
              if (canvas[index]===togglableWallCol){
                canvas[index]=togglableWallDisabledCol;
              }
            }
          }
        }
      }
    }
  }

  var ballOffsets = [
                          [1,0],[2,0],
                    [0,1],[1,1],[2,1],[3,1],
                    [0,2],[1,2],[2,2],[3,2],
                          [1,3],[2,3]
  ];
  function collision(x,y){

    var canvas=canvasses[stateIndex];

    var collisiondat = [];
    for (var i=0;i<ballOffsets.length;i++){
      var cp = ballOffsets[i];
      var cpx=cp[0]+x;
      var cpy=cp[1]+y;
      if (cpx<0||cpx>=width||cpy<0){
        var px = Math.floor(cpx)+0.5;
        var py = Math.floor(cpy)+0.5;
        var dx = px-x-2;
        var dy = py-y-2;
        collisiondat.push([wallCol,-dx,-dy])
        continue;
      }
      var index = cpx+width*cpy;
      var val = canvas[index];
      if (val === targetCol){
        activateSwitch(index);
      } else if (
            val>0 &&
            val!==bumperAuraCol &&
            val!==ballSpawnCol &&
            val!==exitCol &&
            val!==connectionCol && 
            val!==targetActiveCol &&
            val!==togglableWallDisabledCol){
        var px = (index%width)+0.5;
        var py = Math.floor(index/width)+0.5;
        var dx = px-x-2;
        var dy = py-y-2;
        collisiondat.push([val,-dx,-dy,index]);
      }
    }
    return collisiondat;
  }

  function dot(v1,v2){
    return v1[0]*v2[0]+v1[1]*v2[1];
  }

  function mag (v){
    return Math.sqrt(v[0]*v[0]+v[1]*v[1]);
  }

  function normalized(v){
    var m = mag(v);
    return [v[0]/m,v[1]/m];
  }

  function addV(v1,v2){
    return [v1[0]+v2[0],v1[1]+v2[1]];
  }

  function subV(v1,v2){
    return [v1[0]-v2[0],v1[1]-v2[1]];
  }

  function mulV(s,v){
    return [s*v[0],s*v[1]];
  }

  var speedX=0;
  var speedY=1;
  var ballSpin=1;
  var tickRecalcs=0;
  var tickLength=33;
  var bounceDamp=0.8;
  var bumperSpeed=2.0;
  var maxSpeed=3.0;
  var maxBallSpin=4.0;
  var spinDamp=0.0002;
  function clampSpeed(){    
    var v=  [speedX,speedY];
    var speedMag = mag(v);
    if (speedMag>maxSpeed){
      speedN = normalized(v);
      v = mulV(maxSpeed,speedN);
      speedX=v[0];
      speedY=v[1];
    }
    if (Math.abs(ballSpin)>maxBallSpin){
      ballSpin=ballSpin/Math.abs(ballSpin)*maxBallSpin;
    }
  }
  var ballSpinSpeed=0.4;
  var bumperHit=-1;
  var lastsoundpos_bump=-1;
  var oldscore=0;
  function tick(){

    var tempsoundpos = Math.round(bpx)+1000*Math.round(bpy);
    if (tempsoundpos!==lastsoundpos_bump){
      lastsoundpos_bump=-1;
    }
    if (oldscore!==score){
      // If the user has more points than the currently stored high score then
      if (score > highScore) {
        // Set the high score to the users' current points
        highScore = score;
        // Store the high score
        localStorage.setItem(makeKey('highScore'), highScore);
      }
      setScoreText();
    }
    if (PLAYER&&loaded){
      if ((bpy<-500||bpy>height+5)&&exitTriggered===false){
        spawnBall();
      }
    }
    bumperHit=-1;
    var signum=ballSpin>0?1:-1;
    ballFrame=(((ballFrame+signum*Math.sqrt(Math.abs(ballSpin))*ballSpinSpeed)%4)+4)%4;

    var oldSpeedX=speedX;
    var oldSpeedY=speedY;
    var canvas=canvasses[stateIndex];
    if (bpx<-10){
      if ((PLAYER&&exitTriggered) || (tilting===true)){
        setVisuals();
      } 
      return;
    }
    var G=0.002;
    speedY+=G*tickLength;
    clampSpeed();
    var nx = bpx+speedX;
    var ny = bpy+speedY;
    var rnx = Math.round(nx);
    var rny = Math.round(ny);
    var collisiondat = collision(rnx,rny);
    if (collisiondat.length===0){
      bpx=nx;
      bpy=ny;
      if (isNaN(bpx)||isNaN(bpy)){
        console.log("eek nan");
      }
      tickRecalcs=0;
      ballSpin*=(1-spinDamp*tickLength);
    } else {
      var avgx=0;
      var avgy=0;
      var bumperCount=0;
      for (var i=0;i<collisiondat.length;i++){
        var cx=collisiondat[i][1];
        var cy=collisiondat[i][2];
        avgx+=cx;
        avgy+=cy;

        if (collisiondat[i][0]===bumperCol){
          bumperCount++;
          bumperHit=regionCanvas[collisiondat[i][3]];
        }
      }

      avgx/=collisiondat.length;
      avgy/=collisiondat.length;

      if (avgx===0&&avgy===0){
        //try go backwards
        if (speedX!==0||speedY!==0){
          avgx=-speedY;
          avgy=speedX;
        } else {
          return;
        }  
      }

      var normal = normalized([avgx,avgy]);
      var nSpeed = [-speedX,-speedY];
      var targetsound=67922907;
      if (bumperCount>0){
        score+=200;
        targetsound=64236300;
        var speedMag=mag(nSpeed);
        speedMag+=bumperSpeed;
        if (speedMag>maxSpeed){
          speedMag=maxSpeed;
        }
        nSpeed = mulV(speedMag,normalized(nSpeed));
        speedX=nSpeed[0];
        speedY=nSpeed[1];
        clampSpeed();
      } else {
      }

      var soundpos = Math.round(bpx)+1000*Math.round(bpy);
      if(soundpos!==lastsoundpos_bump){
        playSound(targetsound,bumperCount===0);
      }
      lastsoundpos_bump=soundpos;

      var direction = (nSpeed[0]*normal[1]-nSpeed[1]*normal[0]);
/*      if (direction<0){
        console.log("left");
      } else if (direction>0){
        console.log("right");
      } else {
        console.log("bang");
      }*/
      var refl = subV(mulV(2*dot(normal,nSpeed),normal),nSpeed);
      //add 50% of spin to the bounce
      speedX=bounceDamp*refl[0];
      speedY=bounceDamp*refl[1];
      
      leftV = [-normal[1],normal[0]];
      var ballSpinAmount=1.0;
      speedX+=ballSpinAmount*ballSpin*leftV[0]/2;
      speedY+=ballSpinAmount*ballSpin*leftV[1]/2;

      ballSpin/=2;      
      ballSpin+=direction*mag([speedX,speedY])*(1-bounceDamp)/2.0;
      
      clampSpeed();
      nx = bpx+speedX;
      ny = bpy+speedY;


      tickRecalcs++;

      var collisiondat = collision(Math.round(nx),Math.round(ny));
      if (collisiondat.length===0){
        bpx=nx;
        bpy=ny;
      if (isNaN(bpx)||isNaN(bpy)){
        console.log("eek nan");
      }
        tickRecalcs=0;
      } else {
        if (tickRecalcs<4){
          tick();
          return;
        } else {
          bpx=nx;
          bpy=ny;
        }


      }
    }
    var bpxr=Math.round(bpx);
    var bpyr=Math.round(bpy);
    if (exitTriggered ===false && bpxr<=exitPointX&&exitPointX<=bpxr+4 && bpyr<=exitPointY&&exitPointY<=bpyr+4 ){
      if(canvasIndex+1<gameLevelCount){
        setLevel(canvasIndex+2);
        spawnBall();
      } else {
        exitTriggered=true;
        wonindex=13;
        bpx=-1000;
        bpy=-1000;     
        alert(winText + "\n score : "+score);
        setScoreText(true);
        playSound(81031108);
      }
      tilting=false;
      keyBuffer[38]=false; 
    }
    setVisuals();
  }

    function init() {
      setInterval(tick, tickLength);

      if (PLAYER===true){        
        scoreText = document.getElementById("scoreText");
        highScoreText = document.getElementById("highScoreText");
        setScoreText();
      } else {
        titleInput=document.getElementById("titleInput");
        titleInput.value=gameTitle;

        linkInput=document.getElementById("linkInput");
        linkInput.value=gameLink;

        for (var i=0;i<layerCount;i++){
          elem = document.getElementById("thumbnail"+(i+1));        
          thumbnailCanvas[i]=elem;
          thumbnailContext[i]=elem.getContext("2d");
        }

        for (var i=0;i<layerCount;i++){
          elem = document.getElementById("layerItem"+(i+1));        
          layerElem[i]=elem;
        }

        winTextInput=document.getElementById("winText");
        winTextInput.value=winText;

        for (var i=0;i<16;i++){
          elem = document.getElementById("color_"+(i)); 
          if (elem!==null){       
            elem.style.backgroundColor=colorPalette[i];
            colorElem[i]=elem;
          }
        }
        elem = document.getElementById("colorOffsetChoice");
        if (elem!==null){
            elem.style.backgroundColor=colorPalette[0];
        }
      } 

      visibleCanvas = document.getElementById("mainCanvas");

      if (!(PLAYER===true)){
        visibleCanvas.addEventListener('mousedown', mouseDown,false);
        visibleCanvas.addEventListener('mouseup', mouseUp,false);
        visibleCanvas.addEventListener('mousemove', mouseMove,false);
        visibleCanvas.addEventListener('mouseout', mouseOut,false);

        var fileUploader = document.getElementById("my_file");
        fileUploader.addEventListener('change', readFile, false);

        window.addEventListener('mouseup', mouseUp,false);
      }

      visibleContext = visibleCanvas.getContext("2d");
      visibleContext.imageSmoothingEnabled= false;
      id = visibleContext.createImageData(1,1); // only do this once per page
      id_d=id.data;
      setLevel(1);
      setVisuals(true);

      getData();
      setScoreText(true);
    }

  function readFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
        var contents = e.target.result;
        //escapes below are to get around searching for a pattern in its own file messing things up
        var fromToken="\_\_EmbedBegin\_\_";
        var endToken="\_\_EmbedEnd\_\_";
        var fromIndex=contents.indexOf(fromToken);
        var endIndex=contents.indexOf(endToken);
        var ss1 = contents.substr(fromIndex+fromToken.length+2+1,(endIndex-2)-fromIndex-(fromToken.length+2)-2);
        var decoded = decodeURI(ss1);
        stringToState(decoded);
        setTexts();
        loaded=true;
        setLevel(canvasIndex+1); 
        setVisuals(true,true);
      }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
  }



  function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }


  function strip_http(url) {
     url = url.replace(/^https?:\/\//,'');
     return url;
  }

  function setTexts(){
    if (PLAYER===true){
      var homepageLink = document.getElementById("homepageLinkPlayer");
      var gameTitleHeader = document.getElementById("gameTitleHeader");
      var homepage=gameLink;
      homepageLink.innerHTML=strip_http(homepage);
      if (!homepage.match(/^https?:\/\//)) {
        homepage = "http://" + homepage;
      }
      homepageLink.href = homepage;

      gameTitleHeader.innerText = gameTitle;
      document.title=gameTitle;
    }else{
        titleInput.value=gameTitle;
        linkInput.value=gameLink;
        winTextInput.value=winText;
    } 
  }
  function getData(){ 

    if (embeddedDat[0]!=='_'){
      embeddedDat=decodeURI(embeddedDat);

      stringToState(embeddedDat);
      setVisuals(true,true);
      setTexts();
      loaded=true;
      return;
    }

    var id = getParameterByName("p").replace(/[\\\/]/,"");
    if (id===null||id.length===0) {
      
      return;
    }



    var hacklink = document.getElementById("hackLink");

    var url = "index.html?p="+id;
    url=qualifyURL(url);
    if (hacklink!=null){
      hacklink.href=url;
      hacklink.innerHTML="&sdotb; edit";
    }
    
    var githubURL = 'https://api.github.com/gists/'+id;

    var githubHTTPClient = new XMLHttpRequest();
    githubHTTPClient.open('GET', githubURL);
    githubHTTPClient.onreadystatechange = function() {
      if(githubHTTPClient.readyState!=4) {
        return;
      }   
      var result = JSON.parse(githubHTTPClient.responseText);
      if (githubHTTPClient.status===403) {
        alert(result.message);
      } else if (githubHTTPClient.status!==200&&githubHTTPClient.status!==201) {
        alert("HTTP Error "+ githubHTTPClient.status + ' - ' + githubHTTPClient.statusText);
      }
      var result = JSON.parse(githubHTTPClient.responseText);
      var code=result["files"]["game.txt"]["content"];
      
      stringToState(code);
      setTexts();
      loaded=true;
      setVisuals(true,true);
    }
    githubHTTPClient.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    githubHTTPClient.send();
  }


  var lastbpx;
  var lastbpy;
  var lastBallFrame=ballFrame;

  var wonindex=4;

    function setVisuals(genAnyThumbnails, genAllThumbnails){
      if (PLAYER&&loaded===false){
        visibleContext.fillStyle="#ff0000";
        visibleContext.fillRect(0,0,visibleCanvas.width/2,visibleCanvas.height/2);
        visibleContext.fillStyle="#00ff00";
        visibleContext.fillRect(visibleCanvas.width/2,0,visibleCanvas.width/2,visibleCanvas.height/2);
        visibleContext.fillStyle="#ff00ff";
        visibleContext.fillRect(0,visibleCanvas.height/2,visibleCanvas.width/2,visibleCanvas.height/2);
        visibleContext.fillStyle="#00ffff";
        visibleContext.fillRect(visibleCanvas.width/2,visibleCanvas.height/2,visibleCanvas.width/2,visibleCanvas.height/2);
        return;
      }
      //visibleContext.drawImage(canvasses[stateIndex], 0, 0); 
      //visibleContext.drawImage(canvasses[stateIndex], 0, 0,width*zoomFactor,height*zoomFactor); 
      var canvas=canvasses[stateIndex];
      var zoom = zoomFactor;
      if (tilting){
        zoom-=Math.random()*0.1;
        speedX+=(Math.random()*2-1.0)*0.2;
        speedY+=(Math.random()*2-1.0)*0.2;
        clampSpeed();
      }

      if (exitTriggered && PLAYER===true){
        wonindex=(wonindex+1)%(colorPalette.length*15);
        var coloroffset=Math.floor(wonindex/15);
        for (var i=0;i<width;i++){
          for (var j=0;j<height;j++){
            var pixelIndex = (canvas[i+width*j]+coloroffset)%colorPalette.length;
            visibleContext.fillStyle=colorPalette[pixelIndex];
            if (pixelIndex===bumperCol && bumperHit>=0){
              if (regionCanvas[i+width*j]===bumperHit){
                visibleContext.fillStyle=colorPalette[18];              
              }
            } 
            visibleContext.fillRect(i*zoom,j*zoom,zoom,zoom);        
          }
        }
        return;
      }
      for (var i=0;i<width;i++){
        for (var j=0;j<height;j++){
          var pixelIndex = canvas[i+width*j];
          visibleContext.fillStyle=colorPalette[pixelIndex];
          if (pixelIndex===bumperCol && bumperHit>=0){
            if (regionCanvas[i+width*j]===bumperHit){
              visibleContext.fillStyle=colorPalette[18];              
            }
          } 
          visibleContext.fillRect(i*zoom,j*zoom,zoom,zoom);        
        }
      }

      if (mag([speedX,speedY])>2) {
        var ballPoints=ballPointFrames[Math.floor(lastBallFrame)];
        visibleContext.fillStyle="#888888";
        for (var i=0;i<ballPoints.length;i++){
          var bp = ballPoints[i];
          var pi=Math.round(lastbpx+bp[0]);
          var pj=Math.round(lastbpy+bp[1]);
          visibleContext.fillRect(pi*zoom,pj*zoom,zoom,zoom);
        }
      }
      var ballPoints=ballPointFrames[Math.floor(ballFrame)];
      visibleContext.fillStyle="#ffffff";
      for (var i=0;i<ballPoints.length;i++){
        var bp = ballPoints[i];
        var pi=Math.round(bpx+bp[0]);
        var pj=Math.round(bpy+bp[1]);
        visibleContext.fillRect(pi*zoom,pj*zoom,zoom,zoom);
      }
      lastbpy=bpy;
      lastbpx=bpx;
      if (PLAYER===false){
        titleInput.value=gameTitle;
        linkInput.value=gameLink;
        winTextInput.value=winText;
      }
      lastBallFrame=Math.floor(ballFrame);

      if (PLAYER!==true&&genAnyThumbnails===true){
        if (genAllThumbnails===true){
          for (var i=0;i<layerCount;i++){
            drawThumbnail(i);                    
          }
        } else {
            drawThumbnail(canvasIndex);
        }      
      }
    }


  var drawing=0;


  function getCoords(e) {
    var x,y; 
    if(typeof e.offsetX !== "undefined") {
        x = e.offsetX;
        y = e.offsetY;
    }
    else {      
      var target = e.target || e.srcElement;
      var rect = target.getBoundingClientRect();
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    } 
    return [x,y];
  }



  function uint8ar_copy(src)  {
      var dst = new Uint8Array(width*height);
      for (var i=0;i<src.length;i++){
        dst[i]=src[i];
      }
      return dst;
  }

  var undoList=new Array();
  function preserveUndoState() {

    dirty=true;
    bpx=-1000;
    bpy=-1000;
    console.log("preserving undo state");
    var undoItem = new Object();
    undoItem.canvasDat=uint8ar_copy(masterCanvas);
    undoList.push(undoItem);
    if (undoList.length>30){
      undoList.shift();
    }

      if (shareLinkInner!=null){
        shareLinkInner.style.color="gray";
      }
  }

  function mouseDown(e){
    e = e || window.event;

    drawing=1;
    var coords = getCoords(e);
    startTargetX=coords[0];
    startTargetY=coords[1];
    lastX=Math.floor(-1+startTargetX/zoomFactor);
    lastY=Math.floor(-1+startTargetY/zoomFactor);
    
    preserveUndoState();
    mouseMove(e,e.type==="mousedown");
    if(radius===0){
      drawing=0;
    }
  }

  function mouseUp(e){
    e = e || window.event;
    calcHalo();
    setVisuals();
    drawing=0;
    lastX=-1;
    lastY=-1;
  }

  function mouseOut(e){
    e = e || window.event;

    mouseMove(e);
    lastX=-1;
    lastY=-1;
  }

  var activeTool="wall";
  function selectTool(toolName,col){
    activeTool=toolName;
    for (var i=0;i<16;i++){
      var elem = colorElem[i];
      if (elem!=null){
        elem.setAttribute("class","unselected");
      }
    }
    colorElem[col].setAttribute("class","selected");
  }

  function line (x1, y1,x2,y2) {
    var coordinatesArray = new Array();
    // Translate coordinates
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    // Set first coordinates
    coordinatesArray.push([x1,y1]);
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      // Set coordinates
      coordinatesArray.push([x1,y1]);
    }
    // Return the result
    return coordinatesArray;
  }


function eraserDraw(x,y){
  //var points = [[x,y],[x-1,y],[x,y+1],[x+1,y],[x,y-1]];

  var points = [
              [x-1,y+2],[x,y+2],[x+1,y+2],
    [x-2,y+1],[x-1,y+1],[x,y+1],[x+1,y+1],[x+2,y+1],
    [x-2,y  ],[x-1,y  ],[x,y  ],[x+1,y  ],[x+2,y  ],
    [x-2,y-1],[x-1,y-1],[x,y-1],[x+1,y-1],[x+2,y-1],
              [x-1,y-2],[x,y-2],[x+1,y-2]
    ];
  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      masterCanvas[px+width*py]=eraserCol;
    }
  }   
}

function wallDraw(x,y){
  var points = [[x,y],[x-1,y],[x,y+1],[x+1,y],[x,y-1]];

  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      masterCanvas[px+width*py]=wallCol;
    }
  }   
}

function bumperDraw(x,y){
  var points = [[x,y],[x-1,y],[x,y+1],[x+1,y],[x,y-1]];

  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      masterCanvas[px+width*py]=bumperCol;
    }
  }   
}

function flipperDraw(x,y){
  var points = [[x,y],[x-1,y],[x,y+1],[x+1,y],[x,y-1]];

  var foundflipper=false;
  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      val = masterCanvas[px+width*py];
      if (val!==leftFlipperPivotCol&&val!==rightFlipperPivotCol){
        masterCanvas[px+width*py]=flipperCol;
        }
    }
  }   


  neighbours=[[x+1,y],[x,y+1],[x-1,y],[x,y-1]];
  fillCanvas[x+width*y]=1;
  if (masterCanvas[x+width*y]===leftFlipperPivotCol||masterCanvas[x+width*y]===rightFlipperPivotCol){
    foundflipper=true;
  }
  for(var i=0;i<neighbours.length;i++){
    var n = neighbours[i];
    var nx=n[0];
    var ny=n[1];
    if (nx>=0&&nx<width&&ny>=0&&ny<height&&fillCanvas[nx+width*ny]===0){
      var val = masterCanvas[nx+width*ny];
      if (  val===leftFlipperPivotCol   ||
            val===rightFlipperPivotCol  ||
            val===flipperCol 
          ) {
        if (foundflipper){
          masterCanvas[nx+width*ny]=flipperCol;
        } else if (val===leftFlipperPivotCol||val===rightFlipperPivotCol){
          foundflipper=true;
        }
        fillCanvas[nx+width*ny]=1;
        neighbours.push([nx+1,ny]);
        neighbours.push([nx-1,ny]);
        neighbours.push([nx,ny+1]);
        neighbours.push([nx,ny-1]);
      }
    }
  }
  if (foundflipper===false){
    if (x<=width/2){
      masterCanvas[x+width*y]=leftFlipperPivotCol;
    } else {
      masterCanvas[x+width*y]=rightFlipperPivotCol;
    }
  }

  for (var i=0;i<width*height;i++){
    fillCanvas[i]=0;
  }

}

var fillCanvas = new Uint8Array(width*height);
function leftFlipperPivotDraw(x,y){
  var px=x;
  var py=y;

  if (px>=0&&px<width&&py>=0&&py<height){
    masterCanvas[px+width*py]=leftFlipperPivotCol;
  }
  neighbours=[[px+1,py],[px,py+1],[px-1,py],[px,py-1]];

  for (var i=0;i<neighbours.length;i++){
    var n = neighbours[i];
    var nx=n[0];
    var ny=n[1];
    if (nx>=0&&nx<width&&ny>=0&&ny<height){
      masterCanvas[nx+width*ny]=flipperCol;
    }
  }

  fillCanvas[px+width*py]=1;
  for(var i=0;i<neighbours.length;i++){
    var n = neighbours[i];
    var nx=n[0];
    var ny=n[1];
    if (nx>=0&&nx<width&&ny>=0&&ny<height&&fillCanvas[nx+width*ny]===0){
      var val = masterCanvas[nx+width*ny];
      if (  val===leftFlipperPivotCol   ||
            val===rightFlipperPivotCol  ||
            val===flipperCol 
          ) {
        masterCanvas[nx+width*ny]=flipperCol;
        fillCanvas[nx+width*ny]=1;
        neighbours.push([nx+1,ny]);
        neighbours.push([nx-1,ny]);
        neighbours.push([nx,ny+1]);
        neighbours.push([nx,ny-1]);
      }
    }

  }

  for (var i=0;i<width*height;i++){
    fillCanvas[i]=0;
  }
}


function rightFlipperPivotDraw(x,y){
  var px=x;
  var py=y;

  if (px>=0&&px<width&&py>=0&&py<height){
    masterCanvas[px+width*py]=rightFlipperPivotCol;
  }
  neighbours=[[px+1,py],[px,py+1],[px-1,py],[px,py-1]];


  for (var i=0;i<neighbours.length;i++){
    var n = neighbours[i];
    var nx=n[0];
    var ny=n[1];
    if (nx>=0&&nx<width&&ny>=0&&ny<height){
      masterCanvas[nx+width*ny]=flipperCol;
    }
  }
  
  fillCanvas[px+width*py]=1;
  for(var i=0;i<neighbours.length;i++){
    var n = neighbours[i];
    var nx=n[0];
    var ny=n[1];
    if (nx>=0&&nx<width&&ny>=0&&ny<height&&fillCanvas[nx+width*ny]===0){
      var val = masterCanvas[nx+width*ny];
      if (  val===leftFlipperPivotCol   ||
            val===rightFlipperPivotCol  ||
            val===flipperCol 
          ) {
        masterCanvas[nx+width*ny]=flipperCol;
        fillCanvas[nx+width*ny]=1;
        neighbours.push([nx+1,ny]);
        neighbours.push([nx-1,ny]);
        neighbours.push([nx,ny+1]);
        neighbours.push([nx,ny-1]);
      }
    }

  }

  for (var i=0;i<width*height;i++){
    fillCanvas[i]=0;
  }
}

function ballSpawnDraw(x,y){
  var px=x;
  var py=y;
  for(var i=0;i<width*height;i++){
    if (masterCanvas[i]===ballSpawnCol){
      masterCanvas[i]=0;
    }
  }
  if (px<3){
    px=3;
  } else if (px>width-3){
    px=width-3;
  }
  if (py<3){
    py=3;
  } else if (py>height-3){
    py=height-3;
  }

  var points = [
                [px-3,py-0],
                [px-3,py-1],
                [px-2,py-2],
                [px-1,py-3],
                [px+0,py-3],
                [px+1,py-2],
                [px+2,py-1],
                [px+2,py-0],
                [px+1,py+1],
                [px+0,py+2],
                [px-1,py+2],
                [px-2,py+1]
                ];
  for (var i=0;i<points.length;i++){
    var p = points[i];
    masterCanvas[p[0]+width*p[1]]=ballSpawnCol;
  }
}


function connectionDraw(x,y){
  var points = [[x,y],[x-1,y],[x,y-1],[x-1,y-1]];

  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      masterCanvas[px+width*py]=connectionCol;
    }
  }   
}

function targetDraw(x,y){
  var points = [[x,y],[x-1,y],[x,y+1],[x+1,y],[x,y-1]];

  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      masterCanvas[px+width*py]=targetCol;
    }
  }   

}

function togglableWallDraw(x,y){
  var points = [[x,y],[x-1,y],[x,y+1],[x+1,y],[x,y-1]];

  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      masterCanvas[px+width*py]=togglableWallCol;
    }
  }   
}

function springDraw(x,y){
  var points = [[x,y],[x-1,y],[x,y+1],[x+1,y],[x,y-1]];

  for (var i=0;i<points.length;i++){
    var px=points[i][0];
    var py=points[i][1];
    if (px>=0&&px<width&&py>=0&&py<height){
      masterCanvas[px+width*py]=springCol;
    }
  }   
}

function exitPointDraw(x,y){
  var px=x;
  var py=y;
  for(var i=0;i<width*height;i++){
    if (masterCanvas[i]===exitCol){
      masterCanvas[i]=0;
    }
  }
  if (px<2){
    px=2;
  } else if (px>width-3){
    px=width-3;
  }
  if (py<2){
    py=2;
  } else if (py>height-3){
    py=height-3;
  }

  var points = [
                [px,py],
                [px-1,py-1],[px-2,py-2],
                [px+1,py-1],[px+2,py-2],
                [px-1,py+1],[px-2,py+2],
                [px+1,py+1],[px+2,py+2]
                ];
  for (var i=0;i<points.length;i++){
    var p = points[i];
    masterCanvas[p[0]+width*p[1]]=exitCol;
  }
}


  var interpolateBrush = {
    eraser: true,
    wall: true,
    bumper: true,
    flipper: true,
    leftFlipperPivot: false,
    rightFlipperPivot: false,
    ballSpawn: false,
    connection: true,
    target: true,
    togglableWall: true,
    spring: true,
    exitPoint: false
  }

  var drawFuncs = {
    eraser: eraserDraw,
    wall: wallDraw,
    bumper: bumperDraw,
    flipper: flipperDraw,
    leftFlipperPivot: leftFlipperPivotDraw,
    rightFlipperPivot: rightFlipperPivotDraw,
    ballSpawn: ballSpawnDraw,
    connection: connectionDraw,
    target: targetDraw,
    togglableWall: togglableWallDraw,
    spring: springDraw,
    exitPoint: exitPointDraw
  }

  function mouseMove(e,mousedown){
    e = e || window.event;

    if (drawing===0)
      return;

    var coords = getCoords(e);

    var x = Math.floor(-1+coords[0]/zoomFactor);
    var y = Math.floor(-1+coords[1]/zoomFactor);

    if (keyBuffer[16]){
      lastX=lastDrawPosX;
      lastY=lastDrawPosY;
    }

    var points;
    if (interpolateBrush[activeTool]===false||lastX<0||lastY<0) {
      points=[[x,y]];
    } else {
      points=line(lastX,lastY,x,y);
    }

    var brushFn=drawFuncs[activeTool];
    for (var i=0;i<points.length;i++){
     var p=points[i];
     brushFn(p[0],p[1]);
    }
  

    var basicCanvas = canvasses[0];
    for (var i=0;i<basicCanvas.length;i++){
      basicCanvas[i]=masterCanvas[i];
    }
    /*context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.lineWidth = 0;
    context.fillStyle = 'green';
    context.fill();*/
    setVisuals(true);

    var coords = getCoords(e);
    lastX=Math.floor(-1+coords[0]/zoomFactor);
    lastY=Math.floor(-1+coords[1]/zoomFactor);
    
    lastDrawPosX=x;
    lastDrawPosY=y;

    if (stateIndex!==0){
      compile();
    }
  }

  function compile(){
    dirty=false;
    boundingBoxes = {};
    pivotPoints = {};
    exitTriggered=false;
    
    for (var i=0;i<width*height;i++){
      regionCanvas[i]=0;
    }

    regionTypes=[];

    var ballSpawnPointCount=0;
    ballSpawnPointX=0;
    ballSpawnPointY=0;

    var exitPointCount=0;
    exitPointX=0;
    exitPointY=0;

    regionCanvasCount = 2;
    for (var x=0;x<width;x++){
      for (var y=0;y<height;y++) {
        if (regionCanvas[x+width*y]===0){
          var val =masterCanvas[x+width*y];
          if (val===eraserCol||val===bumperAuraCol){
            regionCanvas[x+width*y]=eraserCol;
          } else if (val===wallCol) {
            regionCanvas[x+width*y]=wallCol;
          } else {
            fillRegion(x,y,regionCanvasCount+1);
            regionCanvasCount++;
          }
        }
        if (masterCanvas[x+width*y]===ballSpawnCol){
          ballSpawnPointX+=x;
          ballSpawnPointY+=y;
          ballSpawnPointCount++;
        }
        if (masterCanvas[x+width*y]===exitCol){
          exitPointX+=x;
          exitPointY+=y;
          exitPointCount++;
        }
      }
    }

    if (ballSpawnPointCount>0){
      ballSpawnPointX/=ballSpawnPointCount;
      ballSpawnPointY/=ballSpawnPointCount;
      ballSpawnPointX-=2;
      ballSpawnPointY-=2;
    } else {
      ballSpawnPointX=width/2;
      ballSpawnPointY=height/2;
    }

    if (exitPointCount===0){
      exitPointX=-10000;
      exitPointY=-10000; 
    } else {
      exitPointX/=exitPointCount;
      exitPointY/=exitPointCount;
    }

    drawBB();
    scrunchSprings();
    generateSweepOffsets();
    makeConnections();


    hasLeftPaddle=false;
    hasRightPaddle=false;
    hasSpring=false;

    for (var i in pivotPoints){
      var ppoint = pivotPoints[i];
      if (ppoint[2]===1){
        hasLeftPaddle=true;
      } else if (ppoint[2]===2){
        hasRightPaddle=true;
      }
    }
    for (var i=0;i<regionTypes.length;i++){
      if (regionTypes[i]===springCol){
        hasSpring=true;
      }
    }

    setVisuals(true);
    gameLevelCount=1;
    for (var i=1;i<layerCount;i++){
      var can=levelCanvasses[i];
      for (var j=0;j<width*height;j++){
        if (can[j]!==0){
          gameLevelCount++;
          break;
        }
      }
      if (gameLevelCount===i){
        break;
      }
    }
    console.log("level count = "+gameLevelCount);
  }

  function setScoreText(includeHighScore){
    if(PLAYER===true){
      scoreText.innerText=score;
      if (includeHighScore===true){
        highScoreText.innerText=highScore;
      }
    }
    oldscore=score;
  }
  function spawnBall(){
    score=0;
    setScoreText(true);
    bpx=ballSpawnPointX;
    bpy=ballSpawnPointY;
    ballSpin=0;
    speedX=0;
    speedY=0;
    playSound(43637308,true);
  }

  function fillRegion(x,y,regionNumber){
    var originCol=masterCanvas[x+width*y];
    var originFlipper = 
      originCol===leftFlipperPivotCol ||
      originCol===rightFlipperPivotCol ||
      originCol===flipperCol;

    if (originCol===leftFlipperPivotCol){
     pivotPoints[regionNumber]=[x,y,1];
    } else if (originCol===rightFlipperPivotCol){
     pivotPoints[regionNumber]=[x,y,2];
    } 

    regionCoordIndex=x+width*y;
    regionCanvas[regionCoordIndex]=regionNumber;
    regionTypes[regionNumber]=masterCanvas[regionCoordIndex];

    if ((regionNumber) in boundingBoxes){
      bbox = boundingBoxes[regionNumber];
      bbox[0]=Math.min(bbox[0],nx);
      bbox[1]=Math.min(bbox[1],ny);
      bbox[2]=Math.max(bbox[2],nx);
      bbox[3]=Math.max(bbox[3],ny);
    } else {
      boundingBoxes[regionNumber]=[x,y,x,y];
    }

    var neighbours = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
    for(var i=0;i<neighbours.length;i++){
      var n = neighbours[i];
      var nx=  n[0];
      var ny = n[1];
      if (nx>=0&&nx<width&&ny>=0&&ny<height&&masterCanvas[nx+width*ny]>wallCol &&regionCanvas[nx+width*ny]===0) {
        var val = masterCanvas[nx+width*ny];
        if (val==originCol ||
              (originFlipper && (
                val === leftFlipperPivotCol ||
                val === rightFlipperPivotCol ||
                val === flipperCol ) ) ) {
          regionCanvas[nx+width*ny]=regionNumber;
          neighbours.push([nx+1,ny]);
          neighbours.push([nx-1,ny]);
          neighbours.push([nx,ny+1]);
          neighbours.push([nx,ny-1]);

          if (regionNumber in boundingBoxes){
            bbox = boundingBoxes[regionNumber];
            bbox[0]=Math.min(bbox[0],nx);
            bbox[1]=Math.min(bbox[1],ny);
            bbox[2]=Math.max(bbox[2],nx);
            bbox[3]=Math.max(bbox[3],ny);
          } else {
            boundingBoxes[regionNumber]=[nx,ny,nx,ny];
          }

          if (originFlipper){
            if (val===leftFlipperPivotCol) {
              pivotPoints[regionNumber]=[nx,ny,1];
            } else if (val === rightFlipperPivotCol){
              pivotPoints[regionNumber]=[nx,ny,2];
            }
          }
        }
      }
    }
  }

  function scrunchSprings(){
    var downNoneCanvas=uint8ar_copy(canvasses[0]);
    var downLeftCanvas=uint8ar_copy(canvasses[1]);
    var downRightCanvas=uint8ar_copy(canvasses[2]);
    var downBothCanvas=uint8ar_copy(canvasses[3]);
    canvasses[4]=downNoneCanvas;
    canvasses[5]=downLeftCanvas;
    canvasses[6]=downRightCanvas;
    canvasses[7]=downBothCanvas;


    //remove springs
    for (var i=0;i<regionCanvas.length;i++){
      var regionNumber = regionCanvas[i];
      if (regionTypes[regionNumber]===springCol){
        downNoneCanvas[i]=0;
        downLeftCanvas[i]=0;
        downRightCanvas[i]=0;
        downBothCanvas[i]=0;
      }
    }

    //redraw them at half height

    for (var regionNumberStr in boundingBoxes){
      var regionNumber=Number(regionNumberStr);
      if (regionTypes[regionNumber] !== springCol){
        continue;
      }
      var bbox = boundingBoxes[regionNumber];
      var bottomy=bbox[3];
      for (var x=bbox[0];x<=bbox[2];x++){      
        for (var y=bbox[1];y<=bbox[3];y++){
          var i = x+width*y;
          if (regionCanvas[i]===regionNumber){
            var newy = (y-bottomy)/2+bottomy;
            newy=Math.round(newy);
            downNoneCanvas[x+width*newy]=springCol;
            downLeftCanvas[x+width*newy]=springCol;
            downRightCanvas[x+width*newy]=springCol;
            downBothCanvas[x+width*newy]=springCol;
          }
        }
      }
    }
  }
  
  function generateSweepSprings(
    sourcestateIndex,
    targetstateIndex
    ) {

    var sourceCanvas=canvasses[sourcestateIndex];
    var targetCanvas= canvasses[targetstateIndex];
    var targetSweepArea = sweepAreas[sourcestateIndex][targetstateIndex];
    var targetSweepAreaInverse = sweepAreas[targetstateIndex][sourcestateIndex];

    for (var regionNumberStr in boundingBoxes){
      var regionNumber=Number(regionNumberStr);
      if (regionTypes[regionNumber] !== springCol){
        continue;
      }
      var bbox = boundingBoxes[regionNumber];
      var bottomy=bbox[3];
      var topy=bbox[1];
      var bheight=bottomy-topy;

      for (var x=bbox[0];x<=bbox[2];x++){      
        for (var y=bbox[1];y<=bbox[3];y++){          
          var i = x+width*y;
          if (regionCanvas[i]===regionNumber){
            var altitude = bottomy-y;
            var targetaltitutde=Math.round(altitude/2);
            var targetx=x;
            var targety=bottomy-targetaltitutde;

            //forward sweep
            var targetindex = targetx+width*targety;
            while (targetindex>0&&targetindex<width*height){
              var targetVal = targetCanvas[targetindex];
              if (targetVal<=eraserCol||targetVal===bumperAuraCol){
                break;
              }
              targetindex-=width;
            }

            var sourcex=x;
            var sourcey=y;
            var sourceindex = sourcex+width*sourcey;
            while (sourceindex>0&&sourceindex<width*height){
              var sourceVal = sourceCanvas[sourceindex];
              if (sourceVal<=eraserCol||sourceVal===bumperAuraCol){
                break;
              }
              sourceindex-=width;
            }


            var linePoints = line(x,y,Math.round(targetx),Math.round(targety));
            for (var j=0;j<linePoints.length;j++){
              var lp=linePoints[j];
              var lpx=lp[0];
              var lpy=lp[1];              
              var index3 = lpx+width*lpy;
              targetSweepArea[index3]=targetindex;
              targetSweepAreaInverse[index3]=sourceindex;
            }

          }
        }
      }
    }
  }

  function clickPlay(){
    compile();
    spawnBall();
    setVisuals();
  }

  function generateSweepCanvasPair(
                    sourceIndex,targetLeftIndex, targetRightIndex){
    var sourceCanvas = canvasses[sourceIndex];
    var leftTargetCanvas =                  targetLeftIndex>=0  ? canvasses[targetLeftIndex]                  : null;
    var rightTargetCanvas =                 targetRightIndex>=0 ? canvasses[targetRightIndex]                 : null;
    var leftTargetSweepCanvas =             targetLeftIndex>=0  ? sweepAreas[sourceIndex][targetLeftIndex]    : null; 
    var rightTargetSweepCanvas =            targetRightIndex>=0 ? sweepAreas[sourceIndex][targetRightIndex]   : null;
    var leftTargetInverseSweepCanvas =      targetLeftIndex>=0  ? sweepAreas[targetLeftIndex][sourceIndex]    : null; 
    var rightTargetInverseSweepCanvas =     targetRightIndex>=0 ? sweepAreas[targetRightIndex][sourceIndex]   : null;

  //step 1 - generate for just going to flip left/right from resting

      for (var regionNumberStr in pivotPoints){
        var regionNumber=Number(regionNumberStr);
        var ppoint = pivotPoints[regionNumber];
        var bbox = boundingBoxes[regionNumber];
        var orientation=ppoint[2];
        var targetCanvas;
        var targetAngle=30.0;
        var targetPivotCol;
        var targetCanvas;
        var targetSweepArea;
        var targetSweepAreaInverse;
        if (orientation===1){
          targetAngle=-targetAngle;
          targetCanvas=leftTargetCanvas;
          targetSweepArea=leftTargetSweepCanvas;
          targetSweepAreaInverse=leftTargetInverseSweepCanvas;
        } else if (orientation===2){
          targetAngle=targetAngle;
          targetCanvas=rightTargetCanvas;
          targetSweepArea=rightTargetSweepCanvas;
          targetSweepAreaInverse=rightTargetInverseSweepCanvas;
        }
        if (targetCanvas===null){
          continue;
        }

        var px=ppoint[0];
        var py=ppoint[1];
        theta=Math.PI*targetAngle/180.0;
        for (var x=bbox[0];x<=bbox[2];x++){      
          for (var y=bbox[1];y<=bbox[3];y++){
            var i = x+width*y;
            if (regionCanvas[i]===regionNumber){
              var dx=x-px;
              var dy=y-py;
              var targetxExact=px+Math.cos(theta)*dx-Math.sin(theta)*dy
              var targetyExact=py+Math.sin(theta)*dx+Math.cos(theta)*dy;
              var targetx=Math.round(targetxExact);
              var targety=Math.round(targetyExact);

              var diff=-1;
              
              if (orientation===1){
                if (targetxExact<px){
                  diff=+1;
                }
              } else {
                if (targetxExact>=px){
                  diff=+1;
                }
              }

              //forward sweep
              var targetindex = targetx+width*targety;
              while (targetindex>0&&targetindex<width*height){
                var targetVal = targetCanvas[targetindex];
                if (targetVal<=eraserCol||targetVal===bumperAuraCol){
                  break;
                }
                targetindex+=diff*width;
              }

              var sourcex=x;
              var sourcey=y;
              var sourceindex = sourcex+width*sourcey;
              while (sourceindex>0&&sourceindex<width*height){
                var sourceVal = sourceCanvas[sourceindex];
                if (sourceVal<=eraserCol||sourceVal===bumperAuraCol){
                  break;
                }
                sourceindex-=diff*width;
              }


              var linePoints = line(x,y,Math.round(targetx),Math.round(targety));
              for (var j=0;j<linePoints.length;j++){
                var lp=linePoints[j];
                var lpx=lp[0];
                var lpy=lp[1];              
                var index3 = lpx+width*lpy;
                targetSweepArea[index3]=targetindex;
                //canvasses[0][index3]=8;
                targetSweepAreaInverse[index3]=sourceindex;
              }

            }
          }
        }
      }

  }

  var NONE = 0;
  var DOWN = 4;
  var LEFT = 1;
  var RIGHT = 2;
  var sweepAreas = [];

  function generateSweepOffsets() {
    for (var i=0;i<8;i++){
      sweepAreas[i]=[];
    }

    sweepAreas[NONE][LEFT] = new Uint32Array(width*height);
    sweepAreas[NONE][RIGHT] = new Uint32Array(width*height);
    sweepAreas[LEFT][NONE] = new Uint32Array(width*height);
    sweepAreas[RIGHT][NONE] = new Uint32Array(width*height);
    generateSweepCanvasPair(NONE,LEFT,RIGHT);

    sweepAreas[LEFT][LEFT+RIGHT] = new Uint32Array(width*height);
    sweepAreas[LEFT+RIGHT][LEFT] = new Uint32Array(width*height);
    generateSweepCanvasPair(LEFT,-1,LEFT+RIGHT);

    sweepAreas[RIGHT][LEFT+RIGHT] = new Uint32Array(width*height);
    sweepAreas[LEFT+RIGHT][RIGHT] = new Uint32Array(width*height);
    generateSweepCanvasPair(RIGHT,LEFT+RIGHT,-1);

    sweepAreas[DOWN+LEFT][DOWN+LEFT+RIGHT] = new Uint32Array(width*height);
    sweepAreas[DOWN+LEFT+RIGHT][DOWN+LEFT] = new Uint32Array(width*height);
    generateSweepCanvasPair(DOWN+LEFT,-1,DOWN+LEFT+RIGHT);

    sweepAreas[DOWN+RIGHT][DOWN+LEFT+RIGHT] = new Uint32Array(width*height);
    sweepAreas[DOWN+LEFT+RIGHT][DOWN+RIGHT] = new Uint32Array(width*height);
    generateSweepCanvasPair(DOWN+RIGHT,DOWN+LEFT+RIGHT,-1);

    sweepAreas[DOWN][DOWN+LEFT] = new Uint32Array(width*height);
    sweepAreas[DOWN][DOWN+RIGHT] = new Uint32Array(width*height);
    sweepAreas[DOWN+LEFT][DOWN] = new Uint32Array(width*height);
    sweepAreas[DOWN+RIGHT][DOWN] = new Uint32Array(width*height);
    generateSweepCanvasPair(DOWN,DOWN+LEFT,DOWN+RIGHT);

    sweepAreas[DOWN][NONE] = new Uint32Array(width*height);
    sweepAreas[NONE][DOWN] = new Uint32Array(width*height);
    generateSweepSprings(NONE,DOWN);


    sweepAreas[LEFT][DOWN+LEFT] = new Uint32Array(width*height);
    sweepAreas[DOWN+LEFT][LEFT] = new Uint32Array(width*height);
    generateSweepSprings(LEFT,LEFT+DOWN);

    sweepAreas[RIGHT][DOWN+RIGHT] = new Uint32Array(width*height);
    sweepAreas[DOWN+RIGHT][RIGHT] = new Uint32Array(width*height);
    generateSweepSprings(RIGHT,RIGHT+DOWN);


    sweepAreas[LEFT+RIGHT][DOWN+LEFT+RIGHT] = new Uint32Array(width*height);
    sweepAreas[DOWN+LEFT+RIGHT][LEFT+RIGHT] = new Uint32Array(width*height);
    generateSweepSprings(LEFT+RIGHT,LEFT+RIGHT+DOWN);


  }

  function drawBB(){
    var frontCanvas=uint8ar_copy(masterCanvas);
    var leftCanvas=uint8ar_copy(masterCanvas);
    var rightCanvas=uint8ar_copy(masterCanvas);
    var bothCanvas=uint8ar_copy(masterCanvas);
    canvasses[0]=frontCanvas;
    canvasses[1]=leftCanvas;
    canvasses[2]=rightCanvas;
    canvasses[3]=bothCanvas;

    for (var i=0;i<regionCanvas.length;i++){
      var regionNumber = regionCanvas[i];
      if (regionNumber in pivotPoints){
        if(pivotPoints[regionNumber][2]===1){
          leftCanvas[i]=0;
          bothCanvas[i]=0;
        } else {
          rightCanvas[i]=0;
          bothCanvas[i]=0;
        }
      }
    }

    for (var regionNumberStr in pivotPoints){
      var regionNumber=Number(regionNumberStr);
      var ppoint = pivotPoints[regionNumber];
      var bbox = boundingBoxes[regionNumber];
      var orientation=ppoint[2];
      var targetCanvas;
      var targetAngle=30.0;
      var targetPivotCol;
      if (orientation===1){
        targetAngle=-targetAngle;
        targetCanvas=leftCanvas;
        targetPivotCol=leftFlipperPivotCol;
      } else {
        targetCanvas=rightCanvas;
        targetPivotCol=rightFlipperPivotCol;
      }

      var px=ppoint[0];
      var py=ppoint[1];
      theta=Math.PI*targetAngle/180.0;
      for (var x=bbox[0];x<=bbox[2];x++){      
        for (var y=bbox[1];y<=bbox[3];y++){
          var i = x+width*y;
          if (regionCanvas[i]===regionNumber){
            var dx=x-px;
            var dy=y-py;
            var px2=px+Math.cos(theta)*dx-Math.sin(theta)*dy;
            var py2=py+Math.sin(theta)*dx+Math.cos(theta)*dy;
            var points = [
                            [Math.floor(px2),Math.floor(py2)],
                            [Math.floor(px2),Math.ceil(py2)],
                            [Math.ceil(px2),Math.ceil(py2)],
                            [Math.ceil(px2),Math.floor(py2)]
                            ];
            for (var j=0;j<points.length;j++){
              var point2=points[j];
              var px3=point2[0];
              var py3=point2[1];
              if (px3>=0&&py3>=0&&px3<width&&py3<height){
                var index3=px3+width*py3;
                targetCanvas[index3]=flipperCol;
                bothCanvas[index3]=flipperCol;
              }
            }
           /* var linePoints = line(x,y,Math.round(px2),Math.round(py2));
            for (var j=0;j<linePoints.length;j++){
              var lp=linePoints[j];
              var lpx=lp[0];
              var lpy=lp[1];
              var index3 = lpx+width*lpy;
              if (canvas[index3]===0||canvas[index3]===magnetAuraCol){
                canvas[index3]=exitCol;
              }
            }*/
          }
        }
      }

      bothCanvas[px+width*py]=targetPivotCol;
      targetCanvas[px+width*py]=targetPivotCol;

    }
  }

  function cyclePalette(offset){
    var colCount=colorPalette.length-1;

    mainPaletteOffset = (mainPaletteOffset+colCount+offset)%colCount;
    colorPalette = [];
    for (var i=1;i<sourcePalette.length;i++){      
      colorPalette[i]=sourcePalette[((i+mainPaletteOffset-1)%colCount)+1]
    }
    colorPalette[0]=colorPalette[1];


    for (var i=0;i<16;i++){
      elem = document.getElementById("color_"+(i)); 
      if (elem!==null){       
        elem.style.backgroundColor=colorPalette[i];
        colorElem[i]=elem;
      }
    }
    elem = document.getElementById("colorOffsetChoice");
    if (elem!==null){
        elem.style.backgroundColor=colorPalette[0];
    }

    setVisuals(true,true);
  }

  function calcHalo(){
    for (var x=1;x<width-1;x++){
      for (var y=1;y<height-1;y++){
        var val = masterCanvas[x+width*y];
        if (val===0 || val===bumperAuraCol) {
          var neighbours = [
            [x-1,y-1],[x,y-1],[x+1,y-1],
            [x-1,y],      [x+1,y],
            [x-1,y+1],[x,y+1],[x+1,y+1]];
          masterCanvas[x+width*y]=0;
          for (var i=0;i<neighbours.length;i++){
            var n = neighbours[i];
            var nx = n[0];
            var ny = n[1];
            var v = masterCanvas[nx+width*ny];
            if (v===bumperCol){
              masterCanvas[x+width*y]=bumperAuraCol;
              break;
            } 
          }
        }
      }
    }
    var c = canvasses[0];
    for (var i=0;i<masterCanvas.length;i++){
      c[i]=masterCanvas[i];
    }
  }


  function floodFill(canvas,x,y,colorIndex){
    var points = [[x,y]];
    originColor = canvas[x+width*y];
    if (originColor===colorIndex){
      return;
    }

    for (var i=0;i<points.length;i++){
      var p = points[i];
      var pIndex = p[0]+width*p[1];
      if (canvas[pIndex]===colorIndex) {
        continue;
      } else {
        canvas[pIndex]=colorIndex;
        borderPoints = [[p[0]+1,p[1]],[p[0]-1,p[1]],[p[0],p[1]+1],[p[0],p[1]-1]];
        for (var j=0;j<borderPoints.length;j++){
          var borderPoint=borderPoints[j]; 
          var borderpx=borderPoint[0];
          var borderpy=borderPoint[1];
          var bpi=bpx+width*bpy;
          if (
            borderpx>=0 &&
            borderpx<width &&
            borderpy>=0 &&
            borderpy<height &&
            canvas[bpi]===originColor){
            points.push([borderpx,borderpy]);
          }
        }
      }
    }
  }