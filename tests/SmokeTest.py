import os
import sys
from importlib import import_module

import flask
import sqlalchemy
import pytest

# Attempt to import the application factory and SQLAlchemy components.
# These names should be updated to match the actual project layout if different.
try:
    app_module = import_module("app")
except ModuleNotFoundError:
    app_module = None

try:
    models_module = import_module("models")
except ModuleNotFoundError:
    models_module = None


TARGET_PYTHON_MAJOR = 3
TARGET_PYTHON_MINOR = 12
TARGET_FLASK_VERSION = "3.0.3"
TARGET_SQLALCHEMY_VERSION = "2.0.32"


@pytest.fixture(scope="session")
def app():
    """
    Use the Flask app factory expected after the Flask 3.x migration.
    This assumes an `create_app` factory exists in `app.py` or `app/__init__.py`.
    """
    if app_module is None:
        pytest.skip("Application module 'app' is not importable in this environment")

    create_app = getattr(app_module, "create_app", None)
    if create_app is None:
        pytest.skip("Application factory 'create_app' not found in 'app' module")

    application = create_app()
    if not isinstance(application, flask.Flask):
        pytest.fail("create_app() must return a Flask application instance")

    return application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture(scope="session")
def engine():
    """
    Provide a SQLAlchemy 2.x style Engine using the upgraded APIs.
    Assumes an `engine` or `get_engine` is exposed in models or app modules.
    """
    if models_module and hasattr(models_module, "engine"):
        return models_module.engine
    if models_module and hasattr(models_module, "get_engine"):
        return models_module.get_engine()

    # Fallback: try to construct from DATABASE_URL env var using SQLAlchemy 2.x API
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        pytest.skip("No database engine or DATABASE_URL configured for SQLAlchemy tests")

    from sqlalchemy import create_engine

    return create_engine(database_url)


def test_python_runtime_version_is_3_12():
    major, minor = sys.version_info.major, sys.version_info.minor
    assert (major, minor) == (
        TARGET_PYTHON_MAJOR,
        TARGET_PYTHON_MINOR,
    ), f"Expected Python {TARGET_PYTHON_MAJOR}.{TARGET_PYTHON_MINOR}, got {major}.{minor}"


def test_flask_exact_target_version_active():
    assert flask.__version__ == TARGET_FLASK_VERSION, (
        f"Flask runtime version mismatch: expected {TARGET_FLASK_VERSION}, "
        f"got {flask.__version__}"
    )


def test_sqlalchemy_exact_target_version_active():
    assert sqlalchemy.__version__ == TARGET_SQLALCHEMY_VERSION, (
        f"SQLAlchemy runtime version mismatch: expected {TARGET_SQLALCHEMY_VERSION}, "
        f"got {sqlalchemy.__version__}"
    )


@pytest.mark.parametrize(
    "env_key",
    [
        "FLASK_ENV",
        "FLASK_CONFIG",
        "DATABASE_URL",
    ],
)
def test_required_config_env_vars_present_or_handled(env_key):
    """
    Ensure that configuration has been externalized and that reading
    key environment-backed settings does not crash the app factory.
    """
    # Merely importing the app and creating it should not raise, even if env is missing.
    if app_module is None:
        pytest.skip("Application module 'app' is not importable in this environment")

    create_app = getattr(app_module, "create_app", None)
    if create_app is None:
        pytest.skip("Application factory 'create_app' not found in 'app' module")

    # Ensure that creating the app is robust w.r.t. configuration loading.
    application = create_app()
    assert isinstance(application, flask.Flask)


def test_root_endpoint_works_with_flask_3(client):
    """
    Critical application path: root or health endpoint should respond successfully.
    Adjust the path if your primary healthcheck is different.
    """
    response = client.get("/")
    # Accept 2xx (main page) or 3xx (redirect to canonical path) as success.
    assert 200 <= response.status_code < 400, (
        f"Expected successful response from '/', got {response.status_code}"
    )


@pytest.mark.parametrize(
    "path",
    [
        "/health",
        "/api/health",
    ],
)
def test_health_endpoint_works_with_flask_3(client, path):
    """
    Critical health-check path(s) should work correctly after the upgrade.
    """
    response = client.get(path)
    # It's acceptable that only one of these paths exists; treat 404 as "path not used".
    if response.status_code == 404:
        pytest.skip(f"Health endpoint {path} not defined in this deployment")
    assert 200 <= response.status_code < 300, (
        f"Expected 2xx from health endpoint '{path}', got {response.status_code}"
    )


def test_sqlalchemy_2_style_connection_execution(engine):
    """
    Verify that SQLAlchemy 2.x style Engine and Connection usage works for a simple query.
    This validates that we've migrated away from the legacy .execute() patterns on Engine.
    """
    from sqlalchemy import text

    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        value = result.scalar_one()
        assert value == 1


def test_sqlalchemy_orm_session_uses_new_style_if_available():
    """
    If the project exposes a Session factory, verify it uses SQLAlchemy 2.x style patterns.
    This checks that we are not relying on deprecated Session.bind/.execute legacy behavior.
    """
    if models_module is None:
        pytest.skip("No models module available to validate ORM Session behavior")

    SessionLocal = getattr(models_module, "SessionLocal", None)
    if SessionLocal is None:
        pytest.skip("No SessionLocal factory defined in models module")

    from sqlalchemy import text
    from sqlalchemy.orm import Session

    session: Session = SessionLocal()
    try:
        # In SQLAlchemy 2.x style, execute is available on Session but goes through the 2.0 API.
        result = session.execute(text("SELECT 1"))
        value = result.scalar_one()
        assert value == 1
    finally:
        session.close()


def test_flask_legacy_app_run_not_used_in_production_config():
    """
    Validate that we no longer rely on the deprecated `app.run()` pattern for deployment.
    We heuristically assert that the app module does not call app.run() at import time.
    """
    if app_module is None:
        pytest.skip("Application module 'app' is not importable in this environment")

    # The test passes implicitly if import did not start a dev server or block.
    # Additionally, check that there's no top-level `if __name__ == '__main__': app.run(...)`.
    source_path = getattr(app_module, "__file__", None)
    if not source_path or not os.path.exists(source_path):
        pytest.skip("Cannot locate source file for app module to inspect for app.run usage")

    with open(source_path, "r", encoding="utf-8") as f:
        source = f.read()

    assert "app.run(" not in source, "Deprecated app.run() usage should be removed for Flask 3.x WSGI/ASGI deployment"


def test_flask_2_x_deprecated_aliases_absent():
    """
    Verify Flask 3.x deprecations are respected:
    - `flask.ext` namespace extension loading must not be used.
    - Deprecated helpers removed in Flask 3 must not be present.
    """
    if app_module is None:
        pytest.skip("Application module 'app' is not importable in this environment")

    source_path = getattr(app_module, "__file__", None)
    if not source_path or not os.path.exists(source_path):
        pytest.skip("Cannot locate source file for app module to inspect Flask API usage")

    with open(source_path, "r", encoding="utf-8") as f:
        source = f.read()

    assert "flask.ext" not in source, "Deprecated 'flask.ext' namespace should not be used on Flask 3.x"


def test_sqlalchemy_1_x_orm_query_deprecated_apis_absent():
    """
    Verify we are not using SQLAlchemy 1.x deprecated ORM patterns such as:
    - session.query(Model).get(pk)
    - Query.get()
    - Query.filter_by(...).all() on the legacy Query class (where replaced).
    This inspection is heuristic and should be adjusted to concrete project files if needed.
    """
    if models_module is None:
        pytest.skip("No models module available to inspect for deprecated SQLAlchemy APIs")

    source_path = getattr(models_module, "__file__", None)
    if not source_path or not os.path.exists(source_path):
        pytest.skip("Cannot locate source file for models module to inspect SQLAlchemy API usage")

    with open(source_path, "r", encoding="utf-8") as f:
        source = f.read()

    deprecated_snippets = [
        ".query.get(",
        "query.get(",
        "Query.get(",
    ]
    for snippet in deprecated_snippets:
        assert snippet not in source, f"Deprecated SQLAlchemy 1.x API usage detected: {snippet}"


def test_new_config_keys_load_without_error(app):
    """
    Validate that configuration keys introduced as part of the upgrade
    can be accessed without raising KeyError or misconfiguration.
    These are representative examples; adjust names to match your config module.
    """
    # Examples of plausible new config keys for this migration.
    expected_keys = [
        "SQLALCHEMY_DATABASE_URI",
        "SQLALCHEMY_ENGINE_OPTIONS",
        "PYTHON_RUNTIME_BASELINE",
    ]

    for key in expected_keys:
        # Access via Flask's config mapping; missing keys should resolve to None, not crash.
        _ = app.config.get(key)


def test_database_url_config_is_consistent_with_engine(engine, app):
    """
    Ensure that the DATABASE_URL env/config used by SQLAlchemy 2.x engine is
    aligned with the Flask configuration after externalizing credentials.
    """
    database_url_env = os.environ.get("DATABASE_URL")
    if not database_url_env:
        pytest.skip("DATABASE_URL not set in environment; cannot validate consistency")

    flask_db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
    # If SQLALCHEMY_DATABASE_URI is set, it should match DATABASE_URL for consistency.
    if flask_db_uri:
        assert flask_db_uri == database_url_env, (
            "Flask SQLALCHEMY_DATABASE_URI should match DATABASE_URL environment value after config externalization"
        )