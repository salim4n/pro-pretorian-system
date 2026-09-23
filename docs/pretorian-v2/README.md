# Pretorian System v2 — dossier de refonte

Date de consolidation : **23 septembre 2026**.

Ce dossier consigne la discussion de conception avec Salim : vision produit, décisions, évolution des choix de runtimes, architecture, catalogue de modèles candidats et plan de réalisation. Il constitue une base de travail pour la refonte, **pas la description d'une v2 déjà implémentée ou benchmarkée**.

## Intention produit

> Pretorian permet de connecter des caméras compatibles, d'activer des capacités de vision adaptées à un besoin métier et de recevoir des événements exploitables, avec une analyse administrée depuis un SaaS.

L'abstraction produit est **Caméra + Vision Pack + Règles**, et non « caméra + nom de modèle ». Une même caméra peut participer à plusieurs pipelines. Plusieurs packs peuvent partager un détecteur de personnes ou de véhicules.

La v1 explorait l'inférence dans le navigateur. La v2 déplace l'analyse continue vers un service Rust indépendant des onglets et des sessions utilisateur. Le navigateur devient principalement l'interface de configuration et de consultation.

## Direction retenue dans l'échange

- **SaaS et vision CPU-first sur notre infrastructure** pour démarrer ; la même VM peut héberger les services au MVP, avec isolation des processus et budgets de ressources.
- **Moteur d'inférence réellement Rust-native** : pas ONNX Runtime/OpenVINO comme moteur de production par défaut. Il s'agit d'un choix de dépendances et de maîtrise technique, pas d'une preuve de supériorité de performance.
- **Tract, Candle et Burn** sont des voies admissibles. Tract est particulièrement intéressant pour les graphes importés ; Candle/Burn conviennent aux architectures disponibles ou implémentées en Rust. Le choix final exige des essais sur les modèles retenus.
- **Modèles Hugging Face existants d'abord**, puis adaptation, fine-tuning ou entraînement lorsque nécessaire. Exporter des poids en Safetensors est une voie pleinement acceptée.
- **Qwen/Qwen3-VL-4B-Instruct externalisé via Hugging Face**, sur des événements sélectionnés, jamais dans l'analyse systématique de chaque image. Le fournisseur et le contrat d'API sont à qualifier.
- **Même cœur Vision Node pour cloud et edge**. L'edge reste une possibilité de déploiement, pas une obligation commerciale imposée au MVP cloud.
- **Détection, événement métier et notification sont distincts**. Une bounding box ne doit pas directement déclencher une alerte répétitive.
- **Aucune capacité garantie en nombre de caméras sans benchmark complet** : réseau, décodage, preprocessing, inférence, règles et stockage.

## Lecture du dossier

| Document | Contenu |
|---|---|
| [DECISIONS.md](DECISIONS.md) | Choix validés, propositions, historique des arbitrages et corrections importantes. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Déploiement, Vision Node, scheduler, événements, données, sécurité et résilience. |
| [MODEL_CATALOG.md](MODEL_CATALOG.md) | Modèles évoqués, sources, formats et licences déclarés, travail d'intégration et registry. |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Séquence de réalisation, critères d'acceptation, benchmarks et points ouverts. |

## Packs envisagés

| Pack | Capacités visées | Périmètre initial proposé |
|---|---|---|
| Security / sûreté | Présence hors horaires, intrusion de zone, franchissement de ligne, stationnement prolongé. | Première boucle bout en bout : détecteur généraliste + suivi + règles. |
| Safety / chantier | Casque, gilet, équipement observable, zone interdite aux personnes. | Deuxième pipeline pilote pour éprouver la spécialisation métier. |
| Fire / fumée-flammes | Indices visuels de fumée/flammes et confirmation temporelle. | Recherche et validation séparées ; pas une promesse de système incendie certifié. |
| Human / pose | Pose, immobilité, situation compatible avec une chute. | Exploration ultérieure ; pas une décision fondée sur une image isolée. |
| Thermal | Détection adaptée aux capteurs thermiques. | Extension future, distincte des modèles RGB. |

L'ordre de livraison est une proposition, pas une réduction définitive de l'ambition multi-modèles. Un détecteur généraliste peut alimenter plusieurs packs. Un modèle unique PPE ou fumée/flammes peut produire plusieurs classes : inutile de charger artificiellement un réseau par libellé.

## Offre et expérience à tester

Parcours cible : compte → site → raccordement autorisé des caméras → choix du pack → zones/horaires → test d'événement → exploitation.

Le cloud nécessite un accès réseau réel aux flux : VPN, connecteur sortant ou intégration documentée avec un fournisseur/VMS. Une connexion au SaaS ne crée pas cet accès. Ne pas promettre « toutes les caméras, sans installation ».

Le Free peut rester une démonstration interactive. Le Pro doit vendre l'exploitation : fiabilité mesurée, configuration, historique, mises à jour, supervision et support. L'extension historique est une piste de démonstration, pas le socle de l'ingestion continue.

Hypothèse commerciale à tester : mise en service + abonnement par site/périmètre de caméras et packs ; matériel et développements spécifiques séparés. Aucun prix, SLA, nombre de clients ou nombre de caméras n'est arrêté ici. Des pilotes sur sites privés et un partenaire intégrateur ont été proposés, sans engagement externe pris.

## Statut et précautions

Cette livraison est documentaire. Elle ne lance aucun entraînement, déploiement, abonnement d'inférence ni dépense. Aucun modèle candidat n'a été exécuté sur la VM Pretorian dans le cadre de cette consolidation. Aucun secret n'est reproduit.

Les anciens README et exemples concernent toujours la v1. Les choix v2 de ce dossier remplacent les propositions préliminaires contradictoires, mais ne changent pas le code existant. Les liens externes sont des sources à réexaminer et à épingler par révision lors de la qualification.
