from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3

app = Flask(__name__)

# 🔐 Session Key
app.secret_key = "testkey123"

DB = "highscores.db"


# ---------------------------
# DB INIT
# ---------------------------
def init_db():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS highscores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            score INTEGER
        )
    """)

    conn.commit()
    conn.close()


init_db()


# ---------------------------
# LOGIN / USERNAME
# ---------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'POST':
        session['user'] = request.form['username']
        return redirect(url_for('index'))

    return render_template('login.html')


# ---------------------------
# LOGOUT
# ---------------------------
@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))


# ---------------------------
# GAME PAGE
# ---------------------------
@app.route('/')
def index():

    if 'user' not in session:
        return redirect(url_for('login'))

    return render_template('index.html')


# ---------------------------
# SAVE SCORE
# ---------------------------
@app.route('/save_score', methods=['POST'])
def save_score():

    if 'user' not in session:
        return jsonify({'status': 'not logged in'})

    data = request.json
    score = data.get('score', 0)

    name = session['user']

    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO highscores (name, score) VALUES (?, ?)",
        (name, score)
    )

    conn.commit()
    conn.close()

    return jsonify({'status': 'ok'})


# ---------------------------
# HIGHSCORES
# ---------------------------
@app.route('/highscores')
def highscores():

    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT name, score
        FROM highscores
        ORDER BY score DESC
        LIMIT 10
    """)

    scores = cur.fetchall()

    conn.close()

    return jsonify(scores)


# ---------------------------
# START
# ---------------------------
if __name__ == '__main__':
    app.run(debug=True)