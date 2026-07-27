"""
sqlalchemy_compat23.py

Compatibility helper and migration shim for SQLAlchemy 1.3 → 2.x upgrade.

Provides:
- Deprecated API re-exports or wrappers
- Renamed class/function aliases for legacy code
- Import shims for moved or split modules
- Config migration utility for engine/session
- Explicit TODOs where manual migration is still required

USAGE:
    import sqlalchemy_compat23 as sa

    # Use sa.create_engine, sa.sessionmaker, etc, as drop-in

After migration, safely remove this shim once all usages have been fully refactored.
"""

import sqlalchemy
from sqlalchemy import (
    create_engine as _create_engine2,
    select as _select2,
    text as _text2,
    Integer,
    String,
    Column,
    Boolean,  # etc -- expand per your model needs
    ForeignKey,
)
from sqlalchemy.exc import SQLAlchemyError

# Session/orm imports refactored for 2.x
from sqlalchemy.orm import (
    registry,
    declarative_base as _declarative_base2,
    DeclarativeBase,
    sessionmaker as _sessionmaker2,
    scoped_session as _scoped_session2,
    relationship,
)

# --------------------------------------------------------
# Deprecated APIs — Aliases and wrappers
# --------------------------------------------------------

# 1. session.query(): Deprecated in 2.x
# Provide a wrapper to redirect use to Session.execute(select())
def query(session, *entities):
    """
    Compatibility shim for session.query(...), replaced in 2.x.

    Usage: results = query(session, User).filter(...)
    """
    # TODO: REFRACTOR: Confirm and port all usages of session.query() to SQLAlchemy 2.x select() patterns.
    # This wrapper will break with complex query APIs or chaining (e.g., .join(), .outerjoin(), etc)
    stmt = _select2(*entities)
    return session.execute(stmt)

# 2. engine.execute(): Removed in 2.x; must use connections or session.execute()
def engine_execute(engine, statement, *args, **kwargs):
    """
    Shim for engine.execute(), which was removed in SQLAlchemy 2.x.
    """
    # TODO: MANUAL: Migrate engine.execute(...) usage to use connections, or session.execute().
    with engine.connect() as conn:
        return conn.execute(statement, *args, **kwargs)

# 3. session.execute() signature changed in 2.x -- must pass explicit SQL constructs, not plain strings.
def session_execute(session, statement, *args, **kwargs):
    """
    Compatibility wrapper for session.execute().
    Accepts strings (text), will wrap with sqlalchemy.text if detected.
    """
    if isinstance(statement, str):
        statement = _text2(statement)
    return session.execute(statement, *args, **kwargs)

# --------------------------------------------------------
# Renamed/removed/moved imports
# --------------------------------------------------------

# 4. Shim for declarative_base moved/import changes
def declarative_base(*args, **kwargs):
    """
    Backwards-compatible import for declarative_base().
    """
    # 2.x: declarative_base still available, but behavior changed with pyright in some versions.
    return _declarative_base2(*args, **kwargs)

# Alias for sessionmaker, scoped_session
sessionmaker = _sessionmaker2
scoped_session = _scoped_session2

# 5. autoload=True and autoload_with: 'autoload' is removed in 2.x, use 'autoload_with'
# No direct code substitution possible, must search for Table(..., autoload=True, autoload_with=engine)
# TODO: MANUAL: Refactor Table(..., autoload=True, ...) to Table(..., autoload_with=engine, ...)
# e.g.
#   Table('mytable', meta, autoload=True, autoload_with=engine)
# becomes
#   Table('mytable', meta, autoload_with=engine)

# --------------------------------------------------------
# Config Migration Utility
# --------------------------------------------------------

def migrate_sqlalchemy_config(old_config: dict) -> dict:
    """
    Transform old SQLAlchemy engine/session config dict from 1.3 → 2.x compatible.

    - Remove deprecated keys ('convert_unicode', 'pool_size', etc if deprecated).
    - Handle new defaults or renamed options.
    - Provide guidance for changed behavior.
    """
    import copy
    config = copy.deepcopy(old_config)
    # Example changes:
    # 1. 'convert_unicode' is removed in 2.x.
    config.pop('convert_unicode', None)
    # 2. Remove 'implicit_returning' (now defaults to True; older engines may not support)
    config.pop('implicit_returning', None)
    # 3. Remove 'pool_timeout' if present and rely on defaults unless customized
    # TODO: Review pool settings to ensure intended behavior under 2.x.
    # 4. Transaction isolation: keys renamed, must use ExecutionOptions
    # TODO: MANUAL: If using 'isolation_level' in engine or sessionmaker, confirm usage and update as needed.
    return config

# --------------------------------------------------------
# Helper for legacy import patterns (usage: from sqlalchemy_compat23 import *)
# --------------------------------------------------------

# All commonly-used SQLAlchemy top-level imports (expand as needed)
__all__ = [
    'create_engine',
    'sessionmaker',
    'scoped_session',
    'declarative_base',
    'DeclarativeBase',
    'registry',
    'relationship',
    # Model column types
    'Column', 'Integer', 'String', 'Boolean', 'ForeignKey',
    # Wrappers and shims
    'query', 'engine_execute', 'session_execute',
    'migrate_sqlalchemy_config',
    # Exceptions
    'SQLAlchemyError',
]

# --------------------------------------------------------
# Top-level aliases to preserve original names
# --------------------------------------------------------

create_engine = _create_engine2

# --------------------------------------------------------
# REMINDER: Manual Search/Replace Required!
# --------------------------------------------------------
# 1. Remove or refactor all instances of:
#       - session.query(...) → session.execute(select(...))
#       - engine.execute(...) → with engine.connect(): conn.execute(...)
#       - Table(..., autoload=True, ...) → Table(..., autoload_with=engine, ...)
# 2. If using Query.scalar(), Query.first(), etc: Must rewrite as session.scalars(stmt).first(), etc.
# 3. Implicit transactions and legacy automatic commits: Explicit transaction management required.
# 4. Review 'session.autocommit' and 'session.begin(subtransactions=True)' patterns; these no longer work.
# 5. Remove unused imports for modules removed in SQLAlchemy 2.x (e.g. sqlalchemy.ext.declarative).
# 6. Flask-SQLAlchemy integration: Double-check your extension version — old Flask-SQLAlchemy < 3.x is not compatible!
#    TODO: Ensure Flask-SQLAlchemy is compatible with SQLAlchemy 2.x and Flask 3.x.

# Place any application-wide usage guidance or detection below as needed.

# END OF FILE