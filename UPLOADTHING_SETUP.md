# Configuration UploadThing

Ce guide explique comment configurer UploadThing pour votre projet StudyHub.

## Étapes de configuration

### 1. Créer un compte UploadThing

1. Allez sur [https://uploadthing.com](https://uploadthing.com)
2. Créez un compte gratuit
3. Créez une nouvelle application

### 2. Obtenir les clés API

Une fois votre application créée, vous obtiendrez :
- `UPLOADTHING_SECRET` : Votre clé secrète
- `UPLOADTHING_APP_ID` : L'ID de votre application (optionnel, mais recommandé)

### 3. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
UPLOADTHING_SECRET=sk_live_xxx...
UPLOADTHING_APP_ID=your-app-id
```

**Note** : Ne commitez jamais ces clés dans votre dépôt Git. Elles sont déjà dans `.gitignore`.

### 4. Redémarrer le serveur de développement

Après avoir ajouté les variables d'environnement, redémarrez votre serveur :

```bash
npm run dev
```

## Fonctionnalités implémentées

- ✅ Upload de fichiers (PDF, images, vidéos, audio, documents)
- ✅ Affichage des fichiers par matière
- ✅ Suppression de fichiers
- ✅ Téléchargement/ouverture de fichiers
- ✅ Gestion des permissions par utilisateur

## Limites de taille

- PDF : 4 MB max
- Images : 4 MB max
- Vidéos : 16 MB max
- Audio : 4 MB max
- Autres fichiers : 4 MB max

## Structure de la base de données

Le modèle `File` a été ajouté à votre schéma Prisma avec les champs suivants :
- `id` : Identifiant unique
- `userId` : ID de l'utilisateur propriétaire
- `matiereId` : ID de la matière associée
- `name` : Nom du fichier
- `url` : URL du fichier sur UploadThing
- `size` : Taille en bytes
- `mimeType` : Type MIME du fichier
- `createdAt` : Date de création

## Utilisation

1. Allez sur une page de matière
2. Cliquez sur l'onglet "Fichiers"
3. Cliquez sur "Ajouter un fichier"
4. Sélectionnez votre fichier
5. Le fichier sera automatiquement uploadé et enregistré

## Support

Pour plus d'informations, consultez la [documentation officielle d'UploadThing](https://docs.uploadthing.com).
