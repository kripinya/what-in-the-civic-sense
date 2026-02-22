from pymongo import MongoClient
import os

db = None

def init_db():
    global db
    if db is not None:
        return db
        
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/civicsense")
    try:
        client = MongoClient(mongo_uri)
        # Verify connection
        client.admin.command('ping')
        db = client.get_database()
        print(f"Connected to MongoDB database: {db.name}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
    return db

def get_db():
    global db
    if db is None:
        db = init_db()
    return db
