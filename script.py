from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

DB = "todos.db"


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
    CREATE TABLE IF NOT EXISTS todos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()


@app.route("/")
def index():

    filter_type = request.args.get("filter", "all")

    conn = get_db()

    if filter_type == "active":
        todos = conn.execute(
            "SELECT * FROM todos WHERE completed=0 ORDER BY id DESC"
        ).fetchall()

    elif filter_type == "completed":
        todos = conn.execute(
            "SELECT * FROM todos WHERE completed=1 ORDER BY id DESC"
        ).fetchall()

    else:
        todos = conn.execute(
            "SELECT * FROM todos ORDER BY id DESC"
        ).fetchall()

    total = conn.execute("SELECT COUNT(*) FROM todos").fetchone()[0]
    completed = conn.execute(
        "SELECT COUNT(*) FROM todos WHERE completed=1"
    ).fetchone()[0]

    active = total - completed

    conn.close()

    return render_template(
        "index.html",
        todos=todos,
        total=total,
        active=active,
        completed=completed,
        filter_type=filter_type
    )


@app.route("/add", methods=["POST"])
def add():

    text = request.form["text"]

    if text.strip():

        conn = get_db()
        conn.execute("INSERT INTO todos(text) VALUES(?)", (text,))
        conn.commit()
        conn.close()

    return redirect("/")


@app.route("/toggle/<int:id>", methods=["POST"])
def toggle(id):

    conn = get_db()

    todo = conn.execute(
        "SELECT completed FROM todos WHERE id=?",
        (id,)
    ).fetchone()

    new = 0 if todo["completed"] else 1

    conn.execute(
        "UPDATE todos SET completed=? WHERE id=?",
        (new, id)
    )

    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/delete/<int:id>", methods=["POST"])
def delete(id):

    conn = get_db()
    conn.execute("DELETE FROM todos WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/clear", methods=["POST"])
def clear():

    conn = get_db()
    conn.execute("DELETE FROM todos WHERE completed=1")
    conn.commit()
    conn.close()

    return redirect("/")


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
