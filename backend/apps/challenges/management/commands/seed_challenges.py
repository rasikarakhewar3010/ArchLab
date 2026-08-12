"""
Seed Challenges — Management Command
======================================
Populates the database with 5 system design challenges so the
Challenges Dashboard has data to display immediately.

Usage:
    python manage.py seed_challenges
"""

from django.core.management.base import BaseCommand
from apps.challenges.models import Challenge


CHALLENGES = [
    {
        'title': 'Design a URL Shortener',
        'slug': 'url-shortener',
        'description': (
            'Build a service like bit.ly that takes long URLs and creates short, '
            'unique aliases. The system should handle millions of URL redirections '
            'per day with minimal latency.'
        ),
        'difficulty': 'easy',
        'functional_requirements': [
            'Users can create short URLs from long URLs',
            'Short URLs redirect to the original URL',
            'Users can optionally set custom aliases',
            'URLs have an expiration time (default 5 years)',
        ],
        'non_functional_requirements': [
            'Handle 500M new URLs per month',
            '100:1 read-to-write ratio (50B redirections/month)',
            'URL redirection latency < 100ms',
            '99.9% availability',
        ],
        'hints': [
            'Think about how to generate unique short keys — what hashing approach works?',
            'With a 100:1 read ratio, caching will be critical. Where should you place a cache?',
            'How do you handle hash collisions? Consider using a counter or base62 encoding.',
        ],
        'companies': ['Google', 'Amazon', 'Microsoft', 'Meta'],
        'time_limit_minutes': 30,
        'is_free': True,
        'order': 1,
    },
    {
        'title': 'Design a Paste Bin',
        'slug': 'paste-bin',
        'description': (
            'Design a web service where users can store and share plain text. '
            'Think Pastebin.com — users paste text, get a unique URL, and can share it with others.'
        ),
        'difficulty': 'easy',
        'functional_requirements': [
            'Users can paste text content and get a unique URL',
            'Content can be public or private',
            'Support syntax highlighting for code',
            'Paste expiration (1 hour, 1 day, 1 week, never)',
        ],
        'non_functional_requirements': [
            'Handle 1M new pastes per day',
            '5:1 read-to-write ratio',
            'Low latency reads (< 200ms)',
            'High availability (99.9%)',
        ],
        'hints': [
            'This is similar to URL Shortener but with larger payloads. Where should you store the content?',
            'Object storage (like S3) is great for large blobs of text. How do you generate unique keys?',
            'Think about a CDN for frequently accessed pastes.',
        ],
        'companies': ['Amazon', 'Dropbox'],
        'time_limit_minutes': 30,
        'is_free': True,
        'order': 2,
    },
    {
        'title': 'Design Instagram',
        'slug': 'instagram',
        'description': (
            'Design a photo-sharing social network. Users can upload photos, '
            'follow other users, and see a news feed of photos from people they follow.'
        ),
        'difficulty': 'medium',
        'functional_requirements': [
            'Users can upload and share photos',
            'Users can follow/unfollow other users',
            'Generate a news feed from followed users',
            'Users can search photos by hashtags/location',
        ],
        'non_functional_requirements': [
            'Handle 500M daily active users',
            '2M new photos per day (200GB/day storage)',
            'News feed generation latency < 500ms',
            '99.99% availability',
        ],
        'hints': [
            'Separate read and write paths. Writes are less frequent but heavy (photo upload). Reads are very frequent (news feed).',
            'Pre-generate news feeds using a fan-out approach. Push vs Pull — which is better?',
            'How do you store photos efficiently? Think about object storage + CDN.',
        ],
        'companies': ['Meta', 'Google', 'Twitter', 'Pinterest'],
        'time_limit_minutes': 45,
        'is_free': True,
        'order': 1,
    },
    {
        'title': 'Design Twitter',
        'slug': 'twitter',
        'description': (
            'Design a social media platform where users can post short messages (tweets), '
            'follow other users, and view a home timeline. Handle celebrity users with millions of followers.'
        ),
        'difficulty': 'hard',
        'functional_requirements': [
            'Users can post tweets (280 chars + media)',
            'Users can follow/unfollow other users',
            'Home timeline aggregates tweets from followed users',
            'Search tweets by keywords and hashtags',
            'Support trending topics',
        ],
        'non_functional_requirements': [
            'Handle 300M monthly active users',
            '600 tweets/second write throughput',
            'Timeline generation latency < 300ms',
            'Handle celebrity accounts (10M+ followers) without fan-out storms',
        ],
        'hints': [
            'The biggest challenge is the fan-out problem. When a user tweets, how do you deliver it to all followers?',
            'Use a hybrid approach: fan-out-on-write for normal users, fan-out-on-read for celebrities.',
            'Message queues are essential here for async fan-out processing.',
        ],
        'companies': ['Twitter', 'Meta', 'Google', 'Uber'],
        'time_limit_minutes': 45,
        'is_free': True,
        'order': 1,
    },
    {
        'title': 'Design a Distributed Cache',
        'slug': 'distributed-cache',
        'description': (
            'Design a distributed caching system like Memcached or Redis Cluster. '
            'It should support consistent hashing, cache eviction policies, and handle node failures gracefully.'
        ),
        'difficulty': 'expert',
        'functional_requirements': [
            'GET/SET/DELETE operations with O(1) average time',
            'Support TTL (time-to-live) for cached entries',
            'Distribute data across multiple cache nodes',
            'Handle node additions and removals (rebalancing)',
        ],
        'non_functional_requirements': [
            'Sub-millisecond read latency (< 1ms)',
            'Handle 1M+ operations per second',
            'Minimal data movement during rebalancing',
            '99.99% availability with automatic failover',
        ],
        'hints': [
            'Consistent hashing is the key to distributing data. How does it minimize data movement when nodes change?',
            'What eviction policy will you use? LRU, LFU, or FIFO? How does this affect your data structure choice?',
            'How do you detect and handle node failures? Think about heartbeats and replicas.',
        ],
        'companies': ['Amazon', 'Google', 'Netflix', 'Meta'],
        'time_limit_minutes': 60,
        'is_free': False,
        'order': 1,
    },
]


class Command(BaseCommand):
    help = 'Seed the database with system design challenges'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for challenge_data in CHALLENGES:
            obj, created = Challenge.objects.update_or_create(
                slug=challenge_data['slug'],
                defaults=challenge_data,
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  Created: {obj.title}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'  Updated: {obj.title}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done! {created_count} created, {updated_count} updated. '
            f'Total: {Challenge.objects.count()} challenges.'
        ))
