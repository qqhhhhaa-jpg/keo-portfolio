"""
KEO / كيو — Portfolio Server
خادم Flask لإدارة الموقع: عداد مشاهدات، صفحة أدمن، رفع أعمال، برامج.
"""
import os
import json
import uuid
import time
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for, render_template_string

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
DATA_FILE = os.path.join(BASE_DIR, 'data.json')
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.secret_key = 'keo-secret-key-2026-change-me'

# ===== Admin credentials (غيّرها من هنا) =====
ADMIN_USER = 'keo'
ADMIN_PASS = 'keo2026'

ALLOWED_EXT = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'views': 0, 'works': [], 'programs': []}

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def allowed_file(name):
    return '.' in name and name.rsplit('.', 1)[1].lower() in ALLOWED_EXT

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('admin'):
            return jsonify({'error': 'غير مصرح'}), 401
        return f(*args, **kwargs)
    return wrapper

# ===== الصفحة الرئيسية =====
@app.route('/')
def index():
    data = load_data()
    data['views'] = data.get('views', 0) + 1
    save_data(data)
    return send_from_directory(BASE_DIR, 'index.html')

# ===== API: عداد المشاهدات =====
@app.route('/api/views', methods=['GET'])
def get_views():
    data = load_data()
    return jsonify({'views': data.get('views', 0)})

# ===== API: الأعمال =====
@app.route('/api/works', methods=['GET'])
def get_works():
    data = load_data()
    return jsonify({'works': data.get('works', [])})

@app.route('/api/works', methods=['POST'])
@login_required
def add_work():
    data = load_data()
    title = request.form.get('title', '').strip()
    category = request.form.get('category', 'ملازم').strip()
    link = request.form.get('link', '').strip()
    file = request.files.get('image')

    if not title or not file:
        return jsonify({'error': 'العنوان والصورة مطلوبان'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'صيغة الصورة غير مدعومة'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    fname = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(UPLOAD_DIR, fname))

    work = {
        'id': uuid.uuid4().hex,
        'title': title,
        'category': category,
        'link': link,
        'image': f'/uploads/{fname}',
        'created': int(time.time())
    }
    data['works'].append(work)
    save_data(data)
    return jsonify({'work': work}), 201

@app.route('/api/works/<work_id>', methods=['DELETE'])
@login_required
def delete_work(work_id):
    data = load_data()
    data['works'] = [w for w in data.get('works', []) if w['id'] != work_id]
    save_data(data)
    return jsonify({'ok': True})

# ===== API: البرامج =====
@app.route('/api/programs', methods=['GET'])
def get_programs():
    data = load_data()
    return jsonify({'programs': data.get('programs', [])})

@app.route('/api/programs', methods=['POST'])
@login_required
def add_program():
    data = load_data()
    name = request.form.get('name', '').strip()
    platform = request.form.get('platform', 'telegram').strip()
    link = request.form.get('link', '').strip()
    welcome = request.form.get('welcome', '').strip()

    if not name or not link:
        return jsonify({'error': 'الاسم والرابط مطلوبان'}), 400

    program = {
        'id': uuid.uuid4().hex,
        'name': name,
        'platform': platform,
        'link': link,
        'welcome': welcome or 'أهلاً بك في KEO / كيو!'
    }
    data['programs'].append(program)
    save_data(data)
    return jsonify({'program': program}), 201

@app.route('/api/programs/<program_id>', methods=['DELETE'])
@login_required
def delete_program(program_id):
    data = load_data()
    data['programs'] = [p for p in data.get('programs', []) if p['id'] != program_id]
    save_data(data)
    return jsonify({'ok': True})

# ===== صفحة الأدمن =====
@app.route('/admin')
def admin_page():
    return send_from_directory(BASE_DIR, 'admin.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = data.get('user', '')
    pwd = data.get('pass', '')
    if user == ADMIN_USER and pwd == ADMIN_PASS:
        session['admin'] = True
        return jsonify({'ok': True})
    return jsonify({'error': 'بيانات الدخول غير صحيحة'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('admin', None)
    return jsonify({'ok': True})

@app.route('/api/me', methods=['GET'])
def me():
    return jsonify({'admin': bool(session.get('admin'))})

# ===== الملفات الثابتة (css, js) =====
@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'css'), filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'js'), filename)

# ===== الملفات المرفوعة =====
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
