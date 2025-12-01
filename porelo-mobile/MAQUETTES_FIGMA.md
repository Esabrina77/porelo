# 📱 Contenu des Pages - PORELO Mobile App

## 📐 Navigation Bar (Bottom Tabs)

### Pour Utilisateurs (USER)
5 onglets :
1. **Produits** - Icône Maison
2. **Panier** - Icône Panier (badge avec nombre d'articles si > 0)
3. **Commandes** - Icône Facture
4. **Favoris** - Icône Cœur
5. **Profil** - Icône Utilisateur

### Pour Administrateurs (ADMIN)
4 onglets :
1. **Produits** - Icône Package
2. **Catégories** - Icône Dossier
3. **Commandes** - Icône Fichiers
4. **Profil** - Icône Utilisateur

---

## 📄 Écrans Utilisateur (USER)

### 1. Landing Screen (Page d'accueil - Non connecté)
**Contenu :**
- Logo PORELO (grand)
- Slogan : "Pure skin, pure you"
- 3 cartes de features :
  - **100% Naturel** (icône feuille)
  - **Soins Doux** (icône cœur)
  - **Qualité Premium** (icône étoiles)
- Bouton "Se connecter"
- Bouton "Créer un compte"

---

### 2. Login Screen (Connexion)
**Contenu :**
- Logo PORELO
- Sous-titre : "Pure skin, pure you"
- Champ Email (icône mail)
- Champ Mot de passe (icône cadenas, masqué)
- Bouton "Se connecter" (avec état loading)
- Lien : "Pas encore de compte ? S'inscrire"

---

### 3. Register Screen (Inscription)
**Contenu :**
- Logo PORELO
- Titre : "Créez votre compte"
- Champ Email (icône mail)
- Champ Mot de passe (icône cadenas, masqué)
- Champ Confirmer mot de passe (icône cadenas, masqué)
- Bouton "S'inscrire" (avec état loading)
- Lien : "Déjà un compte ? Se connecter"

---

### 4. Products Screen (Liste des produits)
**Header :**
- Titre "Produits"
- Barre de recherche
- Bouton filtres

**Contenu :**
- Liste de produits (grille 2 colonnes ou liste)
- Carte produit :
  - Image produit
  - Nom du produit
  - Catégorie
  - Prix
  - Badge stock (disponible / rupture)
  - Bouton favoris (cœur)
  - Bouton panier

**Filtres Modal :**
- Sélection catégories
- Prix min/max
- Filtre stock (tous / en stock / rupture)
- Tri (nom A-Z, nom Z-A, prix croissant, prix décroissant)
- Boutons "Appliquer" et "Réinitialiser"

**États :**
- Loading
- Empty : "Aucun produit trouvé"
- Pull-to-refresh
- Infinite scroll

---

### 5. Product Detail Screen (Détails produit)
**Header :**
- Bouton retour
- Titre "Détails du produit"
- Bouton partage

**Contenu (Scrollable) :**
- Image produit (pleine largeur)
- Nom du produit
- Catégorie (badge)
- Prix
- Description
- Badge stock
- Note moyenne (étoiles + nombre d'avis)
- Bouton favoris (cœur)
- Contrôles quantité (- / nombre / +)
- Bouton "Ajouter au panier"

**Section Avis :**
- Titre "Avis clients"
- Note moyenne + nombre total d'avis
- Formulaire d'avis (si pas encore d'avis) :
  - Sélecteur d'étoiles (1-5)
  - Champ commentaire
  - Bouton "Publier l'avis"
- Liste des avis :
  - Note (étoiles)
  - Email utilisateur (masqué)
  - Commentaire
  - Date

---

### 6. Cart Screen (Panier)
**Header :**
- Titre "Panier"

**Contenu :**
- Liste des articles :
  - Image produit
  - Nom produit
  - Prix unitaire
  - Contrôles quantité (- / nombre / +)
  - Prix total pour l'article
  - Bouton retirer (×)

**Résumé (fixe en bas) :**
- Total articles
- Total (prix)
- Bouton "Passer la commande" (avec état loading)

**État vide :**
- Message "Votre panier est vide"
- Bouton "Parcourir les produits"

---

### 7. Favorites Screen (Favoris)
**Header :**
- Icône cœur
- Titre "Mes Favoris"
- Sous-titre : "X produit(s) sauvegardé(s)"
- Bouton vider (icône poubelle, si favoris > 0)

**Contenu :**
- Liste des favoris
- Carte produit :
  - Image produit
  - Nom, catégorie, prix
  - Badge stock
  - Bouton retirer favoris (cœur)

**État vide :**
- Grande icône cœur
- Titre "Vos favoris sont vides"
- Sous-texte explicatif
- Bouton "Parcourir les produits"

---

### 8. Orders Screen (Commandes)
**Header :**
- Titre "Mes Commandes"

**Contenu :**
- Liste des commandes :
  - Date de commande
  - ID commande (8 premiers caractères)
  - Badge statut (En attente / Expédiée / Livrée / Annulée)
  - Nombre d'articles
  - Total (prix)
  - Liste des 3 premiers produits (+X autres si plus)

**État vide :**
- Message "Aucune commande"
- Sous-texte explicatif
- Bouton "Parcourir les produits"

**Actions :**
- Pull-to-refresh

---

### 9. Order Detail Screen (Détails commande)
**Header :**
- Bouton retour
- Titre "Détails de la commande"

**Contenu (Scrollable) :**
- Section informations :
  - ID commande
  - Date
  - Statut (badge avec icône)
- Section articles :
  - Liste complète des articles :
    - Image produit
    - Nom produit
    - Quantité x Prix unitaire
    - Sous-total
- Section total :
  - Total articles
  - Total commande

---

### 10. Profile Screen (Profil)
**Contenu (Scrollable) :**
- Logo PORELO (icône seule)
- Titre "Bienvenue"
- Carte Email :
  - Label "Email"
  - Valeur (email utilisateur)
- Carte Rôle :
  - Label "Rôle"
  - Badge rôle (Administrateur / Utilisateur)
- Bouton "Se déconnecter"
- Footer :
  - Texte "PORELO"
  - Sous-texte "Pure skin, pure you"

---

## 🔧 Écrans Administrateur (ADMIN)

### 11. Admin Products Screen (Gestion produits)
**Header :**
- Titre "Gestion Produits"
- Bouton "+" (créer produit)

**Contenu :**
- Liste des produits :
  - Image produit
  - Nom produit
  - Prix
  - Stock
  - Catégorie
  - Bouton Modifier (icône crayon)
  - Bouton Supprimer (icône poubelle)

**Actions :**
- Pull-to-refresh

---

### 12. Admin Categories Screen (Gestion catégories)
**Header :**
- Titre "Gestion Catégories"
- Bouton "+" (créer catégorie)

**Contenu :**
- Liste des catégories :
  - Nom catégorie
  - Bouton Modifier (icône crayon)
  - Bouton Supprimer (icône poubelle)

**Modal Création/Modification :**
- Champ nom catégorie
- Boutons "Annuler" et "Enregistrer"

---

### 13. Admin Orders Screen (Gestion commandes)
**Header :**
- Titre "Gestion Commandes"

**Contenu :**
- Liste de toutes les commandes :
  - Date
  - Email utilisateur (masqué partiellement)
  - Statut (badge)
  - Total
  - Bouton modifier statut

**Modal Modification Statut :**
- Sélecteur de statut (En attente / Expédiée / Livrée / Annulée)
- Boutons "Annuler" et "Enregistrer"

---

### 14. Create Product Screen (Créer produit)
**Header :**
- Titre "Nouveau produit"
- Bouton retour

**Contenu (Formulaire Scrollable) :**
- Champ Nom (requis)
- Champ Description (textarea)
- Champ Prix (requis, nombre)
- Champ Stock (requis, nombre)
- Champ Image URL (optionnel)
- Sélecteur Catégorie (dropdown)
- Bouton "Créer le produit"

---

### 15. Edit Product Screen (Modifier produit)
**Contenu :**
- Identique à Create Product mais pré-rempli
- Bouton "Enregistrer les modifications"

---

## 🔄 Flux de Navigation

### Utilisateur Non Connecté
1. Landing → Login / Register
2. Login/Register → Products (après connexion)

### Utilisateur Connecté (USER)
- Products ↔ ProductDetail
- Products → Cart (via bouton panier)
- Cart → Orders (après commande)
- Orders → OrderDetail
- Tous les onglets accessibles via Bottom Tabs

### Administrateur (ADMIN)
- AdminProducts ↔ CreateProduct / EditProduct
- AdminOrders → OrderDetail
- Tous les onglets accessibles via Bottom Tabs

