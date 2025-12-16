import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, authMiddleware } from './auth.js';
import { getQuery, runQuery, allQuery, getDB } from './db.js';

const router = express.Router();

// Signup
router.post('/admin/signup', async (req, res) => {
  console.log('📧 Signup route called');
  try {
    const { name, email, password } = req.body;
    console.log('📋 Validating input:', { name, email, passwordLength: password?.length });

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const db = getDB();
    console.log('✓ Got database connection');

    // Check if user already exists
    console.log('🔍 Checking if email exists:', email);
    const existingUser = await getQuery(
      db,
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      console.log('❌ Email already exists');
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    console.log('✓ Email is available');

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✓ Password hashed');

    // Create user
    console.log('👤 Creating user...');
    const result = await runQuery(
      db,
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    console.log('✓ User created:', { id: result.id, name, email });

    const user = {
      id: result.id,
      name,
      email,
    };

    // Generate token
    console.log('🎫 Generating token...');
    const token = generateToken(user);
    console.log('✓ Token generated');

    console.log('✅ Signup successful, sending response');
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    console.error('🔴 Signup error:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error creating account: ' + (err.message || 'Unknown error'),
    });
  }
});

// Login
router.post('/admin/login', async (req, res) => {
  console.log('🔐 Login route called');
  try {
    const { email, password } = req.body;
    console.log('📋 Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const db = getDB();
    console.log('✓ Got database connection');

    // Find user
    console.log('🔍 Looking up user by email:', email);
    const user = await getQuery(
      db,
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('✓ User found:', user.email);

    // Verify password
    console.log('🔐 Verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('✓ Password verified');
    const token = generateToken(user);
    console.log('✓ Token generated');

    console.log('✅ Login successful, sending response');
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error('🔴 Login error:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error logging in: ' + (err.message || 'Unknown error'),
    });
  }
});

// Get current user (protected)
router.get('/admin/me', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const user = await getQuery(
      db,
      'SELECT id, name, email FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
});

// ============================================
// ARTICLES ENDPOINTS
// ============================================

// Get all articles
router.get('/articles', async (req, res) => {
  try {
    console.log('📄 Fetching articles');
    const limit = parseInt(req.query.limit || '10');
    const offset = parseInt(req.query.offset || '0');

    const db = getDB();

    // Get total count
    const countResult = await getQuery(db, 'SELECT COUNT(*) as count FROM articles');
    const total = countResult?.count || 0;

    // Get articles with limit and offset
    const articles = await allQuery(
      db,
      'SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    console.log(`✓ Found ${articles?.length || 0} articles`);

    res.json({
      success: true,
      data: articles || [],
      total: total,
      limit: limit,
      offset: offset,
    });
  } catch (err) {
    console.error('🔴 Articles fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
    });
  }
});

// Get single article
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const article = await getQuery(db, 'SELECT * FROM articles WHERE id = ?', [id]);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (err) {
    console.error('🔴 Article fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
    });
  }
});

// Create article
router.post('/articles', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Creating article');
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      featuredImage,
      image_url,
      category,
      section,
      author,
      status,
      isTrending,
      isHot,
      isVideoSpotlight,
      isYoutubePick,
      isAudioPick,
      roleType,
      role_type,
    } = req.body;

    const toInt = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);
    const resolvedSection = section || category || '';
    const resolvedRole = roleType || role_type || null;
    const resolvedImage = featured_image || featuredImage || image_url || '';

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const db = getDB();

    const result = await runQuery(
      db,
      'INSERT INTO articles (title, slug, excerpt, content, featured_image, category, author, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug || null, excerpt || '', content, featured_image || '', category || '', author || '', status || 'draft']
    );

    console.log('✓ Article created with ID:', result.id);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { id: result.id },
    });
  } catch (err) {
    console.error('🔴 Article creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating article',
    });
  }
});

// Update article
router.put('/articles/:id', authMiddleware, async (req, res) => {
  try {
    console.log('✏️ Updating article:', req.params.id);
    const { id } = req.params;
    const { title, slug, excerpt, content, featured_image, category, author, status } = req.body;

    const db = getDB();

    // Check if article exists
    const article = await getQuery(db, 'SELECT id FROM articles WHERE id = ?', [id]);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    await runQuery(
      db,
      'UPDATE articles SET title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?, category = ?, author = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, slug, excerpt, content, featured_image, category, author, status, id]
    );

    console.log('✓ Article updated');

    res.json({
      success: true,
      message: 'Article updated successfully',
    });
  } catch (err) {
    console.error('🔴 Article update error:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating article',
    });
  }
});

// Delete article
router.delete('/articles/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ Deleting article:', req.params.id);
    const { id } = req.params;

    const db = getDB();

    // Check if article exists
    const article = await getQuery(db, 'SELECT id FROM articles WHERE id = ?', [id]);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    await runQuery(db, 'DELETE FROM articles WHERE id = ?', [id]);

    console.log('✓ Article deleted');

    res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (err) {
    console.error('🔴 Article deletion error:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
    });
  }
});

export default router;
