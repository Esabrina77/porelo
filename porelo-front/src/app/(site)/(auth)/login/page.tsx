"use client";
import React, { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';


export default function LoginPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');


    try {
      // 1 appel de la api pour la connexion
      await login(email, password);
      // 2 redirection vers la page d'accueil

      router.push('shop/products');

    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue. Veuillez réessayer.');
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
            Connexion
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.checkboxGroup}>
              
              <a href="#" className={styles.forgotLink}>
                Mot de passe oublié ?
              </a>
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
              {loading ? 'Connexion en cours ...' : 'Se connecter'}
            </button>

            <div className={styles.footer}>
              Pas encore de compte ?{" "}
              <a href="/register" className={styles.registerLink}>
                Créer un compte
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

