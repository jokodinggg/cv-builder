#!/usr/bin/env python3
"""Small SQLite-backed server for the CV Builder."""
from __future__ import annotations

import json
import os
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("CV_BUILDER_DB", ROOT / "cv_builder.sqlite3"))
HOST = os.environ.get("CV_BUILDER_HOST", "0.0.0.0")
PORT = int(os.environ.get("CV_BUILDER_PORT", "20129"))
MAX_BODY_BYTES = 2 * 1024 * 1024


def initialize_database() -> None:
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                state_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def read_state() -> dict | None:
    with sqlite3.connect(DB_PATH) as connection:
        row = connection.execute(
            "SELECT state_json FROM app_state WHERE id = 1"
        ).fetchone()
    if row is None:
        return None
    return json.loads(row[0])


def write_state(state: dict) -> None:
    encoded = json.dumps(state, ensure_ascii=False, separators=(",", ":"))
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            INSERT INTO app_state (id, state_json, updated_at)
            VALUES (1, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                state_json = excluded.state_json,
                updated_at = CURRENT_TIMESTAMP
            """,
            (encoded,),
        )
        connection.commit()


class CVRequestHandler(SimpleHTTPRequestHandler):
    server_version = "CVBuilder/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status: int, payload: dict | None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/state":
            try:
                self.send_json(200, read_state())
            except (OSError, sqlite3.Error, json.JSONDecodeError) as error:
                self.send_json(500, {"error": "Unable to read CV state"})
                self.log_error("read state failed: %s", error)
            return
        if path == "/api/health":
            self.send_json(200, {"status": "ok"})
            return
        super().do_GET()

    def do_PUT(self) -> None:
        path = urlparse(self.path).path
        if path != "/api/state":
            self.send_json(404, {"error": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("invalid body size")
            state = json.loads(self.rfile.read(length))
            if not isinstance(state, dict):
                raise ValueError("state must be an object")
            write_state(state)
            self.send_json(200, {"saved": True})
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"error": "Invalid CV state"})
        except (OSError, sqlite3.Error) as error:
            self.send_json(500, {"error": "Unable to save CV state"})
            self.log_error("write state failed: %s", error)

    def do_POST(self) -> None:
        self.send_json(405, {"error": "Method not allowed"})

    def log_message(self, format: str, *args) -> None:
        super().log_message(format, *args)


if __name__ == "__main__":
    initialize_database()
    with ThreadingHTTPServer((HOST, PORT), CVRequestHandler) as httpd:
        print(f"CV Builder listening on http://{HOST}:{PORT}", flush=True)
        httpd.serve_forever()
