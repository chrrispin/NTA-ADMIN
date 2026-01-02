import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi, authApi, API_BASE_URL } from '../services/adminApi';
import type { Article, SubLink, MediaItem } from '../services/adminApi';
import styles from './AdminArticleForm.module.css';

const CATEGORIES = [
  // core layout sections
  'news1', 'news2', 'news3', 'news4', 'news5', 'news6', 'news7', 'video',
  // editorial/topical groups
  'Hero', 'Technology', 'Business', 'Lifestyle', 'Health', 'Education', 'Entertainment', 'Network',
  'YouTube Picks', 'Hot News', 'Trending Now', 'Feature Highlights', 'Featured Sections', 'Watch', 'Photos',
  // custom sections used on site (match frontend queries exactly)
  'african-trends', 'mini-left', 'trading-youtube', 'more_news'
];

const PAGES = [
  'Home', 'Africa', 'Europe', 'Sports', 'Politics', 'Style', 'Travel', 'Business', 'Opinion', 'Health', 'Video', 'Entertainment'
];

export default function AdminArticleForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

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
    media: [],
    isAudioPick: false,
    isHot: false,
  });

  useEffect(() => {
    // Get current user role
    const user = authApi.getUser();
    if (user) {
      setUserRole(user.role);
    }
    
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
          content: data.content || '',
          category: data.section || CATEGORIES[0],
          page: data.page || PAGES[0],
          status: data.is_live ? 'published' : 'draft',
          author: prev.author || '',
          featuredImage: data.image_url || '',
          subLinks: Array.isArray(data.subLinks) ? data.subLinks : [],
          media: Array.isArray(data.media) ? data.media : [],
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

  const handleAddMedia = () => {
    setFormData(prev => ({
      ...prev,
      media: [...(prev.media || []), { url: '', type: 'image', caption: '' }],
    }));
  };

  const handleMediaChange = (index: number, field: keyof MediaItem, value: string) => {
    setFormData(prev => {
      const media = [...(prev.media || [])];
      media[index] = { ...media[index], [field]: value } as MediaItem;
      return { ...prev, media };
    });
  };

  const handleRemoveMedia = (index: number) => {
    setFormData(prev => {
      const media = [...(prev.media || [])];
      media.splice(index, 1);
      return { ...prev, media };
    });
  };

  const handleMediaUpload = async (index: number, file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    const maxSizeBytes = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(isImage ? 'Image size must be less than 10MB' : 'Video size must be less than 100MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    try {
      setSubmitting(true);
      const resp = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: formDataUpload,
      });
      const json = await resp.json();
      if (!resp.ok || !json.success || !json.url) {
        throw new Error(json.message || 'Upload failed');
      }
      handleMediaChange(index, 'url', json.url);
      handleMediaChange(index, 'type', isVideo ? 'video' : 'image');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    // Size limits: 10MB images, 100MB videos
    const maxSizeBytes = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(isImage ? 'Image size must be less than 10MB' : 'Video size must be less than 100MB');
      return;
    }

    // Upload to backend and receive a URL to store
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    try {
      setSubmitting(true);
      const resp = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: formDataUpload,
      });
      const json = await resp.json();
      if (!resp.ok || !json.success || !json.url) {
        throw new Error(json.message || 'Upload failed');
      }
      setFormData(prev => ({
        ...prev,
        featuredImage: json.url,
      }));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInsertMediaIntoContent = () => {
    if (selectedMediaIndex === null) {
      setError('Select a media item to insert');
      return;
    }

    const item = formData.media?.[selectedMediaIndex];
    if (!item || !item.url) {
      setError('Selected media item is missing a URL');
      return;
    }

    const captionHtml = item.caption ? `<figcaption>${item.caption}</figcaption>` : '';
    const snippet = item.type === 'video'
      ? `<figure><video controls src="${item.url}"></video>${captionHtml}</figure>`
      : `<figure><img src="${item.url}" alt="${item.caption || ''}" />${captionHtml}</figure>`;

    const textarea = contentRef.current;
    const content = formData.content || '';
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? start;
    const block = `${snippet}\n\n`;

    const nextContent = `${content.slice(0, start)}${block}${content.slice(end)}`;

    setFormData(prev => ({
      ...prev,
      content: nextContent,
    }));

    // restore cursor just after inserted block
    setTimeout(() => {
      if (textarea) {
        const pos = start + block.length;
        textarea.focus();
        textarea.setSelectionRange(pos, pos);
      }
    }, 0);
    setError(null);
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
        status: 'draft', // Force all new/edited articles to draft status - must go through workflow to publish
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

            {(userRole === 'admin' || userRole === 'super_admin') && (
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
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Admin only: Can directly publish articles
                </small>
              </div>
            )}

            {(userRole === 'editor' || userRole === 'viewer') && (
              <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '6px', borderLeft: '4px solid #2196f3' }}>
                <small style={{ color: '#1565c0', fontWeight: '600' }}>
                  ℹ️ Your articles are automatically saved as drafts. Use "Workflow & Approval" to submit for review.
                </small>
              </div>
            )}
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
                {PAGES.map((page: string) => (
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
            <label>Featured Media (image/video upload or URL)</label>
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
                  <span>Upload Image/Video File</span>
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
                  <p className="text-xs text-gray-500 mt-2">Images up to 10MB (JPG, PNG, WebP, GIF). Videos up to 100MB (MP4/WebM/OGG). Uploaded files are stored and referenced via URL.</p>
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
            <label>Additional Media Gallery (Images & Videos)</label>
            <p className="text-sm text-gray-600 mb-3">Add multiple images and videos to display within your article content</p>
            {(formData.media || []).map((item, idx) => (
              <div key={idx} className="border rounded p-4 mb-4">
                <div className={styles.twoCol}>
                  <div>
                    <label>Media Type</label>
                    <select
                      value={item.type}
                      onChange={(e) => handleMediaChange(idx, 'type', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div>
                    <label>Upload File</label>
                    <input
                      type="file"
                      accept={item.type === 'video' ? 'video/*' : 'image/*'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaUpload(idx, file);
                      }}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label>Or paste URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/media.jpg"
                    value={item.url}
                    onChange={(e) => handleMediaChange(idx, 'url', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mt-3">
                  <label>Caption (optional)</label>
                  <input
                    type="text"
                    placeholder="Describe this media"
                    value={item.caption || ''}
                    onChange={(e) => handleMediaChange(idx, 'caption', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                {item.url && (
                  <div className="mt-3">
                    {item.type === 'video' ? (
                      <video src={item.url} controls className="max-w-full h-auto max-h-48 rounded" />
                    ) : (
                      <img src={item.url} alt="Preview" className="max-w-full h-auto max-h-48 rounded" />
                    )}
                  </div>
                )}
                <button
                  type="button"
                  className={`${styles.btnSecondary} mt-3`}
                  onClick={() => handleRemoveMedia(idx)}
                >
                  Remove Media
                </button>
              </div>
            ))}
            <button type="button" className={styles.btnSecondary} onClick={handleAddMedia}>
              + Add Media Item
            </button>
          </div>

          <div className={styles.fullWidth}>
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              ref={contentRef}
              placeholder="Write your article content here... (supports plain text or markdown)"
              rows={12}
              required
            />
            {formData.media && formData.media.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                <label className="text-sm text-gray-700">Insert a media block into content</label>
                <div className="flex gap-2 items-center">
                  <select
                    className="px-3 py-2 border rounded w-full"
                    value={selectedMediaIndex ?? ''}
                    onChange={(e) => setSelectedMediaIndex(e.target.value === '' ? null : Number(e.target.value))}
                  >
                    <option value="">Select media…</option>
                    {formData.media.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {`Media ${idx + 1} (${item.type}) - ${item.caption || item.url}`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleInsertMediaIntoContent}
                  >
                    Insert
                  </button>
                </div>
                <p className="text-xs text-gray-500">Adds a figure with image/video HTML at the end of the content.</p>
              </div>
            )}
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
