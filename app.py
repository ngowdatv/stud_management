from flask import Flask, render_template, request, jsonify
import json
from pathlib import Path

app = Flask(__name__)
DATA_FILE = Path(__file__).parent / "students.json"

def load_students():
    if not DATA_FILE.exists():
        return []
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []

def save_students(students):
    DATA_FILE.write_text(json.dumps(students, indent=2), encoding="utf-8")

@app.route("/")
def index():
    return render_template("index.html")

@app.get("/api/students")
def get_students():
    return jsonify(load_students())

@app.post("/api/students")
def add_student():
    data = request.get_json() or {}
    students = load_students()

    name = str(data.get("name", "")).strip()
    roll_no = str(data.get("roll_no", "")).strip()
    course = str(data.get("course", "")).strip()
    cgpa = data.get("cgpa", "")

    if not name or not roll_no or not course:
        return jsonify({"error": "Name, roll number and course are required."}), 400

    try:
        cgpa = float(cgpa)
        if not 0 <= cgpa <= 10:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "CGPA must be a number between 0 and 10."}), 400

    if any(s["roll_no"].lower() == roll_no.lower() for s in students):
        return jsonify({"error": "A student with this roll number already exists."}), 409

    student = {
        "id": max([s.get("id", 0) for s in students], default=0) + 1,
        "name": name,
        "roll_no": roll_no,
        "course": course,
        "cgpa": cgpa
    }
    students.append(student)
    save_students(students)
    return jsonify(student), 201

@app.put("/api/students/<int:student_id>")
def update_student(student_id):
    data = request.get_json() or {}
    students = load_students()
    student = next((s for s in students if s.get("id") == student_id), None)

    if not student:
        return jsonify({"error": "Student not found."}), 404

    name = str(data.get("name", "")).strip()
    roll_no = str(data.get("roll_no", "")).strip()
    course = str(data.get("course", "")).strip()

    try:
        cgpa = float(data.get("cgpa", ""))
        if not 0 <= cgpa <= 10:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "CGPA must be a number between 0 and 10."}), 400

    if not name or not roll_no or not course:
        return jsonify({"error": "Name, roll number and course are required."}), 400

    if any(s.get("id") != student_id and s["roll_no"].lower() == roll_no.lower() for s in students):
        return jsonify({"error": "Another student already uses this roll number."}), 409

    student.update({"name": name, "roll_no": roll_no, "course": course, "cgpa": cgpa})
    save_students(students)
    return jsonify(student)

@app.delete("/api/students/<int:student_id>")
def delete_student(student_id):
    students = load_students()
    updated = [s for s in students if s.get("id") != student_id]

    if len(updated) == len(students):
        return jsonify({"error": "Student not found."}), 404

    save_students(updated)
    return jsonify({"message": "Student deleted."})

if __name__ == "__main__":
    app.run(debug=True)
