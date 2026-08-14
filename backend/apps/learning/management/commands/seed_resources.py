"""
Seed Learning Resources — Management Command
===============================================
Populates the database with curated system design learning resources
from the top GitHub repositories and additional high-quality content.

Usage:
    python manage.py seed_resources
"""

from django.core.management.base import BaseCommand
from apps.learning.models import Resource, StudyPath, StudyPathResource


RESOURCES = [
    # =========================================================================
    # The 10 GitHub Repositories from the LinkedIn post
    # =========================================================================
    {
        'title': 'System Design Primer',
        'slug': 'system-design-primer',
        'url': 'https://github.com/donnemartin/system-design-primer',
        'description': (
            'The most comprehensive system design resource on GitHub. Covers scalability, '
            'availability, performance, latency vs throughput, CAP theorem, consistency patterns, '
            'and much more. Includes Anki flashcards for spaced repetition learning.'
        ),
        'source_type': 'github',
        'difficulty': 'beginner',
        'topics': ['scalability', 'system-design', 'interviews', 'distributed-systems', 'caching', 'databases'],
        'author_name': 'Donne Martin',
        'github_stars': 285000,
        'estimated_time_minutes': 600,
        'icon': 'book-open',
        'is_featured': True,
        'order': 1,
    },
    {
        'title': 'System Design 101',
        'slug': 'system-design-101',
        'url': 'https://github.com/ByteByteGoHq/system-design-101',
        'description': (
            'Visual guide to system design concepts by ByteByteGo. Explains complex concepts '
            'with beautiful diagrams: CI/CD, microservices, API Gateway, message queues, '
            'caching strategies, and database scaling patterns.'
        ),
        'source_type': 'github',
        'difficulty': 'beginner',
        'topics': ['system-design', 'diagrams', 'microservices', 'api-design', 'networking'],
        'author_name': 'ByteByteGo',
        'github_stars': 67000,
        'estimated_time_minutes': 300,
        'icon': 'image',
        'is_featured': True,
        'order': 2,
    },
    {
        'title': 'System Design at Scale',
        'slug': 'system-design-at-scale',
        'url': 'https://github.com/binhnguyennus/awesome-scalability',
        'description': (
            'A curated list of scalability resources covering: load balancing, caching, '
            'data partitioning, replication, consistency, microservices patterns, '
            'and real-world architecture case studies from Netflix, Uber, and Twitter.'
        ),
        'source_type': 'github',
        'difficulty': 'intermediate',
        'topics': ['scalability', 'load-balancing', 'caching', 'partitioning', 'replication'],
        'author_name': 'Binh Nguyen',
        'github_stars': 59000,
        'estimated_time_minutes': 480,
        'icon': 'trending-up',
        'is_featured': True,
        'order': 3,
    },
    {
        'title': 'Best System Design Resources',
        'slug': 'best-system-design-resources',
        'url': 'https://github.com/ashishps1/awesome-system-design-resources',
        'description': (
            'A carefully curated collection of the best system design resources including '
            'blogs, videos, courses, and practice problems. Organized by topic for easy reference.'
        ),
        'source_type': 'github',
        'difficulty': 'beginner',
        'topics': ['system-design', 'interviews', 'resources', 'learning-path'],
        'author_name': 'Ashish Pratap Singh',
        'github_stars': 22000,
        'estimated_time_minutes': 120,
        'icon': 'star',
        'is_featured': False,
        'order': 4,
    },
    {
        'title': 'System Design Interview Handbook',
        'slug': 'system-design-interview-handbook',
        'url': 'https://github.com/systemdesign42/system-design',
        'description': (
            'Structured handbook for system design interviews. Covers common problems '
            '(URL shortener, messaging system, news feed) with step-by-step solutions, '
            'diagrams, and deep dives into trade-offs.'
        ),
        'source_type': 'github',
        'difficulty': 'intermediate',
        'topics': ['interviews', 'system-design', 'url-shortener', 'messaging', 'news-feed'],
        'author_name': 'SystemDesign42',
        'github_stars': 14000,
        'estimated_time_minutes': 360,
        'icon': 'clipboard-list',
        'is_featured': False,
        'order': 5,
    },
    {
        'title': 'System Design Academy',
        'slug': 'system-design-academy',
        'url': 'https://github.com/puncsky/system-design-and-architecture',
        'description': (
            'Learn how to design large-scale systems. Topics include: designing a cache system, '
            'URL shortener, web crawler, and more. Each topic includes architecture diagrams '
            'and implementation considerations.'
        ),
        'source_type': 'github',
        'difficulty': 'intermediate',
        'topics': ['system-design', 'architecture', 'distributed-systems', 'caching'],
        'author_name': 'Tian Pan',
        'github_stars': 5000,
        'estimated_time_minutes': 300,
        'icon': 'graduation-cap',
        'is_featured': False,
        'order': 6,
    },
    {
        'title': 'Top System Design Interview Resources',
        'slug': 'top-system-design-interview-resources',
        'url': 'https://github.com/InterviewReady/system-design-resources',
        'description': (
            'Curated collection of resources specifically for system design interview preparation. '
            'Includes video explanations, blog posts, and practice problems organized by difficulty.'
        ),
        'source_type': 'github',
        'difficulty': 'intermediate',
        'topics': ['interviews', 'system-design', 'preparation', 'practice'],
        'author_name': 'InterviewReady',
        'github_stars': 17000,
        'estimated_time_minutes': 240,
        'icon': 'target',
        'is_featured': False,
        'order': 7,
    },
    {
        'title': 'Machine Learning Systems Design',
        'slug': 'ml-systems-design',
        'url': 'https://github.com/chiphuyen/machine-learning-systems-design',
        'description': (
            'How to design machine learning systems at scale. Covers ML pipeline architecture, '
            'feature stores, model serving, A/B testing, and the unique challenges of '
            'ML systems vs traditional software systems.'
        ),
        'source_type': 'github',
        'difficulty': 'advanced',
        'topics': ['machine-learning', 'ml-ops', 'system-design', 'data-pipeline', 'model-serving'],
        'author_name': 'Chip Huyen',
        'github_stars': 9500,
        'estimated_time_minutes': 360,
        'icon': 'brain',
        'is_featured': True,
        'order': 8,
    },
    {
        'title': 'Agentic System Design Patterns',
        'slug': 'agentic-system-design-patterns',
        'url': 'https://github.com/neural-maze/agentic_patterns',
        'description': (
            'Explores architecture patterns for AI agent systems: reflection, tool use, '
            'planning, multi-agent collaboration, and orchestration. Essential for modern '
            'AI-powered system design.'
        ),
        'source_type': 'github',
        'difficulty': 'expert',
        'topics': ['ai-agents', 'architecture-patterns', 'llm', 'multi-agent', 'orchestration'],
        'author_name': 'Neural Maze',
        'github_stars': 4500,
        'estimated_time_minutes': 240,
        'icon': 'bot',
        'is_featured': False,
        'order': 9,
    },
    {
        'title': 'Scalability Engineering',
        'slug': 'scalability-engineering',
        'url': 'https://github.com/mgp/book-notes/blob/master/erta-calo-high-scalability.markdown',
        'description': (
            'Engineering notes on building highly scalable systems. Covers horizontal scaling, '
            'database sharding, caching architectures, and lessons learned from scaling '
            'real production systems.'
        ),
        'source_type': 'github',
        'difficulty': 'advanced',
        'topics': ['scalability', 'engineering', 'sharding', 'horizontal-scaling'],
        'author_name': 'Mike Parker',
        'github_stars': 3000,
        'estimated_time_minutes': 180,
        'icon': 'rocket',
        'is_featured': False,
        'order': 10,
    },

    # =========================================================================
    # Additional High-Quality Resources
    # =========================================================================
    {
        'title': 'Designing Data-Intensive Applications',
        'slug': 'ddia',
        'url': 'https://dataintensive.net/',
        'description': (
            'The gold standard textbook for distributed systems and data engineering. '
            'By Martin Kleppmann. Covers: replication, partitioning, transactions, '
            'consistency models, stream processing, and batch processing.'
        ),
        'source_type': 'documentation',
        'difficulty': 'advanced',
        'topics': ['distributed-systems', 'databases', 'stream-processing', 'replication'],
        'author_name': 'Martin Kleppmann',
        'github_stars': None,
        'estimated_time_minutes': 1200,
        'icon': 'database',
        'is_featured': True,
        'order': 11,
    },
    {
        'title': 'High Scalability Blog',
        'slug': 'high-scalability-blog',
        'url': 'http://highscalability.com/',
        'description': (
            'Real-world architecture case studies: How Netflix, Instagram, WhatsApp, and '
            'more built their systems. Each article breaks down the actual architecture '
            'with concrete numbers and trade-offs.'
        ),
        'source_type': 'article',
        'difficulty': 'intermediate',
        'topics': ['case-studies', 'scalability', 'real-world', 'architecture'],
        'author_name': 'Todd Hoff',
        'github_stars': None,
        'estimated_time_minutes': 600,
        'icon': 'globe',
        'is_featured': False,
        'order': 12,
    },
]


STUDY_PATHS = [
    {
        'title': 'System Design Fundamentals',
        'slug': 'fundamentals',
        'description': (
            'Start here! Learn the core concepts of system design: scalability, availability, '
            'consistency, databases, caching, and load balancing. Perfect for beginners.'
        ),
        'difficulty': 'beginner',
        'icon': 'book-open',
        'resource_slugs': [
            'system-design-primer',
            'system-design-101',
            'best-system-design-resources',
        ],
    },
    {
        'title': 'Interview Preparation',
        'slug': 'interview-prep',
        'description': (
            'Focused preparation for system design interviews. Covers common problems, '
            'structured approaches, and practice resources used by FAANG candidates.'
        ),
        'difficulty': 'intermediate',
        'icon': 'target',
        'resource_slugs': [
            'system-design-interview-handbook',
            'top-system-design-interview-resources',
            'system-design-academy',
        ],
    },
    {
        'title': 'Advanced Distributed Systems',
        'slug': 'advanced-distributed',
        'description': (
            'Deep dive into distributed systems: data replication, partitioning, '
            'consensus algorithms, and building systems that scale to millions of users.'
        ),
        'difficulty': 'advanced',
        'icon': 'network',
        'resource_slugs': [
            'system-design-at-scale',
            'ddia',
            'scalability-engineering',
            'high-scalability-blog',
        ],
    },
    {
        'title': 'AI & ML System Design',
        'slug': 'ai-ml-design',
        'description': (
            'Learn to design ML pipelines, AI agent architectures, and data-intensive '
            'systems for modern AI applications.'
        ),
        'difficulty': 'expert',
        'icon': 'brain',
        'resource_slugs': [
            'ml-systems-design',
            'agentic-system-design-patterns',
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with curated system design learning resources'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\nSeeding Learning Resources...\n'))

        # Seed resources
        created_count = 0
        updated_count = 0

        for resource_data in RESOURCES:
            obj, created = Resource.objects.update_or_create(
                slug=resource_data['slug'],
                defaults=resource_data,
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  [+] Created: {obj.title}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'  [~] Updated: {obj.title}'))

        self.stdout.write(f'\n  Resources: {created_count} created, {updated_count} updated.\n')

        # Seed study paths
        self.stdout.write(self.style.MIGRATE_HEADING('\nSeeding Study Paths...\n'))

        for path_data in STUDY_PATHS:
            resource_slugs = path_data.pop('resource_slugs')

            path_obj, created = StudyPath.objects.update_or_create(
                slug=path_data['slug'],
                defaults=path_data,
            )

            # Clear existing resources and re-add in order
            StudyPathResource.objects.filter(study_path=path_obj).delete()
            for order, slug in enumerate(resource_slugs, start=1):
                try:
                    resource = Resource.objects.get(slug=slug)
                    StudyPathResource.objects.create(
                        study_path=path_obj,
                        resource=resource,
                        order=order,
                    )
                except Resource.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'  [!] Resource not found: {slug}'))

            status_text = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(
                f'  [+] {status_text}: {path_obj.title} ({len(resource_slugs)} resources)'
            ))

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! {Resource.objects.count()} resources, {StudyPath.objects.count()} study paths.\n'
        ))
