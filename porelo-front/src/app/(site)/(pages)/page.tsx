import styles from './page.module.css';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight02Icon,
} from '@hugeicons/core-free-icons';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          {/* Left Side - Text Content */}
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleLine1}>Votre Peau</span>
              <span className={styles.titleLine2}>Respire</span>
            </h1>
            <div className={styles.heroButtons}>
              <Link href="/shop/products" className={styles.shopButton}>
                Découvrir
              </Link>
              <button className={styles.iconButton} aria-label="En savoir plus">
                <HugeiconsIcon icon={ArrowRight02Icon} size={24} />
              </button>
            </div>
            {/* Decorative shapes */}
            <div className={styles.decorativeShapes}>
              <div className={styles.shape1}></div>
              <div className={styles.shape2}></div>
              <div className={styles.shape3}></div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className={styles.heroImageWrapper}>
            <div className={styles.imageBackground}></div>
            <div className={styles.imageContainer}>
              <Image
                src="/images/hero.png"
                alt="PORELO - Soins naturels"
                width={600}
                height={700}
                className={styles.heroImage}
                priority
              />
              <div className={styles.imageOverlay}>
                <h3 className={styles.overlayTitle}>Prenez Soin de Votre Peau</h3>
                <p className={styles.overlaySubtitle}>Découvrez Nos Derniers Produits</p>
                <button className={styles.overlayButton} aria-label="Voir les produits">
                  <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
