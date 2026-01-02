import { useState, useEffect } from 'react';
import styles from './AdminUsers.module.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setError(null);
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || `Failed to delete user (Status: ${response.status})`);
        console.error('Delete user error:', errorData);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (!editingId && !formData.password.trim()) {
      setError('Password is required for new users');
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Update existing user
        const response = await fetch(`/api/auth/users/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || `Failed to update user (Status: ${response.status})`);
          console.error('Update user error:', errorData);
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          setUsers(users.map(u =>
            u.id === editingId
              ? { ...u, name: formData.name, email: formData.email, role: formData.role }
              : u
          ));
          setShowForm(false);
          setEditingId(null);
          setFormData({ name: '', email: '', password: '', role: 'admin' });
        } else {
          setError(data.message || 'Failed to update user');
        }
      } else {
        // Create new user
        const response = await fetch(`/api/auth/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || `Failed to create user (Status: ${response.status})`);
          console.error('Create user error:', errorData);
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          setUsers([...users, {
            id: data.data.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            created_at: new Date().toISOString(),
          }]);
          setShowForm(false);
          setFormData({ name: '', email: '', password: '', role: 'admin' });
        } else {
          setError(data.message || 'Failed to create user');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(editingId ? 'Failed to update user' : 'Failed to create user');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <button
          className={styles.addBtn}
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', email: '', password: '', role: 'admin' });
            setError(null);
          }}
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit User' : 'Create New User'}</h3>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="User name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
              required
            />
          </div>

          {!editingId && (
            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Min 6 characters"
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button type="submit" className={styles.submitBtn}>
            {editingId ? 'Update User' : 'Create User'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(user.id)}
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
