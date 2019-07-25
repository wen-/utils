window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

class smoothwheel {
  constructor(obj = {}) {
    if(!obj.elem){
      return;
    }
    this.elem = document.getElementById(obj.elem);
    this.running = false;
    let that = this,
      container,
      currentY = 0,
      targetY = 0,
      oldY = 0,
      maxScrollTop = 0,
      minScrollTop,
      direction,
      onRenderCallback = null,
      fricton = 0.95, //值越大减速越慢
      vy = 0,
      stepAmt = 1,
      minMovement = 0.1;

    let updateScrollTarget = (amt) => {
      targetY += amt;
      vy += (targetY - oldY) * stepAmt;
      oldY = targetY;
    };
    let render = () => {
      if (vy < -minMovement || vy > minMovement) {
        currentY = currentY + vy;
        if (currentY > maxScrollTop) {
          currentY = vy = 0;
        } else if (currentY < minScrollTop) {
          vy = 0;
          currentY = minScrollTop;
        }

        container.scrollTop = -currentY;

        vy *= fricton;

        if (onRenderCallback) {
          onRenderCallback();
        }
      }
    };
    this.animateLoop = () => {
      if (!this.running) return;
      requestAnimFrame(this.animateLoop);
      render();
    };
    this.onWheel = (e) => {
      e.preventDefault();
      let evt = e;

      let delta = evt.detail ? evt.detail * -1 : evt.wheelDelta / 40;
      let dir = delta < 0 ? -1 : 1;
      if (dir != direction) {
        vy = 0;
        direction = dir;
      }

      //重置当前，以防发生非滚轮滚动(滚动条拖动等)
      currentY = -container.scrollTop;

      updateScrollTarget(delta);
    };

    if (!("ontouchstart" in window)) {
      container = this.elem;
      container.addEventListener("mousewheel", this.onWheel);
      container.addEventListener("DOMMouseScroll", this.onWheel);

      //将target/old/current Y设置为与当前滚动位置匹配，以防止跳转到容器顶部
      targetY = oldY = container.scrollTop;
      currentY = -targetY;

      minScrollTop = container.clientHeight - container.scrollHeight;
      if (obj.onRender) {
        onRenderCallback = obj.onRender;
      }
      if (!this.running) {
        this.running = true;
        this.animateLoop();
      }
    }
  }

  disabled() {
    this.running = false;
    this.elem.removeEventListener("mousewheel", this.onWheel);
    this.elem.removeEventListener("DOMMouseScroll", this.onWheel);
  }

  enabled() {
    this.running = true;
    this.animateLoop();
    this.elem.addEventListener("mousewheel", this.onWheel);
    this.elem.addEventListener("DOMMouseScroll", this.onWheel);
  }
}

export default smoothwheel;
