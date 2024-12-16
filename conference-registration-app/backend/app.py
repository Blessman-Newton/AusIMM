from flask import Flask
from flask_cors import CORS
from app.routes import register_routes

app = Flask(__name__)
CORS(app)

# Load configuration
app.config.from_object('config')

# Register routes
register_routes(app)

if __name__ == '__main__':
    app.run(debug=True)