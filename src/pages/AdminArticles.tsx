import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi } from '../services/adminApi';
import type { Article } from '../services/adminApi';
import styles from './AdminArticles.module.css';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articlesApi.getAll(100, 0);
      
      if (response.success && response.data) {
        setArticles(response.data);
      } else {
        setError(response.message || 'Failed to fetch articles');
      }
    } catch (err) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await articlesApi.delete(id);
      if (response.success) {
        setArticles(articles.filter(a => a.id !== id));
      } else {
        setError(response.message || 'Failed to delete article');
      }
    } catch (err) {
      setError('Failed to delete article');
      console.error(err);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    return article.status === filter;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading articles...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Articles Management</h1>
          <p>Manage all your articles and content</p>
        </div>
        <Link to="/admin/articles/new" className={styles.newBtn}>
          + New Article
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({articles.length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'published' ? styles.active : ''}`}
          onClick={() => setFilter('published')}
        >
          Published ({articles.filter(a => a.status === 'published').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'draft' ? styles.active : ''}`}
          onClick={() => setFilter('draft')}
        >
          Drafts ({articles.filter(a => a.status === 'draft').length})
        </button>
      </div>

      {filteredArticles.length === 0 ? (
        <div className={styles.empty}>
          <p>No articles found</p>
          <Link to="/admin/articles/new" className={styles.emptyBtn}>
            Create your first article
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map(article => (
                <tr key={article.id} className={styles.row}>
                  <td className={styles.titleCell}>
                    <div className={styles.title}>{article.title}</div>
                    {article.excerpt && (
                      <div className={styles.excerpt}>
                        {article.excerpt.length > 60 
                          ? `${article.excerpt.substring(0, 60)}...` 
                          : article.excerpt}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[article.status]}`}>
                      {article.status?.charAt(0).toUpperCase() + article.status?.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.category}>{article.category || 'Uncategorized'}</span>
                  </td>
                  <td>
                    <span className={styles.views}>{article.views?.toLocaleString() || 0}</span>
                  </td>
                  <td>
                    <span className={styles.date}>
                      {article.createdAt 
                        ? new Date(article.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : '-'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <Link
                      to={`/admin/articles/${article.id}/edit`}
                      className={`${styles.btn} ${styles.btnEdit}`}
                    >
                      Edit
                    </Link>
                    <button
                      className={`${styles.btn} ${styles.btnDelete}`}
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
