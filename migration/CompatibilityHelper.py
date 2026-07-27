"""
compat_flask.py

Migration helper for upgrading Flask 1.x-based codebases to Flask 3.x.

- Deprecated API replacements: wraps/re-exports old API signatures against new equivalents.
- Renamed classes/imports: provides import shims or aliases where possible.
- Config format changes: function to upgrade old app config to new Flask 3.x standard.
- Includes TODO comments for manual intervention on unresolved breaking changes.

Usage:
    import compat_flask as flask
    # Or selectively:
    # from compat_flask import Flask, request, ...  
"""

import flask as _flask

# Deprecated/Removed APIs: re-export under old names if possible
Flask = _flask.Flask
Blueprint = _flask.Blueprint
Request = _flask.Request
Response = _flask.Response
g = _flask.g
current_app = _flask.current_app

# Import shims for commonly-used Flask public symbols
request = _flask.request
session = _flask.session
jsonify = _flask.jsonify
make_response = _flask.make_response
redirect = _flask.redirect
url_for = _flask.url_for
abort = _flask.abort
has_request_context = _flask.has_request_context

# Migrate flask.json usage (deprecated in Flask 2.x+, see design.md/spec.md)
if hasattr(_flask, "json"):
    json = _flask.json
else:
    # TODO: Review usage of 'flask.json' - in Flask >=3.0 it's an implicit proxy for 'flask.json.provider'
    # Consider switching to Flask's app.json provider or using 'flask.jsonify'.
    json = None

# Shim for old 'flask.safe_join', removed after 2.x
try:
    from flask.helpers import safe_join
except ImportError:
    import os
    def safe_join(directory, *pathnames):
        # Emulation of Flask 1.x safe_join
        # TODO: Verify all uses of 'flask.safe_join' as this fallback does not include Flask's normalization.
        norm = os.path.normpath(os.path.join(directory, *pathnames))
        if os.path.commonpath([directory, norm]) != os.path.abspath(directory):
            # Insecure path, do not allow
            raise ValueError('Attempted unsafe path traversal in request')
        return norm

# Shim for Flask CLI, 'flask.cli.run_command' was renamed to 'flask.cli.run'
# See design.md: manual intervention may be needed for custom CLI
try:
    from flask.cli import run as run_command
except ImportError:
    # TODO: Update all uses of 'flask.cli.run_command' to 'flask.cli.run'
    run_command = None

# Handle Flask.Config changes (Config.from_envvar, config pattern changes)
def migrate_config_1x_to_3x(old_config: dict) -> dict:
    """
    Migrates a Flask 1.x style config dictionary to be compatible with Flask 3.x.

    Handles common key renames, removed settings, and known default changes.
    """
    new_config = dict(old_config)  # Start with a copy

    # Example: FLASK_ENV removed in 3.x, use FLASK_DEBUG
    if "FLASK_ENV" in new_config:
        env_val = new_config.pop("FLASK_ENV")
        if "FLASK_DEBUG" not in new_config:
            # Set FLASK_DEBUG based on FLASK_ENV value if possible
            if env_val == "development":
                new_config["FLASK_DEBUG"] = True
            elif env_val == "production":
                new_config["FLASK_DEBUG"] = False
            # TODO: Review semantics if FLASK_ENV had nonstandard values

    # Example: JSONIFY_MIMETYPE replaced by 'app.json.mimetype' config interface
    if "JSONIFY_MIMETYPE" in new_config:
        mimetype = new_config.pop("JSONIFY_MIMETYPE")
        new_config["JSON_MIMETYPE"] = mimetype  # Use until manual review
        # TODO: If using app.json, set via 'app.json.mimetype = "...";' after app creation

    # TODO: Review all config keys for behavior changes per Flask 3.x release notes

    return new_config

# Shim for (legacy) 'app.json_encoder'/'app.json_decoder' removed in Flask 3.x
def set_json_encoder(app, encoder_cls):
    """
    Flask 1.x codebase may assign app.json_encoder, which is removed in Flask 3.x.
    This compatibility function sets the encoder on Flask 3.x's JSON provider.
    """
    if hasattr(app, 'json') and hasattr(app.json, 'encoder_class'):
        app.json.encoder_class = encoder_cls
    else:
        # TODO: Manual review — Flask app may not have a modern JSON provider; migrate custom encoders to new API.
        pass

def set_json_decoder(app, decoder_cls):
    """
    Flask 1.x codebase may assign app.json_decoder, which is removed in Flask 3.x.
    This compatibility function sets the decoder on Flask 3.x's JSON provider.
    """
    if hasattr(app, 'json') and hasattr(app.json, 'decoder_class'):
        app.json.decoder_class = decoder_cls
    else:
        # TODO: Manual review — Flask app may not have a modern JSON provider; migrate custom decoders to new API.
        pass

# Stricter return value enforcement in route handlers in Flask 3.x
def ensure_valid_flask_response(rv):
    """
    Ensures a Flask route return value is compliant with Flask 3.x strict response types.
    """
    from flask.wrappers import Response as FlaskResponse
    # Flask 3.x: Must return Response, str, bytes, tuple (with status/headers) or WSGI callable
    if isinstance(rv, (str, bytes, FlaskResponse)):
        return rv
    elif isinstance(rv, tuple) and isinstance(rv[0], (str, bytes, FlaskResponse)):
        return rv
    else:
        # TODO: Review route handler return values to ensure 3.x compatibility.
        raise TypeError("Invalid response type for Flask 3.x; must be string, bytes, Response, or valid tuple.")

# Flask signals locations did not change in 3.x, but if using direct imports, recommend importing via this shim
from flask.signals import template_rendered, request_started, request_finished, got_request_exception

# Extension integration: No generalized shims possible (depends on extension),
# but surface most common pattern change.
# TODO: Ensure all Flask extensions in use are compatible with 3.x or upgrade as needed.

# Expose all re-exported symbols for wildcard import
__all__ = [
    "Flask",
    "Blueprint",
    "Request",
    "Response",
    "g",
    "current_app",
    "request",
    "session",
    "jsonify",
    "make_response",
    "redirect",
    "url_for",
    "abort",
    "has_request_context",
    "json",
    "safe_join",
    "run_command",
    "migrate_config_1x_to_3x",
    "set_json_encoder",
    "set_json_decoder",
    "ensure_valid_flask_response",
    "template_rendered",
    "request_started",
    "request_finished",
    "got_request_exception",
]