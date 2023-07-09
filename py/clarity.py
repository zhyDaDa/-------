import random
import threading


def setInterval(function, interval):
    def wrapper():
        function()
        setInterval(function, interval)  # 递归调用自身，实现循环执行
    timer = threading.Timer(interval, wrapper)
    timer.start()
    return timer


def clearInterval(timer):
    timer.cancel()


class setting:
    width = 16
    height = 16
    appleScore = 10
    intervalTime = 0.25


class TYPE_occupy:
    empty = 0
    snakeHead = 1
    snakeBody = 2
    apple = 3
    wall = 4


class TYPE_arrowKey:
    up = 0
    down = 1
    left = 2
    right = 3


class TYPE_buff:
    ScoreModifier = 0
    MovementModifier = 1
    PropertyModifier = 2


class TYPE_situation:
    none = 0
    eatApple = 1
    collideWall = 2
    collideSnake = 3


class MAP:
    def __init__(self):
        self._map = []
        self.refreshMap()

    def __repr__(self):
        return self._map

    def refreshMap(self):
        for i in range(setting.height):
            self._map.append([])
            for j in range(setting.width):
                self._map[i].append(TYPE_occupy.empty)
        for i in range(len(setting.wall)):
            w = setting.wall[i]
            self._map[w[1] - 1][w[0] - 1] = TYPE_occupy.wall

    def consoleMap(self):
        str = "\n"
        for i in range(setting.height):
            str += "\t"
            for j in range(setting.width):
                str += self._map[i][j]['occupy']
                str += "  "
            str += "\n"
        print(str)


class SNAKE:
    def __init__(self, playerConsequenceNumber, name):
        self._playerConsequenceNumber = playerConsequenceNumber
        self._name = name
        self._snake = []
        self._buffs = []
        self._score = 0
        self.nextArrowKey = TYPE_arrowKey.right
        self.initPosition()
        self.registInfo()

    def initPosition(self):
        switch = {
            1: [
                {"x": 4, "y": 2},
                {"x": 3, "y": 2},
                {"x": 2, "y": 2},
                {"x": 1, "y": 2}
            ],
            2: [
                {"x": 4, "y": 4},
                {"x": 3, "y": 4},
                {"x": 2, "y": 4},
                {"x": 1, "y": 4}
            ],
            3: [
                {"x": 4, "y": 6},
                {"x": 3, "y": 6},
                {"x": 2, "y": 6},
                {"x": 1, "y": 6}
            ],
            4: [
                {"x": 4, "y": 8},
                {"x": 3, "y": 8},
                {"x": 2, "y": 8},
                {"x": 1, "y": 8}
            ]
        }
        self._snake = switch.get(self._playerConsequenceNumber, [])

    def getNextLocation(self):
        nextLocation = self._snake[0].copy()
        thisSnake = self._snake[0]

        def _moveUP():
            nonlocal nextLocation
            if thisSnake["y"] == 1:
                nextLocation["y"] = setting.height
            else:
                nextLocation["y"] = thisSnake["y"] - 1

        def _moveDown():
            nonlocal nextLocation
            if thisSnake["y"] == setting.height:
                nextLocation["y"] = 1
            else:
                nextLocation["y"] = thisSnake["y"] + 1

        def _moveLeft():
            nonlocal nextLocation
            if thisSnake["x"] == 1:
                nextLocation["x"] = setting.width
            else:
                nextLocation["x"] = thisSnake["x"] - 1

        def _moveRight():
            nonlocal nextLocation
            if thisSnake["x"] == setting.width:
                nextLocation["x"] = 1
            else:
                nextLocation["x"] = thisSnake["x"] + 1

        switch = {
            TYPE_arrowKey.up: lambda: _moveUP(),
            TYPE_arrowKey.down: lambda: _moveDown(),
            TYPE_arrowKey.left: lambda: _moveLeft(),
            TYPE_arrowKey.right: lambda: _moveRight()
        }
        switch.get(self.nextArrowKey, lambda: print(
            "没有定义的方向: " + self.nextArrowKey))()
        return nextLocation

    def move(self):
        nextLocation = self.getNextLocation()
        for i in range(len(self._snake) - 1, -1, -1):
            if i == 0:
                self._snake[i] = nextLocation
            else:
                self._snake[i] = self._snake[i - 1].copy()

    def settleToMap(self, map):
        for i in range(len(self._snake) - 1, -1, -1):
            theSnake = self._snake[i]
            map[theSnake["y"] - 1][theSnake["x"] - 1] = (
                self._playerConsequenceNumber*10+1) if i == 0 else (self._playerConsequenceNumber*10+2)

    def eatApple(self):
        self.changeScore(setting.appleScore)
        self.lengthen()

    def changeScore(self, score=0):
        for buff in self._buffs:
            if buff["type"] == BUFF.TYPE.ScoreModifier:
                score = buff["effect"](score)
        self._score += score

    def lengthen(self):
        newTail = self._snake[-1].copy()
        self._snake.append(newTail)

    def die(self):
        # ToDo: Death drop, corresponding player's gameover screen
        pass

    def getBuff(self):
        # ToDo: A switch
        pass

    def useBuffs(self, buff):
        # ToDo: Buff usage
        pass


class BUFF:
    def __init__(self, buffName, type, effect):
        self._buffName = buffName
        self._type = type
        self._effect = effect  # effect 接受的参数: score, object(其余可直接this获得)
        self._properties = []
        self._description = ""


class APPLE:
    def __init__(self, map):
        self._location = {"x": 6, "y": 6}
        self.reset(map)

    def getNewLoc(self):
        self._location["x"] = int(random.random() * setting.width + 1)
        self._location["y"] = int(random.random() * setting.height + 1)

    def settleApple(self, map):
        map[self._location["y"] - 1][self._location["x"] - 1] = 3

    def refreshApple(self, map):
        self.getNewLoc()
        if map[self._location["y"] - 1][self._location["x"] - 1] != 0:
            self.refreshApple(map)

    def reset(self, map):
        self.refreshApple(map)
        self.settleApple(map)


class GAME:
    def __init__(self, playerCount=1, intervalTime=0.25):
        self._playerCount = playerCount
        self._snakes = []
        self._apples = []
        self._map = []
        self._pause = True
        self._end = True
        self._intervalTime = intervalTime
        self.init()

    def init(self):
        self._pause = True
        self._end = True
        self._snakes = []
        for i in range(self._playerCount):
            self._snakes.append(SNAKE(i + 1))
        self._MAP = MAP()
        self._map = self._MAP._map
        self._apples = []
        self._apples.append(APPLE(self._map))

    def start(self):
        self.init()
        self._pause = False
        self._end = False

        self.interval = setInterval(self.start_core, self._intervalTime * 1000)

    def start_core(self):
        if not self._pause and not self._end:
            self.core()

    def end(self):
        self._end = True
        clearInterval(self.interval)

    def pause(self):
        self._pause = True

    def resume(self):
        self._pause = False

    def pauseORresume(self):
        self._pause = not self._pause

    def checkSituation(self):
        results = list(map(lambda snake, index: self.get_results(
            snake, index), self._snakes, range(len(self._snakes))))
        return results

    def get_results(self, snake, index):
        nextLocation = snake.getNextLocation()
        mapOccupation = self._map[nextLocation.y - 1][nextLocation.x - 1]

        if mapOccupation == TYPE_occupy.empty:
            return TYPE_situation.none
        elif mapOccupation == TYPE_occupy.apple:
            return TYPE_situation.eatApple
        elif mapOccupation == TYPE_occupy.snake:
            return TYPE_situation.collideSnake
        elif mapOccupation == TYPE_occupy.wall:
            return TYPE_situation.collideWall
        else:
            print(f"Error: 第{index+1}条蛇遇到了 unknown map occupation type")
            return TYPE_situation.none

    def core(self):
        results = self.checkSituation()
        appleRestFlag = False
        self._MAP.refreshMap()

        for i in range(len(results)):
            result = results[i]
            snake = self._snakes[i]

            if result == TYPE_situation.eatApple:
                snake.eatApple()
                appleRestFlag = True
            elif result == TYPE_situation.collideSnake or result == TYPE_situation.collideWall:
                snake.die()
                self.end()
            elif result == TYPE_situation.none:
                pass
            else:
                print(f"Error: 未知的情况 {result}")

            snake.move()
            snake.settleToMap(self._map)

        if appleRestFlag:
            self._apples[0].refreshApple(self._map)
        self._apples[0].settleApple(self._map)
