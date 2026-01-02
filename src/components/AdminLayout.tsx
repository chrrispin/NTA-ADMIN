import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BiLogOut } from 'react-icons/bi';
import { authApi } from '../services/adminApi';
import styles from './AdminLayout.module.css';

interface UserProfile {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const currentUser = authApi.getUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>NTA Admin</h1>
        </div>
        
        {user && (
          <div className={styles.profileSection}>
            <div className={styles.profileAvatar}>
              {getInitials(user.name)}
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{user.name || 'User'}</div>
              <div className={styles.profileEmail}>{user.email}</div>
              <div className={styles.profileRole}>{user.role}</div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <BiLogOut size={18} />
            </button>
          </div>
        )}
        
        <nav className={styles.nav}>
          <Link
            to="/admin"
            className={`${styles.navItem} ${isActive('/admin') ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/articles"
            className={`${styles.navItem} ${isActive('/admin/articles') ? styles.active : ''}`}
          >
            Articles
          </Link>
          <Link
            to="/admin/articles/new"
            className={`${styles.navItem} ${styles.primary}`}
          >
            + New Article
          </Link>
          <Link
            to="/admin/workflow"
            className={`${styles.navItem} ${isActive('/admin/workflow') ? styles.active : ''}`}
          >
            Workflow & Approval
          </Link>
          <Link
            to="/admin/users"
            className={`${styles.navItem} ${isActive('/admin/users') ? styles.active : ''}`}
          >
            Users
          </Link>
        </nav>
        <div className={styles.footer}>
          <p className={styles.footerNote}>New Time Africa </p>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
