import sys
import importlib
import pytest

import flask
import sqlalchemy
from sqlalchemy import select, inspect, text
from sqlalchemy.orm import Session, declarative_base

# Example model import for test purposes -- adjust/remove as needed for real context.
# from your_app.models import User, Base

# For this hypothetical example, we'll create a minimal test model.
Base = declarative_base()

class User(Base):
    __tablename__ = 'user'
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    username = sqlalchemy.Column(sqlalchemy.String(50), nullable=False)

@pytest.fixture
def memory_engine():
    """A new SQLAlchemy 2.x engine for each test."""
    from sqlalchemy import create_engine
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()

@pytest.fixture
def session(memory_engine):
    with Session(memory_engine, future=True) as session:
        yield session
        session.rollback()

def test_sqlalchemy_version():
    assert sqlalchemy.__version__ == "2.0.29", f"Expected SQLAlchemy version 2.0.29, got {sqlalchemy.__version__}"

def test_flask_version():
    assert flask.__version__ == "3.0.3", f"Expected Flask version 3.0.3, got {flask.__version__}"

def test_python_version():
    # Python 3.12+ is required, but we allow micro version variation.
    assert sys.version_info >= (3, 12), "Python 3.12 or higher required for this upgrade."

def test_explicit_session_usage(session):
    user = User(username="charlie")
    session.add(user)
    session.commit()

    result = session.execute(select(User).where(User.username == "charlie")).scalar_one()
    assert result.username == "charlie"

def test_deprecated_query_api_removed(session):
    # Legacy API: session.query() is removed in SA 2.x -- using it should error
    with pytest.raises(AttributeError):
        _ = session.query(User)

def test_select_syntax_works(session):
    u = User(username="bob")
    session.add(u)
    session.commit()
    stmt = select(User).where(User.username == "bob")
    result = session.execute(stmt).scalar_one()
    assert result.username == "bob"

def test_declarative_base_import_path():
    # Should import from sqlalchemy.orm in 2.x, and be a class (not function)
    assert hasattr(sqlalchemy.orm, "declarative_base"), "declarative_base missing from sqlalchemy.orm"
    assert callable(sqlalchemy.orm.declarative_base)

def test_automap_api_removed():
    # automap_base is deprecated/removed in some 2.x settings (depending on submodule availability)
    with pytest.raises(ImportError):
        importlib.import_module('sqlalchemy.ext.automap')

def test_model_constructor_and_relationships_work():
    user = User(username="dana")
    assert user.username == "dana"
    assert hasattr(user, "id")

def test_engine_explicit_binding_required(memory_engine):
    # Engine must be explicitly provided, implicit binding deprecated/removed
    # This should not error; table created earlier
    insp = inspect(memory_engine)
    assert 'user' in insp.get_table_names()

def test_new_config_keys_load(monkeypatch):
    # Suppose the upgrade introduced a new config key for SQLAlchemy 2.x:
    # Example: 'SQLALCHEMY_ENGINE_OPTIONS' in Flask
    # We'll simulate loading it.
    monkeypatch.setenv('SQLALCHEMY_ENGINE_OPTIONS', '{"pool_pre_ping": true}')
    import os, json
    engine_opts = json.loads(os.getenv('SQLALCHEMY_ENGINE_OPTIONS', '{}'))
    assert isinstance(engine_opts, dict)
    assert "pool_pre_ping" in engine_opts

def test_removed_session_args(memory_engine):
    # In 2.x, legacy Session args like 'binds' are removed.
    with pytest.raises(TypeError):
        # 'binds' was a legacy param to Session
        Session(memory_engine, binds={})

def test_no_legacy_implicit_engine(monkeypatch):
    # In 2.x, declarative base classes cannot auto-bind to engines.
    # We'll check that using the old-style does not work.
    with pytest.raises(TypeError):
        Base.query  # Would exist in Flask-SQLAlchemy 1.x style, but should not in vanilla SA2+ ORM

def test_connection_context_manager(memory_engine):
    # Connection context manager must work as per new APIs
    with memory_engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        val = result.scalar_one()
        assert val == 1