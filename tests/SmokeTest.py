import sys
import flask
import importlib
import pytest

@pytest.fixture
def app():
    from app import create_app
    return create_app()

@pytest.fixture
def client(app):
    return app.test_client()

def test_flask_exact_version():
    assert flask.__version__ == "3.0.3", f"Active Flask version {flask.__version__} does not match upgrade target 3.0.3"

def test_python_runtime_version():
    assert sys.version_info.major == 3 and sys.version_info.minor >= 8, f"Python runtime {sys.version_info.major}.{sys.version_info.minor} does not meet Flask 3.x requirements"

def test_critical_routes(client):
    response = client.get("/")
    assert response.status_code == 200
    response = client.get("/healthz")
    assert response.status_code in (200, 204)

def test_deprecated_flask_ext_removed():
    with pytest.raises(ModuleNotFoundError):
        importlib.import_module('flask.ext')

def test_blueprint_registration(app):
    # Flask 3.x requires blueprints to be registered, check presence and registration
    assert hasattr(app, "blueprints")
    assert app.blueprints  # Should not be empty if blueprints are used

def test_return_type_enforced(client):
    # Flask 3.x enforces Response/str/tuple return types for route handlers
    # This endpoint must exist and return a valid type
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    assert isinstance(response.data, (bytes, bytearray))

def test_new_config_key_loads(app):
    # Assume "JSON_SORT_KEYS" is a new/changed config in Flask 3.x and should load without error
    assert "JSON_SORT_KEYS" in app.config
    assert isinstance(app.config["JSON_SORT_KEYS"], bool)

def test_removed_deprecated_config_keys(app):
    # Example: JSONIFY_MIMETYPE was deprecated and removed in Flask 3.x
    assert "JSONIFY_MIMETYPE" not in app.config

def test_flask_request_response_api():
    # Ensure flask.Request and flask.Response are present, and reflect 3.x API
    assert hasattr(flask, "Request")
    assert hasattr(flask, "Response")
    from flask.wrappers import Request, Response
    assert hasattr(Request, 'on_json_loading_failed')
    assert hasattr(Response, 'set_data')

def test_cli_commands_available(app):
    runner = app.test_cli_runner()
    result = runner.invoke(args=["--help"])
    assert "Usage" in result.output
    assert "flask" in result.output

def test_flask_json_module_updated():
    # flask.json was refactored in 3.x; test import and usage
    from flask import json
    value = {"foo": "bar"}
    dumped = json.dumps(value)
    loaded = json.loads(dumped)
    assert loaded == value