import Header from '@/components/shop/Header';
import Footer from '@/components/Footer';
// import styles from './layout.module.css'; // Assurez-vous d'importer vos styles

export default function ExtranetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Le RootLayout a déjà fourni <html> et <body>. 
  // Ce layout ne doit contenir que la structure interne.
  return (
    // Utilisez un div ou une structure de mise en page
    <div className="extranet-wrapper"> 
      
      {/* Le Header a besoin du AuthContext pour afficher le statut */}
      <Header /> 

      {/* Contenu principal de la page */}
      <main className="extranet-main">
        {children}
      </main>

    </div>
  );
}