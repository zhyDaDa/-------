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
                        occupy: TYPE_occupy.empty,
                        color: "transparent",
                    };
                }
            }
            for (let i = 0; i < setting.wall.length; i++) {
                const w = setting.wall[i];
                this._map[w[1] - 1][w[0] - 1] = {
                    occupy: TYPE_occupy.wall,
                    color: theme.wallColor,
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

    consoleMap() {
        let str = "\n";
        for (let i = 0; i < setting.height; i++) {
            str += "\t";
            for (let j = 0; j < setting.width; j++) {
                str += this._map[i][j].occupy;
                str += "  ";
            }
            str += "\n";
        }
        console.log(str);
    }
}

class SNAKE {
    constructor(playerConsequenceNumber, name) {
        this._playerConsequenceNumber = playerConsequenceNumber;
        this._name = name;
        this._snake = [];
        this._buffs = [];
        this._score = 0;
        this.nextArrowKey = TYPE_arrowKey.right;
        this.initPosition();
        this.registInfo();
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
                console.error("玩家序号错误或超出上限");
                break;
        }
        //todo: 根据地图更合理的排位方式
    }

    getNextLocation() {
        let nextLocation = deepCopy(this._snake[0]);
        let thisSnake = this._snake[0];

        function _moveUP() {
            nextLocation.y = thisSnake.y == 1 ? setting.height : thisSnake.y - 1
        }

        function _moveDown() {
            nextLocation.y = thisSnake.y == setting.height ? 1 : thisSnake.y + 1
        }

        function _moveLeft() {
            nextLocation.x = thisSnake.x == 1 ? setting.width : thisSnake.x - 1
        }

        function _moveRight() {
            nextLocation.x = thisSnake.x == setting.width ? 1 : thisSnake.x + 1
        }
        switch (this.nextArrowKey) {
            case TYPE_arrowKey.up:
                if (this._snake[1].y - thisSnake.y == -1 || this._snake[1].y - thisSnake.y == setting.height - 1) { _moveDown() } else { _moveUP() }
                break;
            case TYPE_arrowKey.down:
                if (this._snake[1].y - thisSnake.y == 1 || this._snake[1].y - thisSnake.y == 1 - setting.height) { _moveUP() } else { _moveDown() }
                break;
            case TYPE_arrowKey.left:
                if (this._snake[1].x - thisSnake.x == -1 || this._snake[1].x - thisSnake.x == setting.width - 1) { _moveRight() } else { _moveLeft() }
                break;
            case TYPE_arrowKey.right:
                if (this._snake[1].x - thisSnake.x == 1 || this._snake[1].x - thisSnake.x == 1 - setting.width) { _moveLeft() } else { _moveRight() }
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
    move() {
        let nextLocation = this.getNextLocation();
        for (let i = this._snake.length - 1; i > -1; i--) {
            if (i == 0) { //对于蛇头
                this._snake[0] = nextLocation;
            } else { //对于蛇身
                this._snake[i] = deepCopy(this._snake[i - 1], false); //把后面的变成自己前面的        
            }
        } //for循环
    }

    /**
     * 把snake画到map上
     */
    settleToMap(map) {
        for (let i = this._snake.length - 1; i > -1; i--) {
            const theSnake = this._snake[i];
            let theSnakeLoc = map[theSnake.y - 1][theSnake.x - 1];
            theSnakeLoc.occupy = i == 0 ? 1 : 2;
            theSnakeLoc.color = theme.snakeColors[this._playerConsequenceNumber - 1][i == 0 ? 0 : 1];
        }
    }

    registInfo() {
        // 指定DOM元素
        let tr_element = document.getElementsByClassName("player-info")[this._playerConsequenceNumber - 1];
        let name_element = tr_element.getElementsByClassName("name")[0];
        let score_element = tr_element.getElementsByClassName("score")[0];
        let length_element = tr_element.getElementsByClassName("length")[0];

        // 修改DOM元素, 填写信息
        name_element.innerHTML = this._name;
        score_element.innerHTML = this._score;
        length_element.innerHTML = this._snake.length;

        // 为元素染色
        name_element.style.backgroundColor = theme.snakeColors[this._playerConsequenceNumber - 1][0];
        score_element.style.backgroundColor = theme.snakeColors[this._playerConsequenceNumber - 1][1];
        length_element.style.backgroundColor = theme.snakeColors[this._playerConsequenceNumber - 1][1];
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
        this._score += score;
        this.registInfo();
    }

    lengthen() {
        let newTail = deepCopy(this._snake[this._snake.length - 1]);
        this._snake.push(newTail);
        this.registInfo();
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
        appleLoc.color = theme.appleColor;
    }

    /**
     * 为苹果找一个没有被占用的位置
     */
    refreshApple(map) {
        this.getNewLoc();
        if (map[this._location.y - 1][this._location.x - 1].occupy != 0) this.refreshApple(map);
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
        this._apples = [];
        this._apples.push(new APPLE(this._map));
    }

    start() {
        this.init();
        this._pause = false;
        this._end = false;

        this.interval = setInterval(() => {
            if (!this._pause && !this._end) {
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

    checkSituation() {
        let results = this._snakes.map((snake, index) => {
            let nextLocation = snake.getNextLocation();
            let mapOccupation = this._map[nextLocation.y - 1][nextLocation.x - 1].occupy;
            switch (mapOccupation) {
                case TYPE_occupy.empty:
                    return TYPE_situation.none;
                case TYPE_occupy.apple:
                    return TYPE_situation.eatApple;
                case TYPE_occupy.snake:
                    return TYPE_situation.collideSnake;
                case TYPE_occupy.wall:
                    return TYPE_situation.collideWall;

                default:
                    console.error(`Error: 第${index}条蛇遇到了 unknown map occupation type`);
                    return TYPE_situation.none;
            }
        });
        return results;
    }


    //core
    core() {
        //检查按照移动方向的下一步的collation
        let results = this.checkSituation();
        let appleRestFlag = false;
        //清空地图, 开始制作新的一帧
        this._MAP.refreshMap();
        for (let i = 0; i < results.length; i++) {
            let result = results[i];
            let snake = this._snakes[i];
            switch (result) {
                case TYPE_situation.eatApple:
                    snake.eatApple();
                    appleRestFlag = true;
                    break;
                case TYPE_situation.collideSnake:
                case TYPE_situation.collideWall:
                    snake.die();
                    this.end();
                    break;
                case TYPE_situation.none:
                    break;
                default:
                    console.error(`Error: 未知的情况 ${result}`);
                    break;
            }
            snake.move();
            snake.settleToMap(this._map);
        }

        if (appleRestFlag) {
            this._apples[0].refreshApple(this._map);
        }
        this._apples[0].settleApple(this._map);
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
const TYPE_occupy = {
    empty: 0,
    snakeHead: 1,
    snakeBody: 2,
    apple: 3,
    wall: 4,
}
const TYPE_arrowKey = {
    up: 0,
    down: 1,
    left: 2,
    right: 3
}
const TYPE_buff = {
    ScoreModifier: 0,
    MovementModifier: 1,
    PropertyModifier: 2,
}
const TYPE_situation = {
    none: 0,
    eatApple: 1,
    collideWall: 2,
    collideSnake: 3,
}