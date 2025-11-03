# Permettre au serveur Go de se recharger automatiquement après chaque modification

Pour recharger automatiquement un serveur Go à chaque modification du code, utilisez un outil de surveillance de fichiers qui redémarre le serveur. Voici trois solutions courantes et simples à configurer.

## 1. air
air est populaire et simple d'utilisation.

Installation :
```bash
go install github.com/cosmtrek/air@latest
```

Initialiser (optionnel) :
```bash
air init
```

Lancer :
```bash
air
```

## 2. reflex
reflex est léger et flexible. On peut lancer directement une commande ou utiliser un fichier de configuration `.reflex`.

Installation :
```bash
go install github.com/cespare/reflex@latest
```

Exemple d'exécution (redémarre sur les fichiers `.go`) :
```bash
reflex -r '\.go$' -- sh -c "go run main.go"
```

## 3. fresh
fresh surveille le projet et redémarre le serveur dès qu'un fichier change.

Installation :
```bash
go install github.com/pilu/fresh@latest
```

Lancer :
```bash
fresh
```

Remarques
- Assurez-vous que le répertoire d'installation des binaires (`$GOBIN` ou `$(go env GOPATH)/bin`) est dans votre `PATH`.
- Adaptez la commande (par ex. `main.go`) selon le point d'entrée de votre application.
- Choisissez l'outil qui correspond le mieux à vos besoins de configuration et de simplicité.
