"use client";
import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation du mot de passe
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      await register(email, password);
      router.push('/shop/products');
    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <Link href="/">
            <Image
              src="/logo/porelo.png"
              alt="PORELO Logo"
              width={250}
              height={120}
            />
            <p className="subtitle-display italic">
              Pure skin, pure you
            </p>
          </Link>
        </div>

        <div className={styles.card}>
          <h2 className={`subtitle-display text-primary ${styles.cardTitle}`}>
            Créer un compte
          </h2>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-field"
                placeholder="votre@email.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                required
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
              <p className={styles.helpText}>
                Minimum 6 caractères
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="input-field"
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  className={styles.checkbox}
                  required
                />
                <span>
                  J&apos;accepte les{" "}
                  <a href="#" className={styles.link}>
                    conditions d&apos;utilisation
                  </a>
                </span>
              </label>
            </div>

            {message && (
              <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px' }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className={`btn-primary ${styles.submitButton}`}
              disabled={loading}
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>

            <div className={styles.footer}>
              Déjà un compte ?{" "}
              <Link href="/login" className={styles.loginLink}>
                Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

