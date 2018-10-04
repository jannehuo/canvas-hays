import _ from 'lodash';
const c = document.getElementById('canvas');
const context = c.getContext('2d');
const screen = {
  w: window.innerWidth,
  h: window.innerHeight
};
let mouse = {
  x:false,
  y:false
};

let mousePos = {
  x:0,
  y:0
};

c.width = screen.w;
c.height = screen.h;
const amount = 1000;

class Particle {
  constructor(id,x,y) {
    const xSpread = _.random(-350,350);
    const ySpread = _.random(-350,350)
    const xPos = x + xSpread;
    const yPos = y + ySpread;
    this.id = id;
    this.x = xPos;
    this.y = yPos;
    this.x0 = xPos;
    this.y0 = yPos;
    this.xVel = 0;
    this.yVel = 0;
    this.colors = ["#f2f2f2","#dbdbdb","#ececec","#c6c6c6"];
    this.color = _.sample(this.colors);
    this.radius = _.random(3,8);
  }
  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
  }
  drawBottom() {
    context.beginPath();
    context.arc(this.x0, this.y0, 2, 0, 2 * Math.PI);
    context.fillStyle = '#f2f2f2';
    context.fill();
  }
  lineToBottom() {
    context.beginPath();
    context.moveTo(this.x,this.y);
    context.lineTo(this.x0,this.y0);
    context.strokeStyle='#f2f2f2';
    context.stroke();
  }
  update() {
    this.interact();
    this.x += this.xVel;
    this.y += this.yVel;
    
    if(this.y < 0) {
      this.y = 0;
    }

    if(this.y > screen.h) {
      this.y = screen.h
    }

    if(this.x < 0) {
      this.x = 0;
    }

    if(this.x > screen.w) {
      this.x = screen.w
    }
    
    this.xVel = 0;
    this.yVel = 0;
    this.drawBottom();
    this.draw();
    this.lineToBottom();
  }
  interact() {
    const relativeToMouse = this.getRelativeTo(this,mousePos);
    const distance = this.getDistance(relativeToMouse);
    const direction = this.getDirection(relativeToMouse, distance);
    const force = this.getRepel(distance);
    if(force > 0) {
      this.repel(direction, force);
    } else {
      this.resume();
    }
  }
  repel(direction,force) {
    this.xVel += direction.x * force * 3;
    this.yVel += direction.y * force * 3;
  }
  resume() {
    const relativeToDefault = this.getRelativeTo({x:this.x0,y:this.y0},this);
    const distance = this.getDistance(relativeToDefault);
    const direction = this.getDirection(relativeToDefault, distance);
    const force = distance * (1/10);
    this.xVel += direction.x * force;
    this.yVel += direction.y * force;
  }
  getRelativeTo(v1,v2) {
    const relativeToTarget = {
      x: v1.x - v2.x,
      y: v1.y - v2.y
    };
    return relativeToTarget;
  }
  getDistance(relative) {
    const distance = Math.sqrt(
      relative.x * relative.x + 
      relative.y * relative.y
    );
    
    return distance;
  }
  getRepel(distance) {
    let maxDistance = 200;
    let force = (maxDistance - distance) / maxDistance;

    if(force < 0 ) {
      force = 0;
    }
    return force;
  }
  getDirection(relativeToTarget, distance) {
    if(distance === 0) {
      return {
        x: 0,
        y: 0
      };
    }
    return {
      x: relativeToTarget.x / distance,
      y: relativeToTarget.y / distance
    };
  }
  randomPointFromCircle() {
    const radius = 200;
    const angle = Math.random() * 2 * Math.PI;
    const radius_sq = Math.random() * radius * radius;
    const x = Math.sqrt(radius_sq) * Math.cos(angle);
    const y = Math.sqrt(radius_sq) * Math.sin(angle);
    return {
      x: x,
      y: y
    };
  }
}

class HayField {
  constructor(size) {
    this.size = size;
    this.hays = [];
    this.createHays();
  }
  createHays() {
    _.times(this.size, (i) => {
      this.hays.push(new Particle(
        i,
        screen.w / 2,
        screen.h / 2
      ));
    });
  }
  draw() {
    this.hays.forEach(hay => hay.update());
  }
}

window.addEventListener('mousemove', (e) => {
  mousePos = {
    x: e.clientX,
    y: e.clientY
  };
},true);

const animate = () => {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, screen.w, screen.h);
  hayField.draw();
};

const hayField = new HayField(amount);
animate();