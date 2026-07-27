import pytest
import sqlalchemy
from sqlalchemy import create_engine, text, inspect, MetaData, Table, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import importlib

TARGET_SQLALCHEMY_VERSION = "2.0.30"

Base = declarative_base()

# Example model for path validation
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)


@pytest.fixture(scope="module")
def engine():
    # Use in-memory sqlite for tests
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True, echo=False)
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def session(engine):
    # Use 2.x sessionmaker and context management
    SessionLocal = sessionmaker(bind=engine, future=True)
    with SessionLocal() as session:
        yield session


def test_sqlalchemy_version():
    # Verify SQLAlchemy is at the exact target version
    assert sqlalchemy.__version__ == TARGET_SQLALCHEMY_VERSION, (
        f"SQLAlchemy version mismatch: found {sqlalchemy.__version__}, expected {TARGET_SQLALCHEMY_VERSION}"
    )


def test_basic_orm_path(session):
    # Validate a critical path: object insert, query, delete
    u = User(name="Alice")
    session.add(u)
    session.commit()
    # 2.x idiom: use session.get, not legacy session.query()
    fetched = session.get(User, u.id)
    assert fetched is not None
    assert fetched.name == "Alice"
    session.delete(fetched)
    session.commit()
    assert session.get(User, u.id) is None


def test_sqlalchemy_deprecated_query_removed(session):
    # session.query() has been deprecated in SQLAlchemy 2.x.
    # It is an alias but usage is discouraged.
    # Intentionally check that .query is not present (strict migration),
    # or at least fails with AttributeError if removed.
    # If it is present, usage should be flagged (this test will fail).
    assert not hasattr(session, "query"), "Legacy 'session.query' should not be present in SQLAlchemy 2.x session object"


def test_sqlalchemy_explicit_execute_required(session, engine):
    # Test explicit connection execution (2.x)
    # Engine.execute() is removed; must use connection or session execute
    stmt = text("SELECT 1")
    with engine.connect() as conn:
        result = conn.execute(stmt)
        row = result.first()
        assert row[0] == 1
    # Engine.execute should not exist
    assert not hasattr(engine, "execute"), "engine.execute is no longer supported in SQLAlchemy 2.x"


def test_new_style_sessionmaker_and_base(engine):
    # Ensure sessionmaker, declarative_base work as per 2.x
    SessionLocal = sessionmaker(bind=engine, future=True)
    with SessionLocal() as s:
        assert isinstance(s, Session)
    # Check that declarative_base comes from sqlalchemy.orm (not ext.declarative)
    assert "declarative_base" in dir(importlib.import_module("sqlalchemy.orm"))


def test_metadata_create_load(engine):
    # Confirm MetaData (as config) still loads/creates tables as expected in 2.x
    metadata = MetaData()
    t = Table("orders", metadata,
        Column("id", Integer, primary_key=True),
        Column("product", String, nullable=False),
    )
    metadata.create_all(bind=engine)
    insp = inspect(engine)
    assert "orders" in insp.get_table_names()
    columns = {col['name'] for col in insp.get_columns("orders")}
    assert columns == {"id", "product"}


def test_new_engine_autobegin_option():
    # A new configuration key introduced in SQLAlchemy 2.x is "autobegin".
    # Validate can set and load it without error.
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        future=True,
        connect_args={},
        pool_pre_ping=True,
        # "autobegin" is a Session option, but test engine instantiations are unaffected
    )
    SessionLocal = sessionmaker(bind=engine, future=True, autobegin=True)
    with SessionLocal() as s:
        assert s._autobegin is True
    engine.dispose()