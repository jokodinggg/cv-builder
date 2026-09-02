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
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS cv_profiles (
                id TEXT PRIMARY KEY,
                profile_json TEXT NOT NULL,
                version INTEGER NOT NULL DEFAULT 1,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS cv_profile_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profile_id TEXT NOT NULL,
                version_number INTEGER NOT NULL,
                profile_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(profile_id, version_number)
            )
            """
        )
        connection.commit()


def read_profile(profile_id: str) -> dict | None:
    with sqlite3.connect(DB_PATH) as connection:
        row = connection.execute(
            "SELECT profile_json FROM cv_profiles WHERE id = ?", (profile_id,)
        ).fetchone()
    if row is None:
        return None
    return json.loads(row[0])


def list_profiles() -> list[dict]:
    with sqlite3.connect(DB_PATH) as connection:
        rows = connection.execute(
            "SELECT id, version, updated_at, profile_json FROM cv_profiles ORDER BY updated_at DESC"
        ).fetchall()
    result = []
    for profile_id, version, updated_at, encoded in rows:
        profile = json.loads(encoded)
        result.append({
            "id": profile_id,
            "name": profile.get("name", profile_id),
            "target_title": profile.get("target_title", ""),
            "company": profile.get("company", ""),
            "status": profile.get("status", "Draft"),
            "version": version,
            "updated_at": updated_at,
        })
    return result


def write_profile(profile_id: str, profile: dict) -> None:
    encoded = json.dumps(profile, ensure_ascii=False, separators=(",", ":"))
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            INSERT INTO cv_profiles (id, profile_json, version, updated_at)
            VALUES (?, ?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                profile_json = excluded.profile_json,
                version = cv_profiles.version + 1,
                updated_at = CURRENT_TIMESTAMP
            """,
            (profile_id, encoded),
        )
        version = connection.execute(
            "SELECT version FROM cv_profiles WHERE id = ?", (profile_id,)
        ).fetchone()[0]
        connection.execute(
            "INSERT OR REPLACE INTO cv_profile_versions (profile_id, version_number, profile_json) VALUES (?, ?, ?)",
            (profile_id, version, encoded),
        )
        connection.commit()


def list_versions(profile_id: str) -> list[dict]:
    with sqlite3.connect(DB_PATH) as connection:
        rows = connection.execute(
            "SELECT version_number, created_at FROM cv_profile_versions WHERE profile_id = ? ORDER BY version_number DESC",
            (profile_id,),
        ).fetchall()
    return [{"version": version, "created_at": created_at} for version, created_at in rows]


def delete_profile(profile_id: str) -> None:
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("DELETE FROM cv_profiles WHERE id = ?", (profile_id,))
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
        if path == "/api/profiles":
            try:
                self.send_json(200, {"profiles": list_profiles()})
            except (OSError, sqlite3.Error, json.JSONDecodeError) as error:
                self.send_json(500, {"error": "Unable to list CV profiles"})
                self.log_error("list profiles failed: %s", error)
            return
        if path.startswith("/api/profiles/"):
            profile_path = path.removeprefix("/api/profiles/").strip("/")
            if profile_path.endswith("/versions"):
                profile_id = profile_path.removesuffix("/versions").strip("/")
                try:
                    self.send_json(200, {"profile_id": profile_id, "versions": list_versions(profile_id)})
                except (OSError, sqlite3.Error) as error:
                    self.send_json(500, {"error": "Unable to list CV profile versions"})
                    self.log_error("list versions failed: %s", error)
                return
            profile_id = profile_path
            if profile_id and "/" not in profile_id:
                try:
                    profile = read_profile(profile_id)
                    self.send_json(200 if profile is not None else 404, profile or {"error": "Profile not found"})
                except (OSError, sqlite3.Error, json.JSONDecodeError) as error:
                    self.send_json(500, {"error": "Unable to read CV profile"})
                    self.log_error("read profile failed: %s", error)
                return
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
        if path.startswith("/api/profiles/"):
            profile_id = path.removeprefix("/api/profiles/").strip("/")
            if not profile_id or "/" in profile_id:
                self.send_json(404, {"error": "Not found"})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if length <= 0 or length > MAX_BODY_BYTES:
                    raise ValueError("invalid body size")
                profile = json.loads(self.rfile.read(length))
                if not isinstance(profile, dict):
                    raise ValueError("profile must be an object")
                write_profile(profile_id, profile)
                self.send_json(200, {"saved": True, "id": profile_id})
            except (ValueError, json.JSONDecodeError):
                self.send_json(400, {"error": "Invalid CV profile"})
            except (OSError, sqlite3.Error) as error:
                self.send_json(500, {"error": "Unable to save CV profile"})
                self.log_error("write profile failed: %s", error)
            return
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
