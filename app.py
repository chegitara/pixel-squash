from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

DB = 'highscores.db'


def init_db():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS highscores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            score INTEGER
        )
    ''')

    conn.commit()
    conn.close()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.json

    name = data.get('name', 'Player')
    score = data.get('score', 0)

    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute(
        'INSERT INTO highscores (name, score) VALUES (?, ?)',
        (name, score)
    )

    conn.commit()
    conn.close()

    return jsonify({'status': 'ok'})


@app.route('/highscores')
def highscores():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute(
        'SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10'
    )

    scores = cur.fetchall()

    conn.close()

    return jsonify(scores)


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
else:
    init_db()