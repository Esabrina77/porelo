# Scripts d'initialisation

## Seed - Initialisation des données de test

Le script `seed.go` permet d'initialiser la base de données avec des données de test pour le développement.

### Utilisation

```bash
go run scripts/seed.go
```

### Données créées

1. **Utilisateur Admin**
   - Email: `momo@ynov.com`
   - Password: `Password2025`
   - Rôle: ADMIN

2. **Catégories** (4 catégories)
   - Visage
   - Corps
   - Cheveux
   - Homme

3. **Produits** (5 produits)
   - Crème hydratante visage (29.99€)
   - Sérum anti-âge (49.99€)
   - Gel douche relaxant (15.99€)
   - Shampooing réparateur (19.99€)
   - Soin après-rasage (24.99€)

### Notes

- Le script vérifie si les données existent déjà avant de les créer (idempotent)
- Si l'admin existe déjà, son rôle sera mis à jour si nécessaire
- Les produits sont associés aux catégories créées

