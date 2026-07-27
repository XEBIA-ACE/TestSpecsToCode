import unittest
import sqlalchemy
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, Session
import sys

# Example model for critical path test
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String(50), nullable=False)

TEST_DATABASE_URL = "sqlite:///:memory:"

class TestSQLAlchemyUpgrade(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(TEST_DATABASE_URL, future=True)
        Base.metadata.create_all(cls.engine)
        # Insert an example user for CRUD tests
        with Session(cls.engine) as session:
            session.add(User(name="Alice"))
            session.commit()

    def test_sqlalchemy_exact_version(self):
        self.assertEqual(sqlalchemy.__version__, "2.0.29", msg="SQLAlchemy version must be exactly 2.0.29")

    def test_critical_path_crud(self):
        # Test basic CRUD operations with 2.0-style API
        with Session(self.engine) as session:
            # CREATE was done in setUpClass
            # READ using 2.x-style select
            stmt = sqlalchemy.select(User).where(User.name == "Alice")
            result = session.execute(stmt)
            user = result.scalar_one()
            self.assertEqual(user.name, "Alice")
            # UPDATE
            user.name = "Bob"
            session.commit()
            # FETCH again
            user = session.get(User, user.id)
            self.assertEqual(user.name, "Bob")
            # DELETE
            session.delete(user)
            session.commit()
            user = session.get(User, user.id)
            self.assertIsNone(user)

    def test_removed_deprecated_api_unavailable(self):
        with Session(self.engine) as session:
            # session.query(Model).get(id) — removed in 2.x
            query = session.query(User)
            with self.assertRaises(AttributeError):
                # 'Query' object has no attribute 'get' in 2.x
                query.get(1)
            # Query.select() is removed in 2.x
            with self.assertRaises(AttributeError):
                query.select()
        # SQLAlchemy no longer provides sqlalchemy.ext.declarative
        with self.assertRaises(ImportError):
            import sqlalchemy.ext.declarative

    def test_new_configuration_key_acceptance(self):
        # "future" is a new config keyword argument in SQLAlchemy 2.x
        # Ensure engine creation with new config key works
        engine = create_engine(TEST_DATABASE_URL, future=True)
        self.assertIsNotNone(engine)

    def test_declarative_base_import_path(self):
        # Assert only new import style works, old removed
        try:
            from sqlalchemy.orm import declarative_base as db1
        except ImportError:
            self.fail("New import path for declarative_base from sqlalchemy.orm should work")
        with self.assertRaises(ImportError):
            # The old import path is gone in 2.x
            from sqlalchemy.ext.declarative import declarative_base

if __name__ == '__main__':
    unittest.main()