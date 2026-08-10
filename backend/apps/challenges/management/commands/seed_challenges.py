from django.core.management.base import BaseCommand
from apps.challenges.models import Challenge

class Command(BaseCommand):
    help = 'Seeds the database with initial system design challenges'

    def handle(self, *args, **kwargs):
        challenges = [
            {
                'title': 'Design a URL Shortener (like TinyURL)',
                'slug': 'design-url-shortener',
                'description': 'Design a service that takes a long URL and generates a short, unique alias for it.',
                'difficulty': 'easy',
                'functional_requirements': ['Generate short URL', 'Redirect to original URL', 'Custom short links (optional)'],
                'non_functional_requirements': ['Highly available', 'Low latency redirection', 'Links should not be predictable'],
                'hints': ['Think about hash functions or base62 encoding.', 'How will you handle collisions?', 'Do you need a cache?'],
                'companies': ['Google', 'Meta', 'Amazon'],
                'time_limit_minutes': 45,
                'is_free': True
            },
            {
                'title': 'Design a Rate Limiter',
                'slug': 'design-rate-limiter',
                'description': 'Design a scalable rate limiting system that controls the rate of traffic sent by a client or a service.',
                'difficulty': 'medium',
                'functional_requirements': ['Limit requests per IP or user', 'Return 429 Too Many Requests if limit exceeded', 'Support different rules for different endpoints'],
                'non_functional_requirements': ['Low latency (cannot slow down requests)', 'Highly accurate across distributed servers', 'Fault tolerant'],
                'hints': ['Consider Token Bucket or Sliding Window Log algorithms.', 'Where should the rate limiter sit in the architecture?', 'Redis is your friend here.'],
                'companies': ['Stripe', 'Lyft', 'Netflix'],
                'time_limit_minutes': 45,
                'is_free': True
            },
            {
                'title': 'Design Netflix (Video Streaming Service)',
                'slug': 'design-netflix',
                'description': 'Design a global video streaming platform that handles millions of concurrent users.',
                'difficulty': 'hard',
                'functional_requirements': ['Upload videos', 'Stream videos globally', 'Track viewing history'],
                'non_functional_requirements': ['No buffering (low latency)', 'High availability', 'Massive scale (CDN required)'],
                'hints': ['Separate the control plane (website) from the data plane (video streaming).', 'How do CDNs actually work?', 'What protocol is used for streaming?'],
                'companies': ['Netflix', 'Amazon', 'Disney'],
                'time_limit_minutes': 60,
                'is_free': False
            }
        ]

        created_count = 0
        for data in challenges:
            obj, created = Challenge.objects.get_or_create(
                slug=data['slug'],
                defaults=data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created challenge: {obj.title}'))
            else:
                self.stdout.write(self.style.WARNING(f'Challenge already exists: {obj.title}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} challenges.'))
