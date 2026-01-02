import { useEffect, useState } from 'react';
import { MdArticle, MdPublish, MdDrafts, MdVisibility } from 'react-icons/md';
import { articlesApi } from '../services/adminApi';
import styles from './Admin.module.css';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
}

export default function Admin() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getAll(100, 0);

      const articles = Array.isArray(response)
        ? response
        : (response as any)?.data && Array.isArray((response as any).data)
          ? (response as any).data
          : [];

      if (!Array.isArray(articles) || articles.length === 0) {
        if (!Array.isArray(response) && response && (response as any).success === false) {
          setError((response as any).message || 'Failed to load dashboard data');
        } else {
          setError(null); // empty state but not an error
        }
      }

      const published = articles.filter((a: any) => a.status === 'published' || a.is_live === 1 || a.is_live === true).length;
      const draft = articles.filter((a: any) => a.status === 'draft' || a.is_live === 0 || a.is_live === false).length;
      const totalViews = articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0);

      setStats({
        totalArticles: articles.length,
        publishedArticles: published,
        draftArticles: draft,
        totalViews: totalViews,
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your content overview.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MdArticle size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Total Articles</div>
            <div className={styles.statValue}>{stats.totalArticles}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MdPublish size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Published</div>
            <div className={styles.statValue}>{stats.publishedArticles}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MdDrafts size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Drafts</div>
            <div className={styles.statValue}>{stats.draftArticles}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MdVisibility size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Total Views</div>
            <div className={styles.statValue}>{stats.totalViews.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionButtons}>
          <a href="/admin/articles/new" className={styles.btn + ' ' + styles.btnPrimary}>
            Create New Article
          </a>
          <a href="/admin/articles" className={styles.btn + ' ' + styles.btnSecondary}>
            Manage Articles
          </a>
        </div>
      </div>
    </div>
  );
}
