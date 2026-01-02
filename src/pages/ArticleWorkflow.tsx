import { useState, useEffect } from 'react';
import { authApi } from '../services/adminApi';
import styles from './ArticleWorkflow.module.css';

interface Article {
  id: number;
  title: string;
  section: string;
  status: string;
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export default function ArticleWorkflow() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    // Get current user role
    const user = authApi.getUser();
    if (user) {
      setUserRole(user.role);
    }
    
    fetchArticles();
  }, [filterStatus]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/articles/workflow/my-articles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || `Failed to fetch articles (Status: ${response.status})`);
        return;
      }

      const data = await response.json();
      let filtered = data.data || [];

      if (filterStatus !== 'all') {
        filtered = filtered.filter((a: Article) => a.status === filterStatus);
      }

      setArticles(filtered);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to approve article');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setArticles(articles.map(a =>
          a.id === articleId ? { ...a, status: 'pending_super_admin_review' } : a
        ));
        setError(null);
      } else {
        setError(result.message || 'Failed to approve article');
      }
    } catch (err) {
      console.error('Error approving article:', err);
      setError('Failed to approve article');
    }
  };

  const handleReject = async (articleId: number) => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject article');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setArticles(articles.map(a =>
          a.id === articleId ? { ...a, status: 'rejected' } : a
        ));
        setRejectingId(null);
        setRejectReason('');
        setError(null);
      } else {
        setError(result.message || 'Failed to reject article');
      }
    } catch (err) {
      console.error('Error rejecting article:', err);
      setError('Failed to reject article');
    }
  };

  const handlePublish = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to publish article');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setArticles(articles.map(a =>
          a.id === articleId ? { ...a, status: 'published' } : a
        ));
        setError(null);
      } else {
        setError(result.message || 'Failed to publish article');
      }
    } catch (err) {
      console.error('Error publishing article:', err);
      setError('Failed to publish article');
    }
  };

  const handleSubmit = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/submit-for-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit article');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setArticles(articles.map(a =>
          a.id === articleId ? { ...a, status: 'pending_admin_review' } : a
        ));
        setError(null);
      } else {
        setError(result.message || 'Failed to submit article');
      }
    } catch (err) {
      console.error('Error submitting article:', err);
      setError('Failed to submit article');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#FFA500';
      case 'pending_admin_review':
        return '#1E90FF';
      case 'rejected':
        return '#DC143C';
      case 'published':
        return '#00CED1';
      default:
        return '#808080';
    }
  };

  const statusLabels: { [key: string]: string } = {
    draft: 'Draft',
    pending_admin_review: 'Awaiting Admin Review',
    rejected: 'Rejected',
    published: 'Published',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Article Workflow & Approval</h1>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'draft' ? styles.active : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Drafts
          </button>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'pending_admin_review' ? styles.active : ''}`}
            onClick={() => setFilterStatus('pending_admin_review')}
          >
            Admin Review
          </button>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'rejected' ? styles.active : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected
          </button>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'published' ? styles.active : ''}`}
            onClick={() => setFilterStatus('published')}
          >
            Published
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <p>Loading articles...</p>
      ) : articles.length === 0 ? (
        <p>No articles found</p>
      ) : (
        <div className={styles.articlesList}>
          {articles.map((article) => (
            <div key={article.id} className={styles.articleCard}>
              <div className={styles.articleHeader}>
                <div>
                  <h3>{article.title}</h3>
                  <p className={styles.section}>{article.section}</p>
                </div>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusBadgeColor(article.status) }}
                >
                  {statusLabels[article.status] || article.status}
                </span>
              </div>

              <div className={styles.articleMeta}>
                <span>Created: {new Date(article.created_at).toLocaleDateString()}</span>
                {article.submitted_at && (
                  <span>Submitted: {new Date(article.submitted_at).toLocaleDateString()}</span>
                )}
                {article.approved_at && (
                  <span>Approved: {new Date(article.approved_at).toLocaleDateString()}</span>
                )}
              </div>

              {article.rejection_reason && (
                <div className={styles.rejectionReason}>
                  <strong>Rejection Reason:</strong> {article.rejection_reason}
                </div>
              )}

              <div className={styles.actions}>
                {/* Editor/Viewer: Submit Draft */}
                {article.status === 'draft' && (userRole === 'editor' || userRole === 'viewer') && (
                  <button
                    className={`${styles.btn} ${styles.submitBtn}`}
                    onClick={() => handleSubmit(article.id)}
                  >
                    Submit for Review
                  </button>
                )}

                {/* Admin: Approve & Publish or Reject Pending Admin Review */}
                {article.status === 'pending_admin_review' && userRole === 'admin' && (
                  <>
                    <button
                      className={`${styles.btn} ${styles.publishBtn}`}
                      onClick={() => handleApprove(article.id)}
                    >
                      ✅ Approve & Publish
                    </button>
                    <button
                      className={`${styles.btn} ${styles.rejectBtn}`}
                      onClick={() => setRejectingId(article.id)}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}

                {/* Super Admin: Approve or Reject Pending Super Admin Review */}
                {article.status === 'pending_super_admin_review' && userRole === 'super_admin' && (
                  <>
                    <button
                      className={`${styles.btn} ${styles.approveBtn}`}
                      onClick={() => handleApprove(article.id)}
                    >
                      Approve
                    </button>
                    <button
                      className={`${styles.btn} ${styles.rejectBtn}`}
                      onClick={() => setRejectingId(article.id)}
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* Editor/Viewer: Resubmit Rejected Articles */}
                {article.status === 'rejected' && (userRole === 'editor' || userRole === 'viewer') && (
                  <button
                    className={`${styles.btn} ${styles.submitBtn}`}
                    onClick={() => handleSubmit(article.id)}
                  >
                    Resubmit for Review
                  </button>
                )}

                {/* Display info if user doesn't have permission */}
                {article.status === 'pending_admin_review' && userRole !== 'admin' && (
                  <div className={styles.noPermission}>
                    ℹ️ Waiting for Admin to review and publish
                  </div>
                )}
                
                {article.status === 'pending_super_admin_review' && userRole !== 'super_admin' && (
                  <div className={styles.noPermission}>
                    ℹ️ Waiting for Super Admin review
                  </div>
                )}
              </div>

              {rejectingId === article.id && (
                <div className={styles.rejectForm}>
                  <textarea
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className={styles.rejectActions}>
                    <button
                      className={`${styles.btn} ${styles.rejectBtn}`}
                      onClick={() => handleReject(article.id)}
                    >
                      Confirm Reject
                    </button>
                    <button
                      className={`${styles.btn} ${styles.cancelBtn}`}
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
