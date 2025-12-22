import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi } from '../services/adminApi';
import type { Article, SubLink } from '../services/adminApi';
import styles from './AdminArticleForm.module.css';

const CATEGORIES = [
  'news1',
  'news2',
  'news3',
  'news4',
  'news5',
  'news6',
  'video',
  'news7',
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
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Article>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: CATEGORIES[0],
    page: PAGES[0],
    status: 'draft',
    author: '',
    featuredImage: '',
    subLinks: [],
    isAudioPick: false,
    isHot: false,
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
        const data: any = response.data;
        setFormData(prev => ({
          ...prev,
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.summary || '',
          content: prev.content || '',
          category: data.section || CATEGORIES[0],
          page: data.page || PAGES[0],
          status: data.is_live ? 'published' : 'draft',
          author: prev.author || '',
          featuredImage: data.image_url || '',
          subLinks: Array.isArray(data.subLinks) ? data.subLinks : [],
          isAudioPick: data.isAudioPick || false,
          isHot: data.isHot || false,
        }));
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
    setFormData(prev => {
      const next = { ...prev, [name]: value } as Article;
      if (name === 'title') {
        const auto = slugify(value);
        if (!prev.slug || prev.slug === slugify(prev.title)) {
          next.slug = auto;
        }
      }
      return next;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleAddSubLink = () => {
    setFormData(prev => ({
      ...prev,
      subLinks: [...(prev.subLinks || []), { title: '', url: '', image_url: '' }],
    }));
  };

  const handleSubLinkChange = (index: number, field: keyof SubLink, value: string) => {
    setFormData(prev => {
      const subLinks = [...(prev.subLinks || [])];
      subLinks[index] = { ...subLinks[index], [field]: value };
      return { ...prev, subLinks };
    });
  };

  const handleRemoveSubLink = (index: number) => {
    setFormData(prev => {
      const subLinks = [...(prev.subLinks || [])];
      subLinks.splice(index, 1);
      return { ...prev, subLinks };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    if (isVideo) {
      // Block raw video uploads because backend only stores URLs
      setError('Upload a hosted video URL instead of a video file (MP4/WebM link).');
      return;
    }

    // Image uploads only (videos must be URL-based)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Convert to Data URL for preview and submission
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      setFormData(prev => ({
        ...prev,
        featuredImage: dataUrl,
      }));
      setError(null);
    };
    reader.readAsDataURL(file);
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
      const payload: Article = {
        ...formData,
        slug: formData.slug && formData.slug.trim() ? formData.slug.trim() : slugify(formData.title),
        subLinks: Array.isArray(formData.subLinks) ? formData.subLinks : [],
      };
      if (isEditing) {
        response = await articlesApi.update(id!, payload);
      } else {
        response = await articlesApi.create(payload);
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
              <label htmlFor="slug">Slug</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug || ''}
                onChange={handleChange}
                placeholder="auto-generated from title"
              />
            </div>
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

          <div className={styles.fullWidth}>
            <label>Featured Media (image upload or video URL)</label>
            <div className="space-y-3">
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageSource"
                    value="url"
                    checked={imageSource === 'url'}
                    onChange={(e) => setImageSource(e.target.value as 'url' | 'upload')}
                  />
                  <span>Paste Media URL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageSource"
                    value="upload"
                    checked={imageSource === 'upload'}
                    onChange={(e) => setImageSource(e.target.value as 'url' | 'upload')}
                  />
                  <span>Upload Image File</span>
                </label>
              </div>

              {imageSource === 'url' ? (
                <input
                  type="url"
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/video.mp4 or image.jpg"
                  className="w-full px-3 py-2 border rounded"
                />
              ) : (
                <div>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-2">Images up to 5MB (JPG, PNG, WebP, GIF). For video, use the URL option (MP4/WebM). Selecting a video file will prompt you to paste a URL instead.</p>
                </div>
              )}

              {formData.featuredImage && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-2">Preview:</p>
                  {/^data:video\//.test(formData.featuredImage) || /\.(mp4|webm|ogg)(\?|$)/i.test(formData.featuredImage) ? (
                    <video
                      src={formData.featuredImage}
                      controls
                      className="max-w-full h-auto max-h-48 rounded border"
                    />
                  ) : (
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="max-w-full h-auto max-h-48 object-cover rounded border"
                    />
                  )}
                </div>
              )}
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
              maxLength={500}
            />
            <div className={styles.charCount}>{formData.excerpt.length} / 500</div>
          </div>

          <div className={styles.twoCol}>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="isAudioPick"
                  checked={formData.isAudioPick || false}
                  onChange={handleCheckboxChange}
                />
                {' '}Audio Pick (AudioCarousel)
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="isHot"
                  checked={formData.isHot || false}
                  onChange={handleCheckboxChange}
                />
                {' '}Hot News (HotNews)
              </label>
            </div>
          </div>

          <div className={styles.fullWidth}>
            <label>Related Links</label>
            {(formData.subLinks || []).map((link, idx) => (
              <div key={idx} className={styles.twoCol}>
                <div>
                  <input
                    type="text"
                    placeholder="Link title"
                    value={link.title || ''}
                    onChange={(e) => handleSubLinkChange(idx, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={link.url || ''}
                    onChange={(e) => handleSubLinkChange(idx, 'url', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Image URL (optional)"
                    value={link.image_url || ''}
                    onChange={(e) => handleSubLinkChange(idx, 'image_url', e.target.value)}
                  />
                </div>
                <button type="button" className={styles.btnSecondary} onClick={() => handleRemoveSubLink(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" className={styles.btnSecondary} onClick={handleAddSubLink}>Add Link</button>
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
