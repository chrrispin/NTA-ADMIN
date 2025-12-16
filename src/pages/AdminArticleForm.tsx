import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi } from '../services/adminApi';
import type { Article } from '../services/adminApi';
import styles from './AdminArticleForm.module.css';

const CATEGORIES = [
  'Hero',
  'Technology',
  'Business',
  'Lifestyle',
  'Health',
  'Education',
  'Entertainment',
  'Network',
  'YouTube Picks',
  'Hot News',
  'Trending Now',
  'Feature Highlights',
  'Featured Sections',
  'Watch',
  'Photos'
];

const PAGES = [
  'Home',
  'Africa',
  'Europe',
  'Sports',
  'Politics',
  'Style',
  'Travel',
  'Business',
  'Opinion',
  'Health',
  'Video',
  'Entertainment'
];

export default function AdminArticleForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Article>({
    title: '',
    excerpt: '',
    content: '',
    category: CATEGORIES[0],
    page: PAGES[0],
    status: 'draft',
    author: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articlesApi.getById(id!);
      
      if (response.success && response.data) {
        setFormData(response.data);
      } else {
        setError(response.message || 'Failed to load article');
      }
    } catch (err) {
      setError('Failed to load article');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      let response;
      if (isEditing) {
        response = await articlesApi.update(id!, formData);
      } else {
        response = await articlesApi.create(formData);
      }

      if (response.success) {
        navigate('/admin/articles');
      } else {
        setError(response.message || 'Failed to save article');
      }
    } catch (err) {
      setError('Failed to save article');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading article...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Article' : 'Create New Article'}</h1>
        <p>{isEditing ? 'Update your article content' : 'Create a new article for your blog'}</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.fullWidth}>
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter article title"
              required
            />
          </div>

          <div className={styles.twoCol}>
            <div>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className={styles.twoCol}>
            <div>
              <label htmlFor="page">Page *</label>
              <select
                id="page"
                name="page"
                value={formData.page || PAGES[0]}
                onChange={handleChange}
                required
              >
                {PAGES.map(page => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author || ''}
                onChange={handleChange}
                placeholder="Article author"
              />
            </div>
          </div>

          <div className={styles.twoCol}>
            <div>
              <label htmlFor="featuredImage">Featured Image URL</label>
              <input
                type="url"
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className={styles.fullWidth}>
            <label htmlFor="excerpt">Excerpt *</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of your article"
              rows={3}
              required
            />
            <div className={styles.charCount}>{formData.excerpt.length} / 500</div>
          </div>

          <div className={styles.fullWidth}>
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your article content here... (supports plain text or markdown)"
              rows={12}
              required
            />
            <div className={styles.charCount}>{formData.content.length} characters</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate('/admin/articles')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
