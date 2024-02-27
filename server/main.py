#!/usr/bin/env python3
from flask import Flask
from flask import jsonify

app = Flask(__name__)

@app.route('/hello')
def hello():
    return jsonify("Hello, World!")

if __name__ == "__main__":
    app.run(port=5001) # På MacOS, byt till 5001 eller dylikt