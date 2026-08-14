from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Design, DesignVersion

User = get_user_model()

class DesignModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='designer', password='password')
        self.design = Design.objects.create(
            title='My Architecture',
            author=self.user,
            is_public=True
        )

    def test_design_creation(self):
        self.assertEqual(self.design.title, 'My Architecture')
        self.assertTrue(self.design.is_public)
        self.assertEqual(self.design.stars_count, 0)
        self.assertEqual(self.design.forks_count, 0)

    def test_design_versioning(self):
        version = DesignVersion.objects.create(
            design=self.design,
            version_number=1,
            nodes=[{"id": "1", "type": "client"}],
            edges=[],
            change_description='Initial commit'
        )
        self.assertEqual(version.version_number, 1)
        self.assertEqual(len(version.nodes), 1)
        self.assertEqual(self.design.versions.count(), 1)
