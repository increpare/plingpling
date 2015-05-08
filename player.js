var embeddedDat="__EMBED__";

var PLAYER=true;

function goFullscreen(evt){    
  evt = evt || window.event;
 if (evt.keyCode===70) { //f
    var elem = document.getElementById("mainCanvas");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }
}
document.addEventListener("keydown", goFullscreen);