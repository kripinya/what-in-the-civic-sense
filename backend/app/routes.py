from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from .extensions import get_db
from .logic import calculate_age, map_age_to_level

api_bp = Blueprint('api', __name__)

@api_bp.route('/register', methods=['POST'])
def register_user():
    data = request.json
    dob_str = data.get('dob')
    if not dob_str:
        return jsonify({"error": "DOB is required"}), 400
    
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid DOB format. Use YYYY-MM-DD"}), 400
    
    age = calculate_age(dob)
    level = map_age_to_level(age)
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "user_id": user_id,
        "dob": dob_str,
        "age": age,
        "current_level": level,
        "last_level_update_date": datetime.utcnow().isoformat(),
        "civic_scores": {
            "hygiene": 0,
            "empathy": 0,
            "discipline": 0,
            "environment": 0
        }
    }
    
    db = get_db()
    if db is not None:
        db.users.insert_one(user_doc)
        
    return jsonify({
        "user_id": user_id,
        "age": age,
        "current_level": level
    }), 201

@api_bp.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
        
    user = db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Check if a year has passed
    last_update = datetime.fromisoformat(user.get('last_level_update_date', datetime.utcnow().isoformat()))
    now = datetime.utcnow()
    
    if (now - last_update).days >= 365:
        # Re-evaluate age and level
        dob = datetime.strptime(user['dob'], '%Y-%m-%d').date()
        new_age = calculate_age(dob)
        new_level = map_age_to_level(new_age)
        
        db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "age": new_age,
                "current_level": new_level,
                "last_level_update_date": now.isoformat()
            }}
        )
        user['age'] = new_age
        user['current_level'] = new_level
        user['last_level_update_date'] = now.isoformat()
        
    return jsonify(user), 200

@api_bp.route('/missions', methods=['GET'])
def get_missions():
    level = request.args.get('level', type=int)
    if level is None:
        return jsonify({"error": "Level parameter required"}), 400
        
    # Mocked static mission for now based on level
    missions = []
    if level == 2:
        missions.append({
            "mission_id": "mission_hyg_001",
            "category": "Hygiene",
            "title": "Clean the Park",
            "description": "Pick up the littered wrappers and throw them in the correct dustbin.",
            "target_age_group": "4-6",
            "level_required": 2,
            "score_reward": {
                "hygiene": 10,
                "environment": 5
            },
            "game_data": {
                "scene_type": "cleanup_drag_drop",
                "environment": "park",
                "litter_items": [
                    {"type": "wrapper", "count": 3, "bin_target": "dry_waste"},
                    {"type": "banana_peel", "count": 2, "bin_target": "wet_waste"}
                ],
                "npcs": [
                    {"name": "Park Ranger", "dialogue_start": "Oh no! The park is dirty. Can you help clean it?", "dialogue_end": "Thank you! The park looks beautiful and everyone is happy."}
                ]
            }
        })
    elif level == 1:
        missions.append({
            "mission_id": "mission_hyg_000",
            "category": "Hygiene",
            "title": "Tap the Trash",
            "description": "Tap the trash to make it disappear.",
            "target_age_group": "1-3",
            "level_required": 1,
            "score_reward": {
                "hygiene": 5
            }
        })
    return jsonify(missions), 200

@api_bp.route('/score/update', methods=['POST'])
def update_score():
    data = request.json
    user_id = data.get('user_id')
    mission_id = data.get('mission_id')
    scores_earned = data.get('scores_earned', {}) # e.g. {"hygiene": 10}
    
    if not user_id or not scores_earned:
        return jsonify({"error": "user_id and scores_earned are required"}), 400
        
    db = get_db()
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
        
    # Generate the $inc update document
    inc_doc = {}
    for cat, val in scores_earned.items():
        if cat in ["hygiene", "empathy", "discipline", "environment"]:
            inc_doc[f"civic_scores.{cat}"] = val
            
    if not inc_doc:
        return jsonify({"error": "Invalid score categories"}), 400
        
    result = db.users.update_one(
        {"user_id": user_id},
        {"$inc": inc_doc}
    )
    
    if result.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
        
    # return updated scores
    user = db.users.find_one({"user_id": user_id}, {"_id": 0, "civic_scores": 1})
    return jsonify({"message": "Scores updated successfully", "civic_scores": user.get('civic_scores')}), 200
