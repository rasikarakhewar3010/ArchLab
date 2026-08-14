from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class UserGamificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='password123'
        )
        self.client = APIClient()

    def test_user_creation_default_fields(self):
        self.assertEqual(self.user.challenge_score, 0)
        self.assertEqual(self.user.badges, [])
        self.assertEqual(self.user.rank, 0)

    def test_gamification_updates(self):
        self.user.challenge_score = 150
        self.user.completed_challenges = 3
        self.user.badges = ['first_blood']
        self.user.save()

        updated_user = User.objects.get(username='testuser')
        self.assertEqual(updated_user.challenge_score, 150)
        self.assertEqual(updated_user.completed_challenges, 3)
        self.assertIn('first_blood', updated_user.badges)
