import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# 解决跨域'Access-Control-Allow-Origin' header 问题
# 添加配置:Access-Control-Allow-Origin: *
CORS(app, resources=r'/*')


@app.route('/create_room', methods=['POST', 'GET'])
def create_room():
    print(request)
    print(request.get_data())
    print(request.get_data().decode("utf-8"))
    print(request.get_json())

    data = json.loads(request.get_data())
    print(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=215, debug=True)
