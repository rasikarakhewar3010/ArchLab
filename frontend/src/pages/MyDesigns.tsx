/**
 * MyDesigns — User's Saved Designs Dashboard
 * =============================================
 * Shows all saved designs as cards with AI scores, timestamps, and actions.
 * Powered by Hugeicons.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PlusSignIcon,
  Delete02Icon,
  Clock01Icon,
  SparklesIcon,
  Layers01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  StarIcon,
  GlobalIcon,
  SecurityLockIcon,
} from '../components/common/Icon';
import { HugeiconsIcon } from '@hugeicons/react';
import BrandLogo from '../components/common/BrandLogo';
import { getMyDesigns, deleteDesign, type DesignListItem } from '../services/api';
import './MyDesigns.css';

export default function MyDesigns() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [designs, setDesigns] = useState<DesignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    async function load() {
      try {
        const items = await getMyDesigns();
        setDesigns(items);
      } catch {
        // API not available — show empty state
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated, authLoading, navigate]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this design?')) return;
    setDeletingId(id);
    try {
      await deleteDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert('Failed to delete design.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="mydesigns-page">
        <div className="mydesigns-loading">
          <HugeiconsIcon icon={SparklesIcon} size={24} className="animate-pulse" />
          <p>Loading your designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mydesigns-page">
      {/* Header */}
      <header className="mydesigns-header">
        <div className="mydesigns-header-left">
          <BrandLogo size="md" onClick={() => navigate('/')} />
          <div className="mydesigns-header-divider" />
          <h1 className="mydesigns-title">My Designs</h1>
          {user && <span className="mydesigns-user-badge">@{user.username}</span>}
        </div>
        <div className="mydesigns-header-right">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            Back to Studio
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            New Design
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mydesigns-content">
        {designs.length === 0 ? (
          <div className="mydesigns-empty">
            <div className="mydesigns-empty-icon">
              <HugeiconsIcon icon={Layers01Icon} size={48} />
            </div>
            <h2>No designs yet</h2>
            <p>Start building your first system architecture on the canvas!</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              Create Your First Design
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </div>
        ) : (
          <div className="mydesigns-grid">
            {/* New Design Card */}
            <article className="mydesigns-card mydesigns-new-card" onClick={() => navigate('/')}>
              <HugeiconsIcon icon={PlusSignIcon} size={32} />
              <span>New Design</span>
            </article>

            {designs.map((design) => (
              <article
                key={design.id}
                className="mydesigns-card"
                onClick={() => navigate(`/?id=${design.id}`)}
              >
                {/* Score Badge */}
                {design.ai_score !== null && (
                  <div className={`mydesigns-score ${
                    design.ai_score >= 80 ? 'score-great' :
                    design.ai_score >= 60 ? 'score-good' :
                    design.ai_score >= 40 ? 'score-ok' : 'score-low'
                  }`}>
                    <HugeiconsIcon icon={SparklesIcon} size={10} />
                    {design.ai_score}
                  </div>
                )}

                {/* Visibility */}
                <div className="mydesigns-visibility">
                  {design.is_public ? (
                    <HugeiconsIcon icon={GlobalIcon} size={12} />
                  ) : (
                    <HugeiconsIcon icon={SecurityLockIcon} size={12} />
                  )}
                </div>

                {/* Content */}
                <h3 className="mydesigns-card-title">{design.title}</h3>
                {design.description && (
                  <p className="mydesigns-card-desc">{design.description}</p>
                )}

                {/* Stats */}
                <div className="mydesigns-card-stats">
                  <span>
                    <HugeiconsIcon icon={Layers01Icon} size={12} /> {design.component_count} components
                  </span>
                  <span>
                    <HugeiconsIcon icon={StarIcon} size={12} /> {design.stars_count}
                  </span>
                </div>

                {/* Tags */}
                {design.tags.length > 0 && (
                  <div className="mydesigns-card-tags">
                    {design.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="mydesigns-tag">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="mydesigns-card-footer">
                  <span className="mydesigns-date">
                    <HugeiconsIcon icon={Clock01Icon} size={11} /> {formatDate(design.updated_at)}
                  </span>
                  <button
                    className="mydesigns-delete-btn"
                    onClick={(e) => handleDelete(design.id, e)}
                    disabled={deletingId === design.id}
                    title="Delete design"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
