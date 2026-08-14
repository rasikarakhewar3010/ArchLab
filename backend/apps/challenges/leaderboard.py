"""
Leaderboard and Gamification Service
======================================
Calculates rankings, assigns badges, and manages user streaks.
"""

from django.db.models import Sum, F
from django.utils import timezone
from apps.users.models import User
from .models import ChallengeAttempt, Badge

def update_user_gamification(user):
    """
    Recalculates a user's total score, completed challenges count,
    and assigns new badges based on their activity.
    """
    # 1. Calculate total score from best attempts per challenge
    # To prevent farming, only take the max score per challenge
    attempts = ChallengeAttempt.objects.filter(
        user=user,
        status='scored',
        score__isnull=False
    ).values('challenge_id').annotate(max_score=Sum('score'))

    total_score = sum(attempt['max_score'] for attempt in attempts)
    user.challenge_score = total_score
    
    # 2. Count completed challenges
    user.completed_challenges = len(attempts)
    
    # 3. Check for badges
    earned_badges = set(user.badges)
    
    # Example Badges
    if user.completed_challenges >= 1 and 'first_blood' not in earned_badges:
        earned_badges.add('first_blood')
        
    if user.completed_challenges >= 5 and 'five_alive' not in earned_badges:
        earned_badges.add('five_alive')
        
    if user.streak_days >= 7 and 'week_warrior' not in earned_badges:
        earned_badges.add('week_warrior')
        
    if any(attempt['max_score'] >= 90 for attempt in attempts) and 'architect' not in earned_badges:
        earned_badges.add('architect')

    user.badges = list(earned_badges)
    user.save(update_fields=['challenge_score', 'completed_challenges', 'badges'])


def update_global_leaderboard():
    """
    Updates the rank field for all active users based on their challenge_score.
    Typically run as a background task (e.g., Celery) every few minutes or hours.
    """
    # Order users by score descending, then by username
    users = User.objects.filter(is_active=True).order_by('-challenge_score', 'username')
    
    # Bulk update ranks
    rank = 1
    for user in users:
        if user.rank != rank:
            user.rank = rank
            user.save(update_fields=['rank'])
        rank += 1

def get_top_users(limit=10):
    """Returns the top N users for the leaderboard."""
    return User.objects.filter(is_active=True, challenge_score__gt=0).order_by('rank')[:limit]
