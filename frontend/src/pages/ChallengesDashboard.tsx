/**
 * ChallengesDashboard — The "LeetCode of System Design" Page
 * =============================================================
 * Displays all available challenges in a premium card grid.
 * Users can filter by difficulty, see company tags, and start challenges.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Flame,
  Filter,
  Search,
  ChevronRight,
  Cpu,
  Building2,
  Lock,
  Sparkles,
} from 'lucide-react';
import type { Challenge } from '../types';
import './ChallengesDashboard.css';

// ===== Mock Data (used when backend is not running) =====
const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Design a URL Shortener',
    slug: 'url-shortener',
    description: 'Build a service like bit.ly that takes long URLs and creates short, unique aliases. The system should handle millions of URL redirections per day with minimal latency.',
    difficulty: 'easy',
    functional_requirements: [
      'Users can create short URLs from long URLs',
      'Short URLs redirect to the original URL',
      'Users can optionally set custom aliases',
      'URLs have an expiration time (default 5 years)',
    ],
    non_functional_requirements: [
      'Handle 500M new URLs per month',
      '100:1 read-to-write ratio (50B redirections/month)',
      'URL redirection latency < 100ms',
      '99.9% availability',
    ],
    hints: [
      'Think about how to generate unique short keys — what hashing approach works?',
      'With a 100:1 read ratio, caching will be critical. Where should you place a cache?',
      'How do you handle hash collisions? Consider using a counter or base62 encoding.',
    ],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    time_limit_minutes: 30,
    is_free: true,
  },
  {
    id: '2',
    title: 'Design a Paste Bin',
    slug: 'paste-bin',
    description: 'Design a web service where users can store and share plain text. Think Pastebin.com — users paste text, get a unique URL, and can share it with others.',
    difficulty: 'easy',
    functional_requirements: [
      'Users can paste text content and get a unique URL',
      'Content can be public or private',
      'Support syntax highlighting for code',
      'Paste expiration (1 hour, 1 day, 1 week, never)',
    ],
    non_functional_requirements: [
      'Handle 1M new pastes per day',
      '5:1 read-to-write ratio',
      'Low latency reads (< 200ms)',
      'High availability (99.9%)',
    ],
    hints: [
      'This is similar to URL Shortener but with larger payloads. Where should you store the content?',
      'Object storage (like S3) is great for large blobs of text. How do you generate unique keys?',
      'Think about a CDN for frequently accessed pastes.',
    ],
    companies: ['Amazon', 'Dropbox'],
    time_limit_minutes: 30,
    is_free: true,
  },
  {
    id: '3',
    title: 'Design Instagram',
    slug: 'instagram',
    description: 'Design a photo-sharing social network. Users can upload photos, follow other users, and see a news feed of photos from people they follow.',
    difficulty: 'medium',
    functional_requirements: [
      'Users can upload and share photos',
      'Users can follow/unfollow other users',
      'Generate a news feed from followed users',
      'Users can search photos by hashtags/location',
    ],
    non_functional_requirements: [
      'Handle 500M daily active users',
      '2M new photos per day (200GB/day storage)',
      'News feed generation latency < 500ms',
      '99.99% availability',
    ],
    hints: [
      'Separate read and write paths. Writes are less frequent but heavy (photo upload). Reads are very frequent (news feed).',
      'Pre-generate news feeds using a fan-out approach. Push vs Pull — which is better?',
      'How do you store photos efficiently? Think about object storage + CDN.',
    ],
    companies: ['Meta', 'Google', 'Twitter', 'Pinterest'],
    time_limit_minutes: 45,
    is_free: true,
  },
  {
    id: '4',
    title: 'Design Twitter',
    slug: 'twitter',
    description: 'Design a social media platform where users can post short messages (tweets), follow other users, and view a home timeline. Handle celebrity users with millions of followers.',
    difficulty: 'hard',
    functional_requirements: [
      'Users can post tweets (280 chars + media)',
      'Users can follow/unfollow other users',
      'Home timeline aggregates tweets from followed users',
      'Search tweets by keywords and hashtags',
      'Support trending topics',
    ],
    non_functional_requirements: [
      'Handle 300M monthly active users',
      '600 tweets/second write throughput',
      'Timeline generation latency < 300ms',
      'Handle celebrity accounts (10M+ followers) without fan-out storms',
    ],
    hints: [
      'The biggest challenge is the fan-out problem. When a user tweets, how do you deliver it to all followers?',
      'Use a hybrid approach: fan-out-on-write for normal users, fan-out-on-read for celebrities.',
      'Message queues are essential here for async fan-out processing.',
    ],
    companies: ['Twitter', 'Meta', 'Google', 'Uber'],
    time_limit_minutes: 45,
    is_free: true,
  },
  {
    id: '5',
    title: 'Design a Distributed Cache',
    slug: 'distributed-cache',
    description: 'Design a distributed caching system like Memcached or Redis Cluster. It should support consistent hashing, cache eviction policies, and handle node failures gracefully.',
    difficulty: 'expert',
    functional_requirements: [
      'GET/SET/DELETE operations with O(1) average time',
      'Support TTL (time-to-live) for cached entries',
      'Distribute data across multiple cache nodes',
      'Handle node additions and removals (rebalancing)',
    ],
    non_functional_requirements: [
      'Sub-millisecond read latency (< 1ms)',
      'Handle 1M+ operations per second',
      'Minimal data movement during rebalancing',
      '99.99% availability with automatic failover',
    ],
    hints: [
      'Consistent hashing is the key to distributing data. How does it minimize data movement when nodes change?',
      'What eviction policy will you use? LRU, LFU, or FIFO? How does this affect your data structure choice?',
      'How do you detect and handle node failures? Think about heartbeats and replicas.',
    ],
    companies: ['Amazon', 'Google', 'Netflix', 'Meta'],
    time_limit_minutes: 60,
    is_free: false,
  },
];

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: 'var(--color-success)', icon: '🟢' },
  medium: { label: 'Medium', color: 'var(--color-warning)', icon: '🟡' },
  hard:   { label: 'Hard',   color: 'var(--color-danger)',  icon: '🔴' },
  expert: { label: 'Expert', color: '#a855f7',              icon: '🟣' },
};

export default function ChallengesDashboard() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Try fetching from API, fall back to mock data
    async function load() {
      try {
        const res = await fetch('/api/challenges/');
        if (res.ok) {
          const data = await res.json();
          setChallenges(data.length > 0 ? data : MOCK_CHALLENGES);
        } else {
          setChallenges(MOCK_CHALLENGES);
        }
      } catch {
        // Backend not running — use mock data
        setChallenges(MOCK_CHALLENGES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = challenges.filter((c) => {
    const matchesDifficulty = filterDifficulty === 'all' || c.difficulty === filterDifficulty;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companies.some((co) => co.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesSearch;
  });

  const stats = {
    total: challenges.length,
    easy: challenges.filter((c) => c.difficulty === 'easy').length,
    medium: challenges.filter((c) => c.difficulty === 'medium').length,
    hard: challenges.filter((c) => c.difficulty === 'hard').length,
    expert: challenges.filter((c) => c.difficulty === 'expert').length,
  };

  return (
    <div className="challenges-page">
      {/* Header */}
      <header className="challenges-header">
        <div className="challenges-header-left">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')} title="Back to Studio">
            <Cpu size={20} />
          </button>
          <div className="challenges-brand">
            <img src="/logo.png" alt="ArchLab" className="challenges-logo-img" />
            <span className="challenges-logo-text">ArchLab</span>
            <span className="challenges-badge">Challenges</span>
          </div>
        </div>
        <div className="challenges-header-right">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            ← Back to Studio
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="challenges-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <Trophy size={32} className="hero-icon" />
            System Design Challenges
          </h1>
          <p className="hero-subtitle">
            Master system design interviews with interactive, hands-on challenges.
            Design real architectures on the canvas and get instant AI feedback.
          </p>
        </div>

        {/* Stats Row */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="hero-stat stat-easy">
            <span className="stat-number">{stats.easy}</span>
            <span className="stat-label">Easy</span>
          </div>
          <div className="hero-stat stat-medium">
            <span className="stat-number">{stats.medium}</span>
            <span className="stat-label">Medium</span>
          </div>
          <div className="hero-stat stat-hard">
            <span className="stat-number">{stats.hard}</span>
            <span className="stat-label">Hard</span>
          </div>
          <div className="hero-stat stat-expert">
            <span className="stat-number">{stats.expert}</span>
            <span className="stat-label">Expert</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="challenges-filters">
        <div className="filter-group">
          <Filter size={14} />
          {['all', 'easy', 'medium', 'hard', 'expert'].map((d) => (
            <button
              key={d}
              className={`filter-btn ${filterDifficulty === d ? 'active' : ''}`}
              onClick={() => setFilterDifficulty(d)}
            >
              {d === 'all' ? 'All' : DIFFICULTY_CONFIG[d as keyof typeof DIFFICULTY_CONFIG].label}
            </button>
          ))}
        </div>
        <div className="filter-search">
          <Search size={14} />
          <input
            type="text"
            className="search-input"
            placeholder="Search challenges or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Challenge Cards */}
      <section className="challenges-grid">
        {loading ? (
          <div className="loading-state">
            <Sparkles size={24} className="loading-icon" />
            <p>Loading challenges...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={24} />
            <p>No challenges match your filters.</p>
          </div>
        ) : (
          filtered.map((challenge) => {
            const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty];
            return (
              <article
                key={challenge.id}
                className="challenge-card"
                onClick={() => navigate(`/challenges/${challenge.slug}`)}
              >
                {!challenge.is_free && (
                  <div className="card-lock">
                    <Lock size={12} />
                    PRO
                  </div>
                )}

                <div className="card-header">
                  <span
                    className="difficulty-badge"
                    style={{ '--badge-color': diffConfig.color } as React.CSSProperties}
                  >
                    {diffConfig.icon} {diffConfig.label}
                  </span>
                  <span className="time-badge">
                    <Clock size={12} />
                    {challenge.time_limit_minutes} min
                  </span>
                </div>

                <h3 className="card-title">{challenge.title}</h3>
                <p className="card-description">{challenge.description}</p>

                <div className="card-companies">
                  <Building2 size={12} />
                  {challenge.companies.slice(0, 4).map((company) => (
                    <span key={company} className="company-tag">{company}</span>
                  ))}
                </div>

                <div className="card-meta">
                  <span className="meta-reqs">
                    <Flame size={12} />
                    {challenge.functional_requirements.length + challenge.non_functional_requirements.length} requirements
                  </span>
                  <ChevronRight size={16} className="card-arrow" />
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
