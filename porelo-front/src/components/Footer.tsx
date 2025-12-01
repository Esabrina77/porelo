/**
 * COMPOSANT FOOTER
 * 
 * Pied de page du site avec informations et liens
 */

import Link from 'next/link';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Facebook01Icon,
  InstagramIcon,
  TwitterIcon,
  Mail01Icon,
  AiPhoneIcon,
  Location01Icon,
} from '@hugeicons/core-free-icons';
import styles from './Footer.module.css';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Section Logo et Description */}
          <div className={styles.footerSection}>
            <Image src="/logo/p_tronc.png" alt="PORELO" width={60} height={100} />

            <p className={styles.footerDescription}>
              Découvrez notre collection de produits de soins
              naturels pour une peau pure et éclatante.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <HugeiconsIcon icon={Facebook01Icon} size={24} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <HugeiconsIcon icon={InstagramIcon} size={24} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <HugeiconsIcon icon={TwitterIcon} size={24} />
              </a>
            </div>
          </div>

          {/* Section Liens rapides */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Liens rapides</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/" className={styles.footerLink}>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/products" className={styles.footerLink}>
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Informations */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Informations</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/shipping" className={styles.footerLink}>
                  Livraison
                </Link>
              </li>
              <li>
                <Link href="/returns" className={styles.footerLink}>
                  Retours
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Contact */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Contact</h3>
            <ul className={styles.contactInfo}>
              <li className={styles.contactItem}>
                <HugeiconsIcon icon={Mail01Icon} size={20} />
                <span>contact@porelo.com</span>
              </li>
              <li className={styles.contactItem}>
                <HugeiconsIcon icon={AiPhoneIcon} size={20} />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className={styles.contactItem}>
                <HugeiconsIcon icon={Location01Icon} size={20} />
                <span>123 Rue de la Beauté, 75001 Paris</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {currentYear} PORELO. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

