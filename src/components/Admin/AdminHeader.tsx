'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Admin.module.css';
import { searchAdminIndex } from '../../lib/adminSearchData';
import { logoutAdmin } from '../../app/admin/auth-actions';

export interface AdminInfo {
  name: string;
  email: string;
  role: string;
}

interface AdminHeaderProps {
  onMenuClick: () => void;
  admin: AdminInfo;
}

export default function AdminHeader({ onMenuClick, admin }: AdminHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const results = searchAdminIndex(query);

  async function handleLogout() {
    await logoutAdmin();
    router.replace('/admin/login');
    router.refresh();
  }

  function goTo(path: string) {
    router.push(path);
    setQuery('');
    setShowResults(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results.length > 0) {
      goTo(results[0].path);
    }
  }

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Toggle menu">
        ☰
      </button>
      <div className={styles.headerLeft}>
        <form className={styles.searchWrapper} onSubmit={handleSubmit}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search across admin..."
              className={styles.searchInput}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 150)}
            />
          </div>

          {showResults && query.trim() && (
            <div className={styles.searchResults}>
              {results.length > 0 ? (
                results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.searchResultItem}
                    onClick={() => goTo(item.path)}
                  >
                    <span className={styles.searchResultType}>{item.type}</span>
                    <span className={styles.searchResultText}>
                      <span className={styles.searchResultTitle}>{item.title}</span>
                      <span className={styles.searchResultSubtitle}>{item.subtitle}</span>
                    </span>
                  </button>
                ))
              ) : (
                <div className={styles.searchNoResults}>No results found.</div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className={styles.headerRight}>
        <Link href="/admin/notifications" className={styles.iconBtn} aria-label="Notifications">
          🔔
          <span className={styles.badge}>3</span>
        </Link>
        <Link href="/admin/settings" className={styles.profile}>
          <div className={styles.avatar}>{admin.name.charAt(0).toUpperCase()}</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{admin.name}</span>
            <span className={styles.profileRole}>
              {admin.role.charAt(0) + admin.role.slice(1).toLowerCase()}
            </span>
          </div>
        </Link>
        <button
          className="btn btn-outline"
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
