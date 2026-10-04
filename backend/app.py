from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get('/api/network')
def network():
    return jsonify({"nodes": [], "links": []})

if __name__ == '__main__':
    app.run(port=5001, debug=True)