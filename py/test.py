rooms = {
    'clients': [
        (1, 'Player 1'),
        (2, 'Player 2')
    ]
}

myId = 3


def find_client_index(rooms, myId):
    for index, client in enumerate(rooms['clients']):
        if client[0] == myId:
            return index
    return -1


print(find_client_index(rooms, myId))
