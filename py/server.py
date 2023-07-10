from flask import Flask, request, jsonify
from flask_cors import CORS
from clarity import *

import json
import time


class ROOM:
    def __init__(self, room_id, host_id, host_name):
        self.id = room_id
        self.state = "created"
        self._game = GAME()
        self.host = (host_id, host_name)
        self.clients = []
        self._startTime = None

    def start(self):
        self._startTime = (time.time() + 5) * 1000
        self.state = "readyToStart"
        # 设置延时, 在5秒后开始游戏
        time.sleep(5)
        self.state = "gameing"
        self._game.start()

    def pause(self):
        self._game.pause()
        self.state = "pause"

    def end(self):
        self._game.end()
        self.state = "gameEnd"

    # def end(self):
    #     # Check if the host player is offline and close the room if true
    #     if self.host not in self.names:
    #         self.close()
    #         return
    #
    #     # Check if any client players are offline and remove them from the game
    #     players_to_remove = []
    #     for client_id in self.clients:
    #         if client_id not in self.names:
    #             players_to_remove.append(client_id)
    #
    #     for remove_id in players_to_remove:
    #         self.clients.remove(remove_id)
    #
    #     # Call the end() method of the game object
    #     self._game.end()
    #     self.state = "end"

    # def update(self):
    #     # Handle player requests and check for player disconnects every few frames
    #     if self.frame_count % 3 == 0:
    #         # Check for player requests and handle them
    #         for player_id in self.names:
    #             # Check player requests and update accordingly
    #             pass
    #
    #         # Check for player disconnects
    #         players_to_remove = []
    #         for client_id in self.clients:
    #             if client_id not in self.names:
    #                 players_to_remove.append(client_id)
    #
    #         for remove_id in players_to_remove:
    #             self.clients.remove(remove_id)
    #
    #         # Check if the host player is offline and close the room if true
    #         if self.host not in self.names:
    #             self.close()
    #
    #     # Update the frame count
    #     self.frame_count += 1


def getPlayerConsequence(rooms, myId):
    if myId == rooms['host'][0]:
        return 1
    else:
        for index, client in enumerate(rooms['clients']):
            if client[0] == myId:
                return index + 2
            else:
                return -1


app = Flask(__name__)
CORS(app, resources=r'/*')

ROOMS = {}


@app.route('/create_room', methods=['POST', 'GET'])
def create_room():
    # 这里的data是一个字典, 包含创建该房间的房主host的id和名称
    data = request.get_json()
    name = data['name']
    host_id = data['id']

    # 按照当前时间生成一个房间号
    room_id = int(time.time() % 1000000)

    room = ROOM(room_id, host_id, name)
    ROOMS[room_id] = room

    return inquire(room_id, host_id)


@app.route('/join_room', methods=['POST', 'GET'])
def join_room():
    # 这里的data是一个字典, 包含加入该房间的玩家的id和名称
    data = request.get_json()
    name = data['name']
    # id取客户端的ip地址最后一部分(用小数点分割后的最后一部分)
    client_id = int(request.remote_addr.split('.')[-1])
    room_id = data['room']
    room = ROOMS.get(room_id)

    if room:
        if len(room.clients) < 3:
            room.clients.append((client_id, name))
            return inquire(room_id, client_id)
        else:
            return jsonify({
                'message': 'The room is full',
                'isRoomExist': True,
                'roomState': room.state,
                'playerState': 'outside_game',
                'data': None,
                'error': None
            })
    else:
        return jsonify({
            'message': 'The room does not exist',
            'isRoomExist': False,
            'roomState': None,
            'playerState': None,
            'data': None,
            'error': None
        })


@app.route('/game', methods=['POST', 'GET'])
def game_data():
    data = request.get_json()
    room_id = data['room']
    player_id = data['id']

    room = ROOMS.get(room_id)
    if room:
        # player_consequence = getPlayerConsequence(room, player_id)
        theGame = room._game
        map = theGame._map._map
        player_info = []
        for i in range(4):
            if theGame._snakes[i]:
                player_info.append({
                    'name': room.clients[i][1],
                    'id': room.clients[i][0],
                    'score': theGame._snakes[i]._score,
                    'length': len(theGame._snakes[i]._snake)
                })
            else:
                player_info.append({
                    'name': '',
                    'id': '',
                    'score': '',
                    'length': ''
                })

        buffs = []
        # buffs.append(buffs[player_consequence-1])

        return jsonify({
            'map': map,
            'playerInfo': player_info,
            'buffs': buffs,
            'isRoomExist': True,
        })
    else:
        return jsonify({
            'message': '',
            'isRoomExist': True,
            'roomState': room.state if room else '',
            'playerState': 'outside_game',
            'data': None,
            'error': None
        })


@app.route('/host_control', methods=['POST', 'GET'])
def host_control():
    data = request.get_json()
    room_id = data['room']
    player_id = data['id']
    action = data['action']

    class TYPE_action:
        start = 0
        pause = 1
        end = 2

    room = ROOMS.get(room_id)
    if room and room.host[0] == player_id:
        if action == TYPE_action.start:
            room.start()
        elif action == TYPE_action.pause:
            room.pause()
        elif action == TYPE_action.end:
            room.end()

        return jsonify({
            'success': True,
            'message': '',
        })
    else:
        return jsonify({
            'success': False,
            'message': 'The room does not exist',
        })


@app.route('/player_control', methods=['POST', 'GET'])
def player_control():
    data = request.get_json()
    room_id = data['room']
    player_id = data['id']
    next_arrow_key = data['nextArrowKey']
    buff_use = data['buffUse']
    current_time = data['time']

    room = ROOMS.get(room_id)
    if room:
        theGame = room._game
        player_consequence = getPlayerConsequence(room, player_id)
        snake = theGame.snakes[player_consequence - 1]

        snake.next_arrow_key = next_arrow_key
        snake.buff_use = buff_use

        time_delay = time.time() * 1000 - current_time

        return jsonify({
            'success': True,
            'message': '',
            'timeDelay': time_delay
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Room does not exist',
            'timeDelay': None
        })


@app.route('/inquire', methods=['POST', 'GET'])
def inquire(room_id, player_id):
    room = ROOMS.get(room_id)
    if room:
        if player_id == room.host:
            message = 'You are the host of this room'
            player_state = 'host'
        elif player_id in room.clients:
            message = 'You are a client in this room'
            player_state = 'client'
        else:
            message = 'You are outside of this room'
            player_state = 'outside'

        return jsonify({
            'message': message,
            'isRoomExist': True,
            'roomState': room.state,
            'playerState': player_state,
            'data': None,
            'error': False
        })
    else:
        return jsonify({
            'message': 'Room does not exist',
            'isRoomExist': False,
            'roomState': None,
            'playerState': None,
            'data': None,
            'error': True
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=215, debug=True)
