/**
 * LearningHub — System Design Resources & Study Paths
 * ======================================================
 * Browse curated resources, track progress, and follow study paths.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, ExternalLink, Video, FileText,
  GraduationCap, Star, Clock, Filter, Search, Cpu,
  CheckCircle, ArrowRight, Sparkles, Trophy,
} from 'lucide-react';
import {
  getResources, getStudyPaths, getLearningStats, markResourceComplete,
  type LearningResource, type StudyPath, type LearningStats,
} from '../services/api';
import './LearningHub.css';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  github: <ExternalLink size={14} />,
  article: <FileText size={14} />,
  video: <Video size={14} />,
  documentation: <BookOpen size={14} />,
  course: <GraduationCap size={14} />,
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'var(--color-success)' },
  intermediate: { label: 'Intermediate', color: 'var(--color-info)' },
  advanced: { label: 'Advanced', color: 'var(--color-warning)' },
  expert: { label: 'Expert', color: '#a855f7' },
};

// Mock data for when backend is not available
const MOCK_RESOURCES: LearningResource[] = [
  {
    id: '1', title: 'System Design Primer', slug: 'system-design-primer',
    url: 'https://github.com/donnemartin/system-design-primer',
    description: 'Learn how to design large-scale systems. Prep for the system design interview.',
    source_type: 'github', difficulty: 'beginner',
    topics: ['fundamentals', 'scalability', 'databases'], author_name: 'Donne Martin',
    github_stars: 270000, estimated_time_minutes: 480, icon: 'book-open', is_featured: true,
  },
  {
    id: '2', title: 'Designing Data-Intensive Applications', slug: 'ddia',
    url: 'https://dataintensive.net',
    description: 'The big ideas behind reliable, scalable, and maintainable systems.',
    source_type: 'documentation', difficulty: 'intermediate',
    topics: ['databases', 'distributed-systems', 'consistency'], author_name: 'Martin Kleppmann',
    github_stars: null, estimated_time_minutes: 1200, icon: 'database', is_featured: true,
  },
  {
    id: '3', title: 'ByteByteGo — System Design 101', slug: 'bytebytego',
    url: 'https://bytebytego.com',
    description: 'Visual explanations of system design concepts by Alex Xu.',
    source_type: 'video', difficulty: 'beginner',
    topics: ['fundamentals', 'interviews', 'architecture'], author_name: 'Alex Xu',
    github_stars: null, estimated_time_minutes: 300, icon: 'video', is_featured: true,
  },
  {
    id: '4', title: 'Grokking System Design Interview', slug: 'grokking-sdi',
    url: 'https://www.designgurus.io/course/grokking-the-system-design-interview',
    description: 'Step-by-step guide for system design interviews at top tech companies.',
    source_type: 'course', difficulty: 'intermediate',
    topics: ['interviews', 'url-shortener', 'twitter', 'instagram'], author_name: 'Design Gurus',
    github_stars: null, estimated_time_minutes: 600, icon: 'graduation-cap', is_featured: false,
  },
  {
    id: '5', title: 'High Scalability Blog', slug: 'high-scalability',
    url: 'http://highscalability.com',
    description: 'Real-world architecture case studies from companies like Netflix, Uber, and Twitter.',
    source_type: 'article', difficulty: 'advanced',
    topics: ['case-studies', 'scalability', 'real-world'], author_name: 'Todd Hoff',
    github_stars: null, estimated_time_minutes: null, icon: 'trending-up', is_featured: false,
  },
  {
    id: '6', title: 'AWS Well-Architected Framework', slug: 'aws-well-architected',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/',
    description: 'Best practices for designing cloud architectures on AWS.',
    source_type: 'documentation', difficulty: 'advanced',
    topics: ['cloud', 'aws', 'best-practices', 'reliability'], author_name: 'AWS',
    github_stars: null, estimated_time_minutes: 360, icon: 'cloud', is_featured: false,
  },
];

const MOCK_PATHS: StudyPath[] = [
  {
    id: '1', title: 'System Design Fundamentals', slug: 'fundamentals',
    description: 'Start here — learn the core concepts behind distributed systems.',
    difficulty: 'beginner', icon: 'book-open', resource_count: 5,
  },
  {
    id: '2', title: 'Database Deep Dive', slug: 'databases',
    description: 'SQL vs NoSQL, sharding, replication, and consistency models.',
    difficulty: 'intermediate', icon: 'database', resource_count: 4,
  },
  {
    id: '3', title: 'Scalability Patterns', slug: 'scalability',
    description: 'Load balancing, caching, CDNs, and horizontal scaling.',
    difficulty: 'advanced', icon: 'trending-up', resource_count: 6,
  },
];

export default function LearningHub() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [paths, setPaths] = useState<StudyPath[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [r, p] = await Promise.all([getResources(), getStudyPaths()]);
        setResources(r.length > 0 ? r : MOCK_RESOURCES);
        setPaths(p.length > 0 ? p : MOCK_PATHS);
        if (isAuthenticated) {
          try {
            const s = await getLearningStats();
            setStats(s);
          } catch { /* no stats if not logged in */ }
        }
      } catch {
        setResources(MOCK_RESOURCES);
        setPaths(MOCK_PATHS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  const filteredResources = resources.filter((r) => {
    const matchesDifficulty = filterDifficulty === 'all' || r.difficulty === filterDifficulty;
    const matchesType = filterType === 'all' || r.source_type === filterType;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesType && matchesSearch;
  });

  const handleMarkComplete = async (resourceId: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await markResourceComplete(resourceId);
      setResources((prev) => prev.map((r) =>
        r.id === resourceId ? { ...r, user_status: 'completed' as const } : r
      ));
    } catch { /* ignore */ }
  };

  const formatTime = (mins: number | null) => {
    if (!mins) return null;
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`;
  };

  return (
    <div className="learn-page">
      {/* Header */}
      <header className="learn-header">
        <div className="learn-header-left">
          <div className="learn-brand" onClick={() => navigate('/')}>
            <Cpu size={20} />
            <span className="learn-brand-text">ArchLab</span>
          </div>
          <span className="learn-badge">Learn</span>
        </div>
        <div className="learn-header-right">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challenges')}>
            <Trophy size={14} /> Challenges
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            ← Back to Studio
          </button>
        </div>
      </header>

      <main className="learn-content">
        {loading ? (
          <div className="learn-loading">
            <Sparkles size={24} className="animate-pulse" />
            <p>Loading resources...</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <section className="learn-hero">
              <h1 className="learn-hero-title">
                <BookOpen size={28} />
                System Design Learning Hub
              </h1>
              <p className="learn-hero-subtitle">
                Curated resources from the best GitHub repos, books, and courses — all in one place.
              </p>
              {stats && (
                <div className="learn-hero-stats">
                  <div className="learn-stat">
                    <span className="learn-stat-number">{stats.total_resources}</span>
                    <span className="learn-stat-label">Resources</span>
                  </div>
                  <div className="learn-stat">
                    <span className="learn-stat-number">{stats.completed}</span>
                    <span className="learn-stat-label">Completed</span>
                  </div>
                  <div className="learn-stat">
                    <span className="learn-stat-number">{stats.completion_percent}%</span>
                    <span className="learn-stat-label">Progress</span>
                  </div>
                </div>
              )}
            </section>

            {/* Study Paths */}
            <section className="learn-section">
              <h2 className="learn-section-title">
                <GraduationCap size={18} />
                Study Paths
              </h2>
              <div className="learn-paths-scroll">
                {paths.map((path) => {
                  const diffConfig = DIFFICULTY_CONFIG[path.difficulty] || DIFFICULTY_CONFIG.beginner;
                  return (
                    <div key={path.id} className="learn-path-card">
                      <div className="learn-path-header">
                        <span className="learn-path-difficulty" style={{ color: diffConfig.color }}>
                          {diffConfig.label}
                        </span>
                        <span className="learn-path-count">{path.resource_count} resources</span>
                      </div>
                      <h3 className="learn-path-title">{path.title}</h3>
                      <p className="learn-path-desc">{path.description}</p>
                      <button className="btn btn-ghost btn-sm learn-path-cta">
                        Start Path <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Filters */}
            <section className="learn-filters">
              <div className="learn-filter-group">
                <Filter size={14} />
                {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map((d) => (
                  <button
                    key={d}
                    className={`filter-btn ${filterDifficulty === d ? 'active' : ''}`}
                    onClick={() => setFilterDifficulty(d)}
                  >
                    {d === 'all' ? 'All Levels' : DIFFICULTY_CONFIG[d]?.label || d}
                  </button>
                ))}
              </div>
              <div className="learn-filter-group">
                {['all', 'github', 'article', 'video', 'documentation', 'course'].map((t) => (
                  <button
                    key={t}
                    className={`filter-btn ${filterType === t ? 'active' : ''}`}
                    onClick={() => setFilterType(t)}
                  >
                    {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div className="learn-search">
                <Search size={14} />
                <input
                  type="text"
                  className="input"
                  placeholder="Search resources or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Resources Grid */}
            <section className="learn-resources-grid">
              {filteredResources.length === 0 ? (
                <div className="learn-empty">
                  <Search size={24} />
                  <p>No resources match your filters.</p>
                </div>
              ) : (
                filteredResources.map((resource) => {
                  const diffConfig = DIFFICULTY_CONFIG[resource.difficulty] || DIFFICULTY_CONFIG.beginner;
                  return (
                    <article key={resource.id} className="learn-resource-card">
                      <div className="learn-resource-header">
                        <span className="learn-resource-type">
                          {SOURCE_ICONS[resource.source_type]}
                          {resource.source_type}
                        </span>
                        <span className="learn-resource-difficulty" style={{ color: diffConfig.color }}>
                          {diffConfig.label}
                        </span>
                      </div>

                      <h3 className="learn-resource-title">{resource.title}</h3>
                      <p className="learn-resource-desc">{resource.description}</p>

                      {resource.author_name && (
                        <p className="learn-resource-author">by {resource.author_name}</p>
                      )}

                      <div className="learn-resource-meta">
                        {resource.github_stars && (
                          <span><Star size={11} /> {(resource.github_stars / 1000).toFixed(0)}k</span>
                        )}
                        {resource.estimated_time_minutes && (
                          <span><Clock size={11} /> {formatTime(resource.estimated_time_minutes)}</span>
                        )}
                      </div>

                      {resource.topics.length > 0 && (
                        <div className="learn-resource-topics">
                          {resource.topics.slice(0, 3).map((t) => (
                            <span key={t} className="learn-topic-tag">{t}</span>
                          ))}
                        </div>
                      )}

                      <div className="learn-resource-actions">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open <ExternalLink size={12} />
                        </a>
                        {resource.user_status === 'completed' ? (
                          <span className="learn-resource-completed">
                            <CheckCircle size={14} /> Done
                          </span>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleMarkComplete(resource.id)}
                          >
                            <CheckCircle size={14} /> Mark Done
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
