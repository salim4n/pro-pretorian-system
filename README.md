# 🎥 Pro-Pretorian System - Vision Informatique en Temps Réel

## Présentation

Ce projet démontre la puissance de la vision par ordinateur directement dans le navigateur grâce à TensorFlow.js et WebGL. En exploitant les modèles YOLO et COCO-SSD pour la détection d'objets, l'exécution se fait en temps réel côté client, ce qui permet de réduire drastiquement les coûts serveur en limitant les appels API aux seuls moments où une détection est effective.

> **Note :** Je suis actuellement en train de nettoyer et d'optimiser les modèles présents sur la plateforme. Nous restons sur TensorFlow pour garantir stabilité et compatibilité, tout en procédant à un nettoyage complet du reste du système.

## Fonctionnalités

- **Détection d'objets en temps réel**  
  Exécution de modèles YOLO et COCO-SSD via WebGL directement dans le navigateur.
  
- **Efficacité économique**  
  Réduction des coûts de cloud computing et de la bande passante grâce à une communication serveur optimisée.
  
- **Notifications flexibles**  
  Intégration simple avec Telegram, email, WhatsApp, SMS, ou toute autre plateforme de votre choix.
  
- **Interface intuitive**  
  Création de canevas personnalisés pour définir les zones de détection, avec une sélection aisée des modèles et des labels.
  
- **Optimisation continue**  
  Nettoyage des modèles et amélioration du reste du système pour une expérience utilisateur optimale.

## Démonstration

[![Voir la démonstration](https://img.youtube.com/vi/fO3A9giDCVk/hqdefault.jpg)](https://www.youtube.com/watch?v=fO3A9giDCVk)

## Démarrage

### Prérequis

- [Node.js](https://nodejs.org)
- npm ou yarn

### Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/salim4n/pro-pretorian-system.git
   cd pro-pretorian-system
   ```

2. **Installer les dépendances :**

   ```bash
   npm install
   ```

3. **Lancer l'application :**

   ```bash
   npm start
   ```

Cela démarrera un serveur de développement local et ouvrira l'application dans votre navigateur par défaut.

## Utilisation

- **Sélection du modèle :**  
  Choisissez entre YOLO et COCO-SSD selon vos besoins.
  
- **Définition de la zone de détection :**  
  Dessinez et ajustez la zone sur le canevas pour concentrer la détection sur une partie spécifique de l'image.
  
- **Exécution de la détection :**  
  Lancez le processus et recevez des notifications via votre plateforme préférée.

## Configuration

### Intégration de Telegram

Pour recevoir des notifications via Telegram, configurez un bot et récupérez votre token ainsi que votre chat ID. Ajoutez ces informations dans le fichier `.env` :

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Modèles et Labels Personnalisés

Vous pouvez enrichir le projet en ajoutant vos propres modèles et labels en modifiant les dossiers `models/` et `labels/`.

## Roadmap

- **Optimisation des modèles :**  
  Nettoyage et amélioration continue des modèles existants.
  
- **Ajout de nouveaux modèles pré-entraînés.**
  
- **Support pour d'autres plateformes de notification :**  
  Intégration future avec Slack, Microsoft Teams, etc.
  
- **Perfectionnement de l'interface :**  
  Nous recherchons des développeurs passionnés, capables de rendre le design **pixel perfect** et d'améliorer l'UI/UX pour une expérience utilisateur irréprochable.

## Participation

Nous invitons la communauté à contribuer activement à ce projet ! Voici ce que nous attendons de vos participations :

- **Développeurs :**  
  Contribuez avec un code propre, optimisé et robuste. Votre expertise pour atteindre un rendu pixel perfect est essentielle pour sublimer l'interface et l'expérience utilisateur.

- **Concepteurs/UI-UX :**  
  Apportez vos idées et compétences pour repenser et affiner le design de l'application, afin de la rendre plus intuitive et esthétiquement irréprochable.

- **Testeurs et contributeurs généraux :**  
  Vos retours et suggestions sont précieux pour améliorer la stabilité, la performance et la convivialité du projet.

> **Astuce :** Pour toute modification majeure, merci de créer une issue afin de discuter ensemble des changements envisagés.

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact

Pour questions, suggestions ou contributions, n'hésitez pas à me contacter :

**Salim4n**  
Email : [mon mail perso](mailto:laimeche160@gmail.com)


