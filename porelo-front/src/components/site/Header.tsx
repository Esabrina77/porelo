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
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>

          <Link href="/">
            <Image
              src="/logo/porelo.png"
              alt="PORELO Logo"
              width={150}
              height={70}
              className={styles.logoImage}
            />
          </Link>


          <ul className={styles.navLinks}>
            <li>
              <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/shop/products" className={`${styles.navLink} ${pathname === '/shop/products' ? '' : styles.navLinkPill}`}>
                Produits
              </Link>
            </li>
            <li>
              <Link href="/about" className={`${styles.navLink} ${styles.navLinkPill}`}>
                À propos
              </Link>
            </li>
            <li>
              <Link href="/gallery" className={`${styles.navLink} ${styles.navLinkPill}`}>
                Galerie
              </Link>
            </li>
          </ul>

          <div className={styles.headerActions}>
            {isAuthenticated ? (
              <Link href="/shop/products" className={styles.login}>
                Mon Espace
              </Link>
            ) : (
              <Link href="/login" className={styles.login}>
                Commencer
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

