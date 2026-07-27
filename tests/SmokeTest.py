import sys
import importlib.util
import pytest
import subprocess

TARGET_PYTHON_VERSION = (3, 12)

def test_python_version_exact():
    # Ensure the running interpreter is at exactly 3.12.x (any micro)
    assert sys.version_info[:2] == TARGET_PYTHON_VERSION, (
        f"Python version mismatch: expected 3.12.x, got {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    )

def test_python_cli_version_output():
    # Run "python --version" via subprocess and check the output
    result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
    version_line = result.stdout.strip() or result.stderr.strip()
    assert version_line.startswith("Python 3.12"), f"python --version output mismatch: got '{version_line}'"

def test_standard_library_typing_text_no_longer_exists():
    # typing.Text is removed in Python 3.12
    import typing
    assert not hasattr(typing, "Text"), "typing.Text should not exist in Python 3.12"

def test_standard_library_inspect_getargspec_removed():
    # inspect.getargspec is removed in Python 3.12
    import inspect
    assert not hasattr(inspect, "getargspec"), "inspect.getargspec should not exist in Python 3.12"

def test_standard_library_new_features_exist():
    # Example: sys.fileno encoding support (added in 3.11) and sys.stdlib_module_names (added in 3.10)
    assert hasattr(sys, "stdlib_module_names"), "sys.stdlib_module_names should exist in Python 3.12"

@pytest.mark.parametrize("module_name", [
    "tomllib",   # new in Python 3.11+, should always exist in 3.12
    "zoneinfo",  # new in Python 3.9+, required to exist in 3.12
])
def test_new_python_stdlib_modules_present(module_name):
    spec = importlib.util.find_spec(module_name)
    assert spec is not None, f"{module_name} module not found; expected present in Python 3.12"

def test_critical_application_path_import_and_run(monkeypatch):
    """
    Loads and exercises a critical application path to ensure it runs under Python 3.12.
    Assumes 'main.py' with 'create_app()' for Flask REST API is present.
    """
    import importlib
    main = importlib.import_module("main")
    assert hasattr(main, "create_app"), "main.create_app() not found"
    app = main.create_app()
    client = app.test_client()
    response = client.get("/")
    assert response.status_code in (200, 404, 401), f"Root path GET / failed, status: {response.status_code}"

def test_no_hardcoded_python38_references_in_dot_python_version():
    try:
        with open(".python-version", "r") as f:
            content = f.read()
            assert "3.8" not in content, ".python-version should not reference Python 3.8 after upgrade"
            assert "3.12" in content, ".python-version should reference Python 3.12 after upgrade"
    except FileNotFoundError:
        pytest.skip(".python-version not present; skipping")

def test_no_hardcoded_python38_references_in_runtime_txt():
    try:
        with open("runtime.txt", "r") as f:
            content = f.read()
            assert "3.8" not in content, "runtime.txt should not reference Python 3.8 after upgrade"
            assert "3.12" in content, "runtime.txt should reference Python 3.12 after upgrade"
    except FileNotFoundError:
        pytest.skip("runtime.txt not present; skipping")