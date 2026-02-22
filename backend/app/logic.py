from datetime import datetime, date

def calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

def map_age_to_level(age: int) -> int:
    if age <= 3:
        return 1
    elif 4 <= age <= 6:
        return 2
    elif 7 <= age <= 8:
        return 3
    elif 9 <= age <= 10:
        return 4
    else:
        return 5
