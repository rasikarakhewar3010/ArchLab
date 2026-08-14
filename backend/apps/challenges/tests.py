from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Challenge, ChallengeAttempt
from .leaderboard import update_user_gamification

User = get_user_model()

class ChallengeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='challenger', password='pwd')
        self.challenge = Challenge.objects.create(
            title='Design a Cache',
            slug='design-a-cache',
            difficulty='medium'
        )

    def test_challenge_attempt_creation(self):
        attempt = ChallengeAttempt.objects.create(
            user=self.user,
            challenge=self.challenge,
            status='in_progress'
        )
        self.assertEqual(attempt.status, 'in_progress')
        self.assertIsNone(attempt.score)

    def test_gamification_leaderboard_update(self):
        # Create a scored attempt
        ChallengeAttempt.objects.create(
            user=self.user,
            challenge=self.challenge,
            status='scored',
            score=95
        )
        
        # Trigger gamification update
        update_user_gamification(self.user)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.challenge_score, 95)
        self.assertEqual(self.user.completed_challenges, 1)
        self.assertIn('first_blood', self.user.badges)
        self.assertIn('architect', self.user.badges)
