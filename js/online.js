// let serverIP = prompt('请输入服务器ip', '106');
// URL_HEAD = `http://192.168.1.${(serverIP) * 1}:215/`

function sendAlerter(message) {
    console.log(message)
}

// 用ajax给create_room
function createRoom(host_name) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'post',
            dataType: 'json',
            data: JSON.stringify({ "name": host_name }),
            url: URL_HEAD + 'create_room',
            success: function(json_data) {
                console.log(json_data)
                let message = json_data['message']
                let isRoomExist = json_data['isRoomExist']
                let playerState = json_data['playerState']
                let roomID = json_data['roomID']
                let playerID = json_data['playerID']
                if (isRoomExist) {
                    sendAlerter('房间创建成功\n' + message)
                } else {
                    sendAlerter('房间创建失败\n' + message)
                }
                return [roomID, playerID]
            },
            fail: function(status) {
                console.log(status)
            }
        })
    })
}

function joinRoom(roomID, clientName) {
    $.ajax({
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({ "room": roomID, "name": clientName }),
        url: URL_HEAD + 'join_room',
        success: function(json_data) {
            let message = json_data['message']
            let isRoomExist = json_data['isRoomExist']
            let playerState = json_data['playerState']
            let roomID = json_data['roomID']
            let playerID = json_data['playerID']

            if (isRoomExist) {
                sendAlerter(`房间${roomID}加入成功\n本机ip为${playerID}` + message)
            } else {
                sendAlerter('房间加入失败\n' + message)
            }
            return [roomID, playerID]
        },
        fail: function(status) {
            console.log(status)
        }
    })
}

function getGameData(roomID) {
    /**
     * 返回值包括: map, playerInfo, buffs, isRoomExist, delay
     */

    $.ajax({
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({ "room": roomID, 'sendTime': new Date().getTime() }),
        url: URL_HEAD + 'game',
        success: function(json_data) {
            // let map = json_data['map']
            // let playerInfo = json_data['playerInfo']
            // let buffs = json_data['buffs']
            // let isRoomExist = json_data['isRoomExist']
            // let delay = json_data['delay']

            return json_data
        },
        fail: function(status) {
            console.log(status)
        }
    })
}

const TYPE_hostControl = {
    start: 0,
    pause: 1,
    end: 2,
}

function hostControl(roomID, action) {
    $.ajax({
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({ "room": roomID, "action": action }),
        url: URL_HEAD + 'host_control',
        success: function(json_data) {
            let message = json_data['message']
            let isSuccess = json_data['success']
            if (isSuccess) {
                sendAlerter(message)
            } else {
                sendAlerter(message)
            }
        },
        fail: function(status) {
            console.log(status)
        }
    })
}

function playerControl(roomID, nextArrowKey, buffUse) {
    $.ajax({
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({ "room": roomID, "nextArrowKey": nextArrowKey, "buffUse": buffUse }),
        url: URL_HEAD + 'player_control',
        success: function(json_data) {
            let message = json_data['message']
            let isSuccess = json_data['success']
            let timeDelay = json_data['timeDelay']
            if (isSuccess) {
                sendAlerter(message)
            } else {
                sendAlerter(message)
            }
            return timeDelay
        },
        fail: function(status) {
            console.log(status)
        }
    })
}

function inquire(roomID) {
    /**
     * 返回值包含: message, isRoomExist, roomState, playerState, roomID, playerID, startTime
     */
    $.ajax({
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({ "room": roomID }),
        url: URL_HEAD + 'inquire',
        success: function(json_data) {
            /* 
            
            'message': message,
            'isRoomExist': True,
            'roomState': room.state,
            'playerState': player_state,
            'roomID': room_id,
            'playerID': player_id,
            'startTime': room.start_time,
             */

            return json_data
        },
        fail: function(status) {
            console.log(status)
        }
    })
}

function hostGame() {
    hideElement(document.getElementById("container_hall"));
    showElement(document.getElementById("container_game"));
    window.game = new GAME(1, setting.intervalTime);
    let bbb = document.createElement("button");
    document.getElementsByTagName("body")[0].appendChild(bbb);
    bbb.focus();
    alert('作为房主准备开房');
    let hostName = prompt('请输入你的昵称', 'name');
    let info = createRoom(hostName);
    let roomID = info[0];
    let playerID = info[1];
    alert(`房间号为${roomID}\n你的ip为${playerID}\n按下确认即开始游戏`);
    hostControl(roomID, TYPE_hostControl.start);
    goToOnlineGame(roomID, playerID);
}

function clientGame() {
    hideElement(document.getElementById("container_hall"));
    showElement(document.getElementById("container_game"));
    window.game = new GAME(2, setting.intervalTime);
    let bbb = document.createElement("button");
    document.getElementsByTagName("body")[0].appendChild(bbb);
    bbb.focus();


    prompt("请输入房间号")
    let name = prompt("请输入你的昵称")
    alert("游戏开始")

    window.game._snakes[0]._name = 'host'
    window.game._snakes[1]._name = name

    window.game.start()




    return true






    alert('作为客户端准备加入房间');
    let roomID = prompt('请输入房间号', 'roomID');
    let clientName = prompt('请输入你的昵称', 'name');
    let info = joinRoom(roomID, clientName);
    let playerID = info[1];
    alert(`房间号为${roomID}\n你的ip为${playerID}\n按下确认进入等待`);
    while (true) {
        let roomState = inquire(roomID)['roomState'];
        if (roomState == 'readyToStart' || roomState == 'gaming') {
            break;
        } else {
            console.log('当前房间状态是' + roomState + '，等待中...');
        }
    }

    goToOnlineGame(roomID, playerID);
}

function goToOnlineGame(roomID, playerID) {
    let gameData, map, playerInfo, buffs, isRoomExist, delay;
    let theMap = new MAP()
    while (true) {
        gameData = getGameData(roomID);
        map = gameData['map'];
        playerInfo = gameData['playerInfo'];
        buffs = gameData['buffs'];
        isRoomExist = gameData['isRoomExist'];
        delay = gameData['delay'];

        theMap._map = map;

        //把地图擦干净
        ctx.clearRect(0, 0, cvs_w, cvs_h);
        //把map数组渲染出来
        this._MAP.render();

        for (let i = 0; i < playerInfo.length; i++) {
            snake = new SNAKE(i + 1, playerInfo[i]['name']);
            snake._score = playerInfo[i]['score'];
            snake._snake = new Array(playerInfo[i]['length']);
            snake.registInfo();
        }

        playerControl(roomID, window.nextArrowKey, null);
    }
}