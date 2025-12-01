import type { Metadata } from "next";
import { Quicksand, Playfair_Display } from "next/font/google";
import "../styles/globals.css";
import styles from './layout.module.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';


const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "PORELO - Pure skin, pure you",
  description: "Boutique de produits de soins naturels pour une peau pure et éclatante",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${quicksand.variable} ${playfairDisplay.variable} antialiased ${styles.layout}`}
      >
        <AuthProvider>
          <CartProvider>
            <div className={styles.main}>
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

