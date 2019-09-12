import json

from flask import Flask, request, Response
from flask_cors import CORS
from flask_jsonpify import jsonify
from flask_restful import Resource, Api

# Create the application instance
from tx_generator import iter_tx

app = Flask(__name__)
api = Api(app)
CORS(app)


@app.route("/height/<int:height>",)
def height(height):
    txs = [tx for tx in iter_tx(height, True, True)]
    resp = Response(response=json.dumps(txs),
                    status=200,
                    mimetype="application/json")
    return resp


# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    app.run(debug=True, port='9900')
