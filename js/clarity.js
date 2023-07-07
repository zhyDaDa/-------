/* div: 工具篇 */
/**
 * 深度复制
 * @param {*} source 被复制的对象
 * @param {true,false} isArray 如果是数组输入true, 默认是对象
 * @returns 复制成功的对象
 */
function deepCopy(source, isArray = false) {
    var result = {};
    if (isArray) var result = [];
    for (var key in source) {
        if (Object.prototype.toString.call(source[key]) === '[object Object]') {
            result[key] = deepCopy(source[key]);
        }
        if (Object.prototype.toString.call(source[key]) === '[object Array]') {
            result[key] = deepCopy(source[key], 1);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}
/**
 * 取两个数字中较小的那个返回
 * @param {*} a 
 * @param {*} b 
 * @returns 返回最小值
 */
function getMin(a, b) {
    return a > b ? b : a;
}

// Load img & audio
// let imageName = new Image();
// imageName.src = "./pic/apple.png"
// let audioName = new Audio();
// audioName.src = "./audio/bgmusic.mp3";
// audioName.play();

/* div: 作图工具 */

/**
 * 画一个圆圈, 以(X,Y)为中心
 * @param {*} x 
 * @param {*} y 
 * @param {*} radius 
 * @param {true,false} fillCircle true会填充圆圈(不带边框), false只画出轮廓
 */
function drawCircle(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

/**
 * 画一个实心的苹果, 在方格内
 * @param {*} X 
 * @param {*} Y 
 * @param {setting.appleColor} appleColor 苹果的颜色
 */
function drawApple(X, Y, appleColor) {
    ctx.fillStyle = appleColor;
    drawCircle((X + .5) * w, (Y + .5) * h, getMin(w, h) / 2, true);
    ctx.strokeStyle = "#000";
    drawCircle((X + .5) * w, (Y + .5) * h, getMin(w, h) / 2, false);
}

/**
 * X,Y是方块左上角的坐标(从0开始的)
 * @param {*} X 左上角坐标
 * @param {*} Y 左上角坐标
 * @param {*} color 
 */
function drawSquare(X, Y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(X * w, Y * h, w, h);
}

/* div: 核心类 */
// 创建 map,snake,apple

class MAP {
    constructor() {
        this._map = [];
        this.refreshMap();
    }


    /**
     * 初始化地图
     */
    refreshMap() {
            for (let i = 0; i < setting.height; i++) {
                this._map[i] = [];
                for (let j = 0; j < setting.width; j++) {
                    this._map[i][j] = {
                        occupy: this.occupyType.empty,
                        color: "transparent",
                    };
                }
            }
            for (let i = 0; i < setting.wall.length; i++) {
                const w = setting.wall[i];
                this._map[w[1] - 1][w[0] - 1] = {
                    occupy: this.occupyType.wall,
                    color: theme.color(3)
                };
            }
        }
        /**
         * 把map数组渲染出来
         */
    render() {
        for (let i = 0; i < setting.height; i++) {
            for (let j = 0; j < setting.width; j++) {
                drawSquare(j, i, this._map[i][j].color);
            }
        }

    }
}

class SNAKE {
    constructor(playerConsequenceNumber) {
        this._playerConsequenceNumber = playerConsequenceNumber;
        this._snake = [];
        this._buffs = [];
        this._score = 0;
        this.nextArrowKey = null;
        this.initPosition();
    }

    /**
     * 初始化蛇的位置
     * @param {*} map 地图
     * @returns
     * @memberof SNAKE
     * @description 根据玩家编号, 在地图上初始化蛇的位置
     */
    initPosition() {
        // let w = setting.width;
        // let h = setting.height;
        switch (this._playerConsequenceNumber) {
            case 1:
                this._snake = [
                    { x: 4, y: 2 },
                    { x: 3, y: 2 },
                    { x: 2, y: 2 },
                    { x: 1, y: 2 }
                ];
                break;
            case 2:
                this._snake = [
                    { x: 4, y: 4 },
                    { x: 3, y: 4 },
                    { x: 2, y: 4 },
                    { x: 1, y: 4 }
                ];
                break;
            case 3:
                this._snake = [
                    { x: 4, y: 6 },
                    { x: 3, y: 6 },
                    { x: 2, y: 6 },
                    { x: 1, y: 6 }
                ];
                break;
            case 4:
                this._snake = [
                    { x: 4, y: 8 },
                    { x: 3, y: 8 },
                    { x: 2, y: 8 },
                    { x: 1, y: 8 }
                ];
                break;
            default:
                alert("玩家序号错误或超出上限");
                break;
                this.nextArrowKey = this.arrowKey.right;
        }
        //todo: 根据地图更合理的排位方式
    }

    arrowKey = {
        up: 0,
        down: 1,
        left: 2,
        right: 3
    }

    getNextLocation() {
        let nextLocation = deepCopy(this._snake[0]);
        switch (this.nextArrowKey) {
            case this.arrowKey.up:
                if (this._snake[1].y - this._snake[0].y == 1 || this._snake[1].y - this._snake[0].y == setting.height - 1) { nextLocation.y += 1 } else { nextLocation.y = this._snake[0].y == 1 ? setting.height : this._snake[0].y - 1 }
                break;
            case this.arrowKey.down:
                if (this._snake[1].y - this._snake[0].y == -1 || this._snake[1].y - this._snake[0].y == 1 - setting.height) { nextLocation.y -= 1 } else { nextLocation.y = this._snake[0].y == setting.height ? 1 : this._snake[0].y + 1 }
                break;
            case this.arrowKey.left:
                if (this._snake[1].x - this._snake[0].x == -1 || this._snake[1].x - this._snake[0].x == setting.width - 1) { nextLocation.x += 1 } else { nextLocation.x = this._snake[0].x == 1 ? setting.width : this._snake[0].x - 1 }
                break;
            case this.arrowKey.right:
                if (this._snake[1].x - this._snake[0].x == 1 || this._snake[1].x - this._snake[0].x == 1 - setting.width) { nextLocation.x -= 1 } else { nextLocation.x = this._snake[0].x == setting.width ? 1 : this._snake[0].x + 1 }
                break;
            default:
                console.error("没有定义的方向: " + this.nextArrowKey);
                break;
        }
        return nextLocation;
    }

    /**
     * 按照arrowkey的指向移动蛇
     * 如果反向就不会有反应, 与现状相比做判断
     */
    move(arrowKey) {
        for (let i = 0; i < this._snake.length; i++) {
            if (i == 0) { //对于蛇头
                this._snake[0] = this.getNextLocation(arrowKey);
            } else { //对于蛇身
                this._snake[this._snake.length - i - 1] = deepCopy(this._snake[this._snake.length - i - 2], false); //把后面的变成自己前面的        
            }
        } //for循环
    }

    /**
     * 把snake画到map上
     */
    settleToMap(map) {
        for (let i = 0; i < this._snake.length; i++) {
            const theSnake = this._snake[i];
            let theSnakeLoc = map[theSnake.y - 1][theSnake.x - 1];
            theSnakeLoc.occupy = i == 0 ? 1 : 2;
            theSnakeLoc.color = theme.color(i == 0 ? 5 : 4);
        }
    }

    eatApple() {
        this.changeScore(setting.appleScore);
        this.lengthen();
    }

    /**
     * 按照buff情况调整分数, 输入零就代表获得buff, 否则只算分
     * @param {'snake_1'} snake 对象蛇
     * @param {*} score 得到的分数, 默认为0, 即获得了buff
     * @param {"doubleScore"|"bigMouse"|"moreLife"|"scissorCut"} buff 输入获得的buff对应的代号
     * @returns 返回当前分数, 如果获得buff返回false
     */
    changeScore(score = 0) {
        for (buff of this._buffs) {
            if (buff.type == BUFF.TYPE.ScoreModifier) buff.effect(score);
        }
    }

    lengthen() {
        //todo: 蛇变长, 原理同蛇移动时找新位置
    }

    die() {
        //todo: 死亡掉落, 对应玩家的gameover画面
    }

    /**
     * 实现buff的效果
     * @param {"doubleScore"|"bigMouse"|"moreLife"|"scissorCut"} buff 输入获得的buff对应的代号
     */
    getBuff() {
        //ToDo: 一个switch
    }

    useBuffs(buff) {
        //todo: buff使用
    }
}

class BUFF {
    constructor(buffName, type, effect) {
        this._buffName = buffName;
        this._type = type;
        this._effect = effect; // effect 接受的参数: score, object(其余可直接this获得)
        this._properties = [];
        this._description = "";
    }
    TYPE = {
        ScoreModifier: 0,
        MovementModifier: 1,
        PropertyModifier: 2,
    }
}

class APPLE {
    constructor(map) {
        this._location = { x: 1, y: 1 };
        this.reset(map);
    }

    /**
     * 改变一个对象(苹果)为随机位置(x,y)
     */
    getNewLoc() {
        this._location.x = Math.random() * setting.width + 1 >> 0;
        this._location.y = Math.random() * setting.height + 1 >> 0;
    }

    /**
     * 把apple画到map上
     */
    settleApple(map) {
        let appleLoc = map[this._location.y - 1][this._location.x - 1];
        appleLoc.occupy = 3;
        appleLoc.color = theme.color(6);
    }

    /**
     * 为苹果找一个没有被占用的位置
     */
    refreshApple(map) {
        this.getNewLoc();
        if (map[this._location.y - 1][this._location.x - 1].occupy != 0) this.refreshApple();
    }

    reset(map) {
        this.refreshApple(map);
        this.settleApple(map);
    }
}

class GAME {
    constructor(playerCount = 1, intervalTime = 0.25) {
        this._playerCount = playerCount;
        this._snakes = [];
        this._apples = [];
        this._map = [];
        this._pause = true;
        this._end = true;
        this._intervalTime = intervalTime;
        this.init();
    }

    init() {
        this._pause = true;
        this._end = true;
        this._snakes = [];
        for (let i = 0; i < this._playerCount; i++) {
            this._snakes.push(new SNAKE(i + 1));
        }
        this._MAP = new MAP();
        this._map = this._MAP._map;
        this._apples.push(new APPLE(this._map));
    }

    start() {
        this.init();
        this._pause = false;
        this._end = false;

        this.interval = setInterval(() => {
            if (!this._pause) {
                this.core();
            }
        }, this._intervalTime * 1000);
    }

    end() {
        this._end = true;
        clearInterval(this.interval);
    }

    pause() {
        this._pause = true;
    }

    resume() {
        this._pause = false;
    }

    pauseORresume() {
        this._pause = !this._pause;
    }

    situation = {
        none: 0,
        eatApple: 1,
        collideWall: 2,
        collideSnake: 3,
    }

    checkSituation() {
        let results = this._snakes.map((snake, index) => {
            let nextLocation = snake.getNextLocation();
            let mapOccupation = this._map[nextLocation.y - 1][nextLocation.x - 1].occupy;
            switch (mapOccupation) {
                case MAP.occupyType.empty:
                    return this.situation.none;
                case MAP.occupyType.apple:
                    return this.situation.eatApple;
                case MAP.occupyType.snake:
                    return this.situation.collideSnake;
                case MAP.occupyType.wall:
                    return this.situation.collideWall;

                default:
                    console.error(`Error: 第${index}条蛇遇到了 unknown map occupation type`);
                    return this.situation.none;
            }
        });
        return results;
    }


    //core
    core() {
        //检查按照移动方向的下一步的collation
        let results = this.checkSituation();
        let appleRestFlag = false;
        for (let i = 0; i < results.length; i++) {
            result = results[i];
            snake = this._snakes[i];
            switch (result) {
                case this.situation.eatApple:
                    snake.eatApple();
                    appleRestFlag = true;
                    break;
                case this.situation.collideSnake:
                case this.situation.collideWall:
                    snake.die();
                    this.end();
                    break;
                default:
                    console.error(`Error: 未知的情况 ${result}`);
                    break;
            }
            snake.move();
            snake.settleToMap(this._map);
        }

        if (appleRestFlag) {
            this._apples[0].reset(this._map);
        }
        //先把地图擦干净
        ctx.clearRect(0, 0, cvs_w, cvs_h);
        //把map数组渲染出来
        this._MAP.render();
    }

}

/* div: 全局变量声明 */
// Set the canvas
const cvs = document.getElementById("canvas_1");
const ctx = cvs.getContext("2d");

const cvs_w = cvs.width,
    cvs_h = cvs.height,
    w = cvs_w / setting.width,
    h = cvs_h / setting.height;

/* div: 枚举 */
const occupyType = {
    empty: 0,
    snakeHead: 1,
    snakeBody: 2,
    apple: 3,
    wall: 4,
}