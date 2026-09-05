### STUDENT MANAGEMENT DASHBOARD

Requirements:
- Python 3.10+ recommended
- VS Code recommended

Windows PowerShell:
1. Open this folder in VS Code.
2. Open Terminal.
3. Run:
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python app.py
4. Open http://127.0.0.1:5000 in your browser.

If PowerShell blocks activation, you can run:
   venv\Scripts\activate.bat
from Command Prompt instead.

Data is stored in students.json. No PostgreSQL or SQL database is used.
