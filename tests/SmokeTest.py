import sys
import unittest

class TestPython312Upgrade(unittest.TestCase):

    TARGET_PYTHON_VERSION = (3, 12)

    def test_python_version_exact(self):
        """Test the interpreter is running at exactly Python 3.12.x"""
        major, minor = sys.version_info[:2]
        self.assertEqual(
            (major, minor),
            self.TARGET_PYTHON_VERSION,
            f"Python version should be exactly {self.TARGET_PYTHON_VERSION}, got {major}.{minor}"
        )

    def test_basic_application_path(self):
        """Verify a simple and critical application code path works in Python 3.12"""
        # Example: simple core feature (adjust if you have an actual application import)
        greeting = "hello world!"
        self.assertEqual(greeting.title(), "Hello World!")  # Unicode method unchanged

    def test_deprecated_api_removal(self):
        """
        Assert APIs removed in Python 3.12 are not present and usage fails as expected.
        For example, asyncio.get_event_loop() without a running event loop now raises a RuntimeError.
        """
        import asyncio
        # In Python 3.12, get_event_loop() raises RuntimeError when there is no running event loop
        with self.assertRaises(RuntimeError):
            asyncio.get_event_loop()

    def test_new_standard_library_feature(self):
        """
        Test a new standard library feature introduced in Python 3.12 loads and works.
        Example: sys.implementation.name explicitly set to 'cpython' by default,
        or use of the new 'tomllib' module introduced in 3.11 (which is available here).
        """
        import tomllib
        sample_toml = b"[section]\nanswer = 42"
        parsed = tomllib.loads(sample_toml)
        self.assertEqual(parsed["section"]["answer"], 42)

    def test_new_configuration_key(self):
        """
        If the application uses pyproject.toml, test loading new config keys compatible with Python 3.12.
        If not applicable, test parsing TOML files via tomllib (introduced in 3.11, present in 3.12)
        to ensure new configuration files do not error.
        """
        import tomllib
        sample_toml = b"""
        [python312_specific]
        new_key = "supported"
        """
        config = tomllib.loads(sample_toml)
        self.assertIn("python312_specific", config)
        self.assertEqual(config["python312_specific"]["new_key"], "supported")


if __name__ == "__main__":
    unittest.main()