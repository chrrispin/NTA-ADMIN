import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/adminApi';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>NTA Admin</h1>
        </div>
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
          <button className={styles.navItem} onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
