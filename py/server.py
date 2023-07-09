

from flask import Flask, request, jsonify
from flask_cors import CORS

import json


class ROOM:
    # Existing code omitted

    def end(self):
        # Check if the host player is offline and close the room if true
        if self.host not in self.names:
            self.close()
            return

        # Check if any client players are offline and remove them from the game
        players_to_remove = []
        for client_id in self.clients:
            if client_id not in self.names:
                players_to_remove.append(client_id)

        for remove_id in players_to_remove:
            self.clients.remove(remove_id)

        # Call the end() method of the game object
        self._game.end()
        self.state = "end"

    # Existing code omitted

    def update(self):
        # Handle player requests and check for player disconnects every few frames
        if self.frame_count % 3 == 0:
            # Check for player requests and handle them
            for player_id in self.names:
                # Check player requests and update accordingly
                pass

            # Check for player disconnects
            players_to_remove = []
            for client_id in self.clients:
                if client_id not in self.names:
                    players_to_remove.append(client_id)

            for remove_id in players_to_remove:
                self.clients.remove(remove_id)

            # Check if the host player is offline and close the room if true
            if self.host not in self.names:
                self.close()

        # Update the frame count
        self.frame_count += 1


class GAME:
    def __init__(self):
        self.snakes = []  # List of Snake objects
        self.frame_count = 0

    def start(self):
        # Start the game
        while True:
            # Game logic and update code
            self.update()
            self.frame_count += 1
            # Other game logic and update code

    def update(self):
        # Check for player requests and handle player disconnects here
        pass


app = Flask(__name__)
CORS(app)

ROOMS = {}


@app.route('/create_room', methods=['POST'])
def create_room():
    data = request.get_json()
    room_id = data['room']
    name = data['name']
    player_id = data['id']

    if room_id in ROOMS:
        return jsonify({
            'message': 'Room already exists',
            'isRoomExist': True,
            'roomState': '',
            'playerState': '',
            'data': None,
            'error': None
        })

    room = ROOM(room_id, player_id)
    ROOMS[room_id] = room

    return inquire(room_id, name, player_id)


@app.route('/game_map', methods=['POST'])
def game_map():
    data = request.get_json()
    room_id = data['room']
    name = data['name']
    player_id = data['id']

    room = ROOMS.get(room_id)
    if room and player_id in room.clients:
        map = [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0]
        ]

        player_info = [
            {
                'name': 'Player 1',
                'id': 1,
                'score': 100,
                'length': 5
            },
            {
                'name': 'Player 2',
                'id': 2,
                'score': 200,
                'length': 7
            }
        ]

        buffs = [
            {
                'name': 'Buff 1',
                'type': 'Type 1'
            },
            {
                'name': 'Buff 2',
                'type': 'Type 2'
            }
        ]

        return jsonify({
            'map': map,
            'playerInfo': player_info,
            'buffs': buffs
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


@app.route('/player_control', methods=['POST'])
def player_control():
    data = request.get_json()
    room_id = data['room']
    player_id = data['id']
    next_arrow_key = data['nextArrowKey']
    buff_use = data['buffUse']
    current_time = data['time']

    room = ROOMS.get(room_id)
    if room:
        game = room._game
        player_index = game.get_player_index(player_id)
        snake = game.snakes[player_index]

        snake.next_arrow_key = next_arrow_key
        snake.buff_use = buff_use

        time_delay = current_time - room._startTime

        return jsonify({
            'success': True,
            'message': '',
            'timeDelay': time_delay
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Room does not exist',
            'timeDelay': 0
        })


def inquire(room_id, name, player_id):
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
            'error': None
        })
    else:
        return jsonify({
            'message': 'Room does not exist',
            'isRoomExist': False,
            'roomState': '',
            'playerState': '',
            'data': None,
            'error': None
        })


if __name__ == '__main__':
    app.run()
