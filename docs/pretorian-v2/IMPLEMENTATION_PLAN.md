# Plan de réalisation et qualification — Pretorian v2

Date : 23 septembre 2026. **Backlog documentaire proposé ; les éléments ci-dessous ne sont pas des issues GitHub créées ni des tâches déjà exécutées.** Pas d'estimation de délai ni d'engagement de coût à ce stade.

## 1. Ordre de réalisation

### P0 — Établir une base sûre et reproductible

Inventorier les comportements v1 utiles, les modèles historiques, les parcours caméra et les dépendances. Examiner les trois dépôts Free/Pro/extension pour les secrets et artefacts de signature exposés ; révoquer/remplacer avant nettoyage si nécessaire, sans publier leurs valeurs.

Vérifier les règles de déploiement avant toute fusion. Le workflow actuel `.github/workflows/app-service-code.yml` se déclenche sur un push `main` et contient un déploiement Azure en production. Cette documentation n'en modifie pas les déclencheurs. Une fusion doit donc être planifiée comme telle, même pour des changements documentaires.

**Acceptation :** source v1 préservée, stratégie de branche/migration définie, inventaire des risques disponible, environnement d'essai séparé et aucune dépendance à un secret historique non audité.

### P1 — Fixer un scénario pilote et la machine de référence

Scénario initial proposé : présence dans une zone privée en dehors d'une plage horaire. Définir les caméras, codecs, sous-flux, dimensions, visibilité minimale, latence admissible et procédure humaine de traitement d'alerte. Décrire la VM exacte, CPU, architecture, instructions disponibles, RAM, quotas et services cohébergés.

**Acceptation :** installation test accessible par un chemin autorisé, images de test utilisables, critères d'événement et objectifs mesurables écrits avant le benchmark.

### P2 — Qualifier un premier modèle et un runtime

Partir du catalogue, examiner la licence/provenance et établir une référence. Comparer Tract, Candle ou Burn seulement sur les voies réellement pertinentes et compatibles ; ne pas financer trois implémentations complètes par principe.

RT-DETR compact est une hypothèse de départ, pas un prérequis absolu. Si le coût de portage ou le CPU est inadéquat, choisir un candidat plus simple tout en conservant les contrats. Aucun retour à ONNX Runtime en production sans réouvrir la décision Rust-native avec Salim.

**Acceptation :** un checkpoint épinglé, un jeu d'images de parité, une sortie correcte en Rust, un rapport CPU reproductible, des limites explicites et un premier arbitrage de runtime documenté.

### P3 — Construire le Vision Node minimal

Ingestion d'un flux, reconnexion, horodatage, décodage, sampling, pré/postprocessing, budget de concurrence, métriques et arrêt propre. Conserver un état clair lorsqu'aucune image exploitable n'arrive. Construire un test de replay qui ne dépende pas d'une caméra physique permanente.

**Acceptation :** traitement continu mesuré avec mémoire et file bornées ; reprise après perte de flux ; CPU et âge des frames visibles ; aucun calcul intensif sans limite dans les threads réseau.

### P4 — Construire la boucle événement métier

Suivi local des objets, zones/lignes, horaires, persistance et anti-répétition. Traiter minuit, fuseaux et changements d'heure. Produire un identifiant stable par événement avec preuves et versions. Ajouter le tampon média borné et la politique de rétention.

**Acceptation :** les fixtures positives et négatives déclenchent les événements attendus ; pas d'alerte par frame ; des données insuffisantes donnent un état explicite plutôt qu'une certitude artificielle.

### P5 — Relier le control plane et le node

Organisations, sites, caméras, affectations, enrôlement, desired/reported state, registry et contrôles d'accès. Ingestion idempotente et outbox persistante. Un premier canal : webhook, Telegram ou email, selon les contraintes du pilote.

**Acceptation :** une configuration appliquée est identifiable par génération ; reprise après redémarrage ; événements non perdus silencieusement ; essais d'isolation tenant ; secrets absents des logs ; suivi des tentatives de notification.

### P6 — Qualifier le VLM externalisé

Vérifier la disponibilité réelle de Qwen via le fournisseur HF, sur données autorisées et avec accord sur le budget. Implémenter un adaptateur, limites d'images/tokens, validation de sortie, timeout, retries et circuit breaker. Aucun endpoint dédié payant créé implicitement.

**Acceptation :** une observation complémentaire exploitable est obtenue ; les réponses ambiguës restent `unknown` ; les alertes de base survivent à une panne/quota épuisé ; coût et destination des images sont traçables.

### P7 — Prouver le multi-modèles avec un second pack

Introduire un pipeline PPE et vérifier association personne/équipement, visibilité et temporalité. Comparer réutilisation d'une architecture, import d'un checkpoint spécialisé ou fine-tuning propre si les droits et données le permettent.

En parallèle uniquement si les ressources le permettent : protocole de recherche feu/fumée, indépendant de la présence humaine. Ne pas présenter ce travail comme une mise en production incendie.

**Acceptation :** activer/désactiver un pack sans modifier le control plane ni les contrats d'événements ; capacité et qualité mesurées avec les deux pipelines concurrents ; pas d'hypothèse « tous les modèles tournent sur toutes les images ».

### P8 — Tester les défauts et la charge, puis mener les pilotes

Matrice multicaméra, saturation, coupures, disque plein, caméra figée, panne du stockage/VLM/canal d'alerte, mise à jour de modèle invalide, révocation d'un node. Tester le mode cloud d'abord, puis un déploiement edge si nécessaire.

**Acceptation :** capacité maximale publiée uniquement pour une configuration précise ; limites d'admission et états dégradés visibles ; rollback validé ; critères métier atteints sur les sites pilotes. La proposition commerciale et le support sont ajustés sur les mesures.

## 2. Protocole de benchmark

### Reproductibilité

Enregistrer CPU exact, vCPU réellement alloués, type d'hébergement, RAM, OS, build Rust release, versions/crates/features, threads, runtime/backend, hash du modèle, precision, dimensions d'entrée, codec, FPS source et analyse, nombre de flux et packs actifs. Ne pas comparer des architectures ou précisions différentes comme s'il s'agissait d'une comparaison pure de runtimes.

Conserver commandes, révisions, fixtures autorisées et résultats bruts. Épingler les dépendances. Un test sur laptop n'est pas une capacité garantie sur la VM cloud.

### Étape A — Parité numérique avant performance

Comparer preprocess, sorties brutes, scores/boîtes, dénormalisation, padding, ordre des classes et postprocessing. Fixer les tolérances avant les essais ; les adapter explicitement à la précision. Vérifier les bords de zone, petits objets, absence d'objet et images tronquées. Un export qui charge mais produit de mauvaises coordonnées échoue.

### Étape B — Performance isolée

Mesurer téléchargement séparément du chargement, démarrage à froid, premier passage, régime établi, mémoire maximale, débit et latences p50/p95/p99. Détailler decode, resize/conversion, copies, inférence, postprocessing et suivi.

Quantification, précision réduite et batch sont des variantes à valider, pas des accélérations présumées. La capacité d'un runtime à charger des poids quantifiés ne prouve pas l'accélération de ce détecteur sur ce CPU.

### Étape C — Charge bout en bout

Proposition de grille d'essai : 1, 4, 8 puis 16 flux **seulement tant que le budget le permet**, différentes résolutions/sous-flux et cadences expérimentales. Ce sont des points de mesure, pas des offres commerciales.

Mesurer âge des frames, délai événement→notification, événements dupliqués/manqués, backlog, dropped frames, CPU/RAM, contention avec API/DB, volume réseau, stockage et coûts VLM. Tester plusieurs scènes actives simultanément ; un benchmark majoritairement vide surestime la capacité d'un scheduler conditionnel.

Demande théorique d'inférences : somme, sur les caméras et pipelines, des FPS analysés multipliés par le nombre attendu de passages actifs. Cette demande n'est pas la capacité CPU : cette dernière doit venir de mesures tenant compte des threads, du décodage et de la contention.

### Étape D — Qualité métier

Séparer entraînement, réglage et évaluation par sites/caméras/périodes. Ne pas répartir aléatoirement des frames adjacentes entre train et test. Documenter droits, représentativité, annotation et incertitudes.

Évaluer précision/rappel au niveau événement, fausses alertes par caméra-heure, événements manqués sur scénarios contrôlés, temps de détection et part des situations `unknown`. Inclure jour/nuit, contre-jour, pluie, occultation, petit objet, angles inhabituels et scènes négatives. Pour le feu/fumée, protocole adapté et validation indépendante avant toute promesse de sécurité.

## 3. Portes de validation

| Porte | Preuve demandée |
|---|---|
| G1 — Droits | Origine et conditions du code, poids, données et usage autorisé documentés. |
| G2 — Exécution | Import/chargement réel en Rust et parité avec une référence. |
| G3 — Capacité | Budget matériel et débit caméra/pack mesurés de bout en bout. |
| G4 — Utilité | Résultats métier sur données séparées et scènes représentatives. |
| G5 — Exploitation | Supervision, mises à jour, reprise, déduplication et tests de panne. |
| G6 — Données | Destinations, accès, rétention, consentements/autorisations et obligations applicables examinés. |
| G7 — Pilote | Responsables identifiés, limites comprises et procédure de traitement d'alerte validée. |

Aucun lancement sensible ne doit être justifié par le seul passage G2. Les seuils chiffrés de G3/G4 sont à fixer avec le scénario pilote et les risques, pas inventés dans cette note.

## 4. Points encore ouverts

- Runtime primaire, version, backend CPU et graphe de dépendances réellement admis.
- Checkpoints généraliste/PPE/feu retenus et possibilité de partager une famille d'architecture.
- VM exacte, nombre de caméras admissibles et coûts complets par site.
- Raccordement cloud : VPN, connecteur sortant ou intégration fournisseur.
- Fournisseur HF effectif, conditions images, quotas, prix et fiabilité observée.
- Fournisseurs auth/stockage, canal de notification initial et durées de conservation.
- Périmètre des premiers pilotes et séquence de commercialisation des packs.
- Licence/distribution du produit v2 ; le README v1 ne tranche pas les droits des futurs poids.
- Stratégie de migration sans casser le Pro historique ni entretenir trois moteurs en parallèle.

## 5. Reprise par un développeur ou un agent

Lire les cinq documents de ce dossier avant de coder. Ne pas présenter les exemples comme une API existante. Ne pas introduire d'ONNX Runtime, de GPU obligatoire, de service Python d'inférence en production ou d'endpoint payant sans décision explicite. Python reste autorisé pour préparation, entraînement et évaluation hors runtime.

Commencer par les preuves P1/P2 plutôt que par une réécriture exhaustive de RT-DETR, une grille de tarifs ou une promesse de caméras illimitées. Garder les changements incrémentaux, testables et réversibles. Signaler les incompatibilités avec leurs preuves et proposer une alternative qui respecte la direction Rust-native.
