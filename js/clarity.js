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
        } if (Object.prototype.toString.call(source[key]) === '[object Array]') {
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

/* div: 参数声明 */
// Set the canvas
const cvs = document.getElementById("canvas_1");
const ctx = cvs.getContext("2d");

const cvs_w = cvs.width,
    cvs_h = cvs.height,
    w = cvs_w / setting.width,
    h = cvs_h / setting.height;

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

/* div: 核心函数 */
// 创建 map,snake,apple
var map = [],
    snake_1 = {
        snake: [],
        buffs: { doubleScore: false, bigMouse: false, moreLife: false },
        score: 0
    },
    apple = { x: 1, y: 1 };

/**
 * 启动游戏
 * 画好苹果和蛇
 */
function gameSetUp() {
    refreshMap();
    snake_1.snake = [
        { x: 4, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 2 },
        { x: 1, y: 2 }
    ];
    refreshApple();
    settleApple();
    settleSnake();
    drawMap();
}

/**
 * 按照arrowkey的指向移动蛇
 * 如果反向就不会有反应, 与现状相比做判断
 */
function moveSnake() {
    let snake = snake_1.snake;
    for (let i = 0; i < snake.length; i++) {
        let theSnake = snake[snake.length - i - 1];
        if (i == snake.length - 1) {//对于蛇头
            switch (arrowKey) {
                case "up":
                    if (snake[2].y - snake[1].y == 1 || snake[2].y - snake[1].y == setting.height - 1) { snake[0].y -= 1 }
                    else { snake[0].y -= 1 }
                    break;
                case "down":
                    if (snake[2].y - snake[1].y == -1 || snake[2].y - snake[1].y == 1 - setting.height) { snake[0].y += 1 }
                    else { snake[0].y += 1 }
                    break;
                case "left":
                    if (snake[2].x - snake[1].x == -1 || snake[2].x - snake[1].x == setting.width - 1) { snake[0].x += 1 }
                    else { snake[0].x -= 1 }
                    break;
                case "right":
                    if (snake[2].x - snake[1].x == 1 || snake[2].x - snake[1].x == 1 - setting.width) { snake[0].x -= 1 }
                    else { snake[0].x += 1 }
                    break;
                default:
                    console.log("没有定义的方向(arrowkey)");
                    break;
            }//转方向, 基础判断
        } else {//对于蛇身
            snake[snake.length - i - 1] = deepCopy(snake[snake.length - i - 2], false);//把后面的变成自己前面的        
        }
    }//for循环
}

// 检查碰撞, 返回碰撞结果
function checkCollasion() {
    let snake = snake_1.snake;
    let head = snake[0];//蛇头
    //#region 检查出地图的情况 
    if (head.y < 1) {
        //如果是经典模式, 把出去的放到对应位置
        if (setting.mode == 0) {
            snake[0].y = setting.height;
            checkCollasion();
        } else {
            return 21;
        }
    }
    else if (head.y > setting.height) {
        //如果是经典模式, 把出去的放到对应位置
        if (setting.mode == 0) {
            snake[0].y = 1;
            checkCollasion();
        } else {
            return 22;
        }
    }
    else if (head.x < 1) {
        //如果是经典模式, 把出去的放到对应位置
        if (setting.mode == 0) {
            snake[0].x = setting.width;
            checkCollasion();
        } else {
            return 23;
        }
    }
    else if (head.x > setting.width) {
        //如果是经典模式, 把出去的放到对应位置
        if (setting.mode == 0) {
            snake[0].x = 1;
            checkCollasion();
        } else {
            return 24
        }
    }
    //#endregion
    //检查撞墙
    for (let i = 0; i < setting.wall.length; i++) {
        const w = setting.wall[i];
        if (w.x == head.x && w.y == head.y) {
            return 25;
        }

    }
    //检查撞自己
    for (let i = 1; i < snake.length; i++) {
        const s = snake[i];
        if (s.x == head.x && s.y == head.y) {
            return 26;
        }
    }
}

/**
 * 初始化地图
 */
function refreshMap() {
    for (let i = 0; i < setting.height; i++) {
        map[i] = [];
        for (let j = 0; j < setting.width; j++) {
            map[i][j] = {
                occupy: 0,  //0代表空, 1代表蛇头, 2代表蛇尾, 3代表苹果, 4代表地图mod墙
                color: "transparent",
            }
        }
    }
    for (let i = 0; i < setting.wall.length; i++) {
        const w = setting.wall[i];
        map[w[1] - 1][w[0] - 1] = {
            occupy: 4,
            color: theme.color(3)
        };
    }
}

/**
 * 改变一个对象(苹果)为随机位置(x,y)
 * @param {"apple"} apple 一般放置苹果对象
 */
function getNewLoc(apple) {
    apple.x = Math.random() * setting.width + 1 >> 0;
    apple.y = Math.random() * setting.height + 1 >> 0;
}

/**
 * 为苹果找一个没有被占用的位置
 */
function refreshApple() {
    getNewLoc(apple);
    //排除在蛇身上的情况
    for (let i = 0; i < snake_1.snake.length; i++) {
        const s = snake_1.snake[i];
        if (s.x == apple.x && s.y == apple.y) refreshApple();
    }
    //排除撞墙
    for (let i = 0; i < setting.wall.length; i++) {
        const w = setting.wall[i];
        if (w[0] == apple.x && w[1] == apple.y) refreshApple();
    }
}

/**
 * 把apple画到map上
 */
function settleApple() {
    let appleLoc = map[apple.y - 1][apple.x - 1];
    appleLoc.occupy = 3;
    appleLoc.color = theme.color(6);
}

/**
 * 把snake画到map上
 */
function settleSnake() {
    for (let i = 0; i < snake_1.snake.length; i++) {
        const theSnake = snake_1.snake[i];
        let theSnakeLoc = map[theSnake.y - 1][theSnake.x - 1];
        theSnakeLoc.occupy = i == 0 ? 1 : 2;
        theSnakeLoc.color = theme.color(i == 0 ? 5 : 4);
    }
}

/**
 * 把map数组渲染出来
 */
function drawMap() {
    for (let i = 0; i < setting.height; i++) {
        for (let j = 0; j < setting.width; j++) {
            drawSquare(j, i, map[i][j].color)
        }
    }

}

/**
 * 按照buff情况调整分数, 输入零就代表获得buff, 否则只算分
 * @param {'snake_1'} snake 对象蛇
 * @param {*} score 得到的分数, 默认为0, 即获得了buff
 * @param {"doubleScore"|"bigMouse"|"moreLife"|"scissorCut"} buff 输入获得的buff对应的代号
 * @returns 返回当前分数, 如果获得buff返回false
 */
function changeScore(snake, score = 0, buff) {
    //传入0就按照buff分类生效
    if (score == 0) {
        getBuff(buff);
        return false;
    } else if (score > 0) {
        //否则按buff修改分数
        if (buffs.doubleScore) {
            score *= 2;
        }
        //最后再结账
        snake.score += score;
    }
    return snake.score;
}

/**
 * 实现buff的效果
 * @param {"doubleScore"|"bigMouse"|"moreLife"|"scissorCut"} buff 输入获得的buff对应的代号
 */
function getBuff() {
    //ToDo: 一个switch
}

//core
function clarity() {
    //初始化地图数组
    refreshMap();
    //改变代表蛇的数组信息
    moveSnake();
    //检查按照移动方向的下一步的collation
    let result = checkCollasion();
    switch (result) {
        //没事儿先退
        case 0:
            break;
        //吃到苹果就算分, 并且刷新苹果位置
        case 1:
            changeScore(snake_1, 1);
            refreshApple();
            break;
        //collation就结束
        //对应不同的result做不同的ending(例如死亡分类计数)
        case 21:
            alert("你撞到了上边的墙");
            //recordScore();
            //recorDeath();
            //refreshHighScore();
            gameSetUp();
            break;
        case 22:
            alert("你撞到了下边的墙");
            //recordScore();
            //recorDeath();
            //refreshHighScore();
            gameSetUp();
            break;
        case 23:
            alert("你撞到了左边的墙");
            //recordScore();
            //recorDeath();
            //refreshHighScore();
            gameSetUp();
            break;
        case 24:
            alert("你撞到了右边的墙");
            //recordScore();
            //recorDeath();
            //refreshHighScore();
            gameSetUp();
            break;
        case 25:
            alert("你撞到了实心墙");
            //recordScore();
            //recorDeath();
            //refreshHighScore();
            gameSetUp();
            break;
        case 26:
            alert("你撞到了自己");
            //recordScore();
            //recorDeath();
            //refreshHighScore();
            gameSetUp();
            break;


    }//死亡情况判断的switch
    //把蛇和苹果的位置到map数组中
    settleSnake();
    settleApple();
    //先把地图擦干净
    ctx.clearRect(0, 0, cvs_w, cvs_h);
    //把map数组渲染出来
    drawMap();
}

/* 
    map[i][j] = {
        occupy: 0,  //0代表空, 1代表蛇头, 2代表蛇尾, 3代表苹果, 4代表地图mod墙
        color: "transparent",
    }
*/

gameSetUp();