/**
 * COMPOSANT HEADER
 * 
 * En-tête du site avec logo et navigation
 */

'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();

  const handleLogoutClick = () => {
    logout();
    router.push('/login');
  };

  const cartItemCount = getTotalItems();

  // Fonction pour vérifier si un chemin est actif (inclut les sous-pages)
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };
  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="/">
            <Image
              src="/logo/porelo.png"
              alt="PORELO Logo"
              width={120}
              height={60}
              className={styles.logoImage}
            />
          </Link>

          <ul className={styles.navLinks}>
            <li>
              <Link
                href="/shop/products"
                className={`${styles.navLink} ${isActive('/shop/products') ? styles.navLinkActive : ''}`}
              >
                Boutique
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link
                  href="/shop/orders"
                  className={`${styles.navLink} ${isActive('/shop/orders') ? styles.navLinkActive : ''}`}
                >
                  Mes commandes
                </Link>
              </li>
            )}
            {user?.role === 'ADMIN' && (
              <li>
                <Link
                  href="/admin"
                  className={`${styles.navLink} ${isActive('/admin') ? styles.navLinkActive : ''}`}
                  style={{ color: '#0070f3' }}
                >
                  Administration
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/shop/cart"
                className={`${styles.navLink} ${isActive('/shop/cart') ? styles.navLinkActive : styles.navLinkPill}`}
              >
                Panier
                {cartItemCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemCount}</span>
                )}
              </Link>
            </li>
          </ul>

          <div className={styles.headerActions}>
            {isAuthenticated ? (
              <div className={styles.userSection}>
                <span className={styles.userGreeting}>Bonjour, {user?.email}</span>
                <button
                  onClick={handleLogoutClick}
                  className={styles.logoutButton}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className={styles.loginButton}
              >
                Connexion
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

