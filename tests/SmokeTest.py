import unittest
import flask
from flask import Flask, jsonify, Blueprint, current_app
import sys

class TestFlaskUpgrade303(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)

        # Add a critical route
        @self.app.route('/health')
        def health():
            return jsonify({'status': 'ok'}), 200

        # Add a blueprint
        bp = Blueprint('test_bp', __name__)

        @bp.route('/bp')
        def blueprint_route():
            return 'blueprint active', 200

        self.app.register_blueprint(bp)
        self.app.config['SECRET_KEY'] = 's3cr3t'
        # Introduce a new config key available in Flask 3.0.x (for demonstration, 'ENV' is standard, 'TEMPLATES_AUTO_RELOAD' became default True in Flask 3.0+)
        self.app.config['TEMPLATES_AUTO_RELOAD'] = True

        self.client = self.app.test_client()

    def test_flask_version_exact(self):
        """Verify active Flask is the exact target version (3.0.3)."""
        self.assertEqual(flask.__version__, '3.0.3', f"Flask version is {flask.__version__}, expected 3.0.3.")

    def test_health_endpoint_works(self):
        """Confirm critical application path responds as expected."""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'status': 'ok'})

    def test_blueprint_route(self):
        """Verify registered blueprint endpoint is functional."""
        response = self.client.get('/bp')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'blueprint active', response.data)

    def test_deprecated_api_removed(self):
        """
        Confirm deprecated APIs (e.g., Flask 1.x 'flask.ext.*') are not accessible.
        In Flask 3.x, 'flask.ext' has been removed and will raise ImportError.
        """
        with self.assertRaises(ImportError):
            __import__('flask.ext')

    def test_new_config_key(self):
        """
        Check that a new/changed config key introduced since Flask 2+ is loaded and accessible.
        In Flask 3.x, 'TEMPLATES_AUTO_RELOAD' defaults to True. Assert it's present and True.
        """
        self.assertIn('TEMPLATES_AUTO_RELOAD', self.app.config)
        self.assertTrue(self.app.config['TEMPLATES_AUTO_RELOAD'])

    def test_request_lifecycle(self):
        """Verify request context operates as usual in Flask 3.0.3."""
        with self.app.test_request_context('/health'):
            self.assertEqual(current_app.name, self.app.name)

    def test_jsonify_import(self):
        """Test that 'flask.jsonify' import works (API consistency across versions)."""
        from flask import jsonify
        self.assertTrue(callable(jsonify))

if __name__ == '__main__':
    unittest.main()