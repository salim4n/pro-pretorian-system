# Décisions et arbitrages — Pretorian v2

Date : 23 septembre 2026. Voir [le dossier](README.md), [l'architecture](ARCHITECTURE.md) et [le catalogue](MODEL_CATALOG.md).

Statuts : **retenu** = direction exprimée ou approuvée dans l'échange ; **proposé** = détail de réalisation à confirmer ; **à qualifier** = dépend d'une preuve technique, opérationnelle ou juridique.

## Registre des décisions

| ID | Décision | Statut / conséquence |
|---|---|---|
| D01 | Remplacer l'analyse continue dans le navigateur par un Vision Node Rust. | Retenu. L'UI ne pilote pas la continuité du service. |
| D02 | Démarrer avec l'analyse spécialisée sur CPU dans notre cloud. | Retenu. Même VM que le SaaS possible au MVP ; capacité non démontrée. |
| D03 | Séparer logiquement control plane et vision workers dès le départ. | Retenu. Processus/conteneurs et budgets distincts ; séparation physique ultérieure. |
| D04 | Garder un control plane TypeScript. | Retenu comme direction ; Next.js + Bun/Hono + PostgreSQL proposés. Auth et stockage précis à choisir. |
| D05 | Privilégier une inférence Rust-native plutôt que des bindings ONNX Runtime. | Retenu à la demande de Salim. ONNX, le format, reste accepté. |
| D06 | Évaluer Tract pour les modèles ONNX compatibles. | Retenu comme piste privilégiée d'interopérabilité ; pas une obligation d'y faire passer chaque modèle. |
| D07 | Autoriser Candle/Burn avec architectures connues et poids Safetensors. | Retenu. Aucun obstacle conceptuel à entraîner/fine-tuner puis charger les poids en Rust. |
| D08 | Réutiliser les modèles Hugging Face avant d'entraîner. | Retenu. Licence, architecture, preprocessing et qualité à vérifier checkpoint par checkpoint. |
| D09 | Chercher une famille de détecteurs réutilisable entre usages. | Proposé : RT-DETR compact en première investigation. Pas de port Rust complet réputé acquis. |
| D10 | Externaliser Qwen3-VL-4B-Instruct via Hugging Face sur événements. | Retenu comme cible ; disponibilité API, fournisseur, quotas, coût et traitement des images à qualifier. |
| D11 | Conserver un cœur commun cloud/edge. | Retenu. Les raccordements réseau, secrets et politiques de données diffèrent selon le déploiement. |
| D12 | Exposer des packs métier indépendants des runtimes. | Retenu. Modèle, runtime et fournisseur restent des détails internes versionnés. |
| D13 | Échantillonner, mutualiser et déclencher les modèles conditionnellement. | Retenu comme principe. Cadences et seuils à mesurer, pas des garanties universelles. |
| D14 | Séparer événements et enrichissement VLM. | Garde-fou proposé : une panne VLM ne bloque ni ne supprime une alerte issue d'une règle validée. |
| D15 | Un seul runtime effectivement livré au premier jalon, si suffisant. | Proposition de simplification ; l'interface permet une extension, sans implémenter trois moteurs d'emblée. |

## Historique des arbitrages

1. Point de départ : reprendre les produits Free, Pro et extension, avec l'expérience technique acquise depuis la v1.
2. Première architecture proposée : contrôle SaaS + worker Rust, avec ONNX Runtime/OpenVINO.
3. Correction explicite de Salim : l'intérêt recherché est le natif Rust ; préférer Burn ou Candle aux bindings d'un runtime C++.
4. Découverte de Tract : intérêt fort pour l'exécution Rust de graphes importés. « Tract partout » reste conditionné à la compatibilité des modèles et au débit CPU.
5. Clarification : Candle/Burn sont également valides ; entraîner un modèle puis exporter ses poids Safetensors est une stratégie acceptable.
6. Orientation de sourcing : trouver les modèles utiles sur Hugging Face, réduire le nombre de familles à maintenir, entraîner seulement quand les candidats ne conviennent pas.

**Lecture finale : Rust-native est la contrainte ferme ; « Tract exclusivement » ou « RT-DETR exclusivement » ne sont pas des décisions irrévocables.**

## Corrections techniques à conserver

### ONNX n'est pas ONNX Runtime

ONNX décrit un graphe et des tenseurs. Tract peut importer des modèles ONNX et les préparer pour son propre moteur. Cela ne signifie ni qu'il utilise ONNX Runtime, ni qu'il transforme automatiquement tout modèle en fichiers source Rust.

La documentation Tract présente également un chemin de conversion vers NNEF/tract-OPL pour préparer les artefacts hors exécution. Les opérateurs, formes, versions et performances doivent être validés sur chaque export. Source : [Tract](https://github.com/sonos/tract).

### Burn n'impose pas toujours un portage manuel

Burn documente l'import ONNX sous forme de code Rust via ses outils d'import, sous réserve des opérateurs pris en charge, ainsi que le chargement de poids PyTorch/Safetensors dans des modèles définis en Burn. L'alternative n'est donc pas simplement « Tract importe / Burn exige tout réécrire ». Le backend concret retenu doit respecter notre objectif de dépendances natives. Source : [Burn](https://github.com/tracel-ai/burn).

### Safetensors contient les poids, pas un modèle exécutable universel

La voie Candle/Burn reste : architecture et configuration compatibles + poids + preprocessing + postprocessing. Contrôler noms et formes des tenseurs, ordre des classes, normalisation et géométrie des boîtes. Un changement de tête de classification peut demander une configuration ou une adaptation, même dans la même famille.

Sources : [Safetensors](https://huggingface.co/docs/safetensors/index), [Candle](https://github.com/huggingface/candle), [Burn](https://github.com/tracel-ai/burn).

### « Rust-native » a un périmètre

Nous visons le cœur d'inférence et la logique d'exploitation en Rust, pas l'absence absolue de dépendances natives. GStreamer dispose de bindings Rust mais sa bibliothèque et ses plugins ne deviennent pas Rust. Certains backends numériques peuvent aussi ajouter des bibliothèques externes : auditer les features et le graphe de dépendances. Source : [bindings GStreamer](https://gstreamer.freedesktop.org/bindings/rust.html).

### CPU-first n'est pas CPU illimité

Ni le nombre de paramètres, ni le nom « nano/small », ni le langage Rust ne démontrent un débit multicaméra. La quantification et les types FP16/BF16/INT8 restent des optimisations à vérifier sur le backend et le CPU exacts. Aucune accélération chiffrée n'est actée.

Les anciennes plages de FPS étaient des hypothèses de test. Elles ne constituent pas des recommandations de sécurité ou une preuve de détection suffisante pour intrusion, chute ou incendie.

### Un modèle sur le Hub n'est pas automatiquement une API serverless

La fiche de [Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct), consultée lors de la consolidation, affiche Featherless AI dans Inference Providers. Cela constitue une piste de raccordement, pas un test réalisé avec le compte Pretorian.

Distinguer le Hub, le service `hf-inference`, les fournisseurs routés par HF et les endpoints dédiés. La cible reste le service externalisé souhaité ; tout endpoint payant de repli exige une décision explicite. Source : [Inference Providers](https://huggingface.co/docs/inference-providers/index).

### Les scores et les licences ne se déduisent pas du format

Un score de détecteur n'est pas une probabilité calibrée de danger. Un nombre de confiance généré par un VLM ne l'est pas davantage. Utiliser les observations, l'état `unknown`, la provenance et une validation mesurée.

Les badges de licence des cartes de modèles sont des indications à contrôler avec les fichiers de droits, la provenance des poids et les conditions des données. Réentraîner, convertir ou distiller ne dispense pas de cet examen. Ne pas considérer un checkpoint ambigu comme automatiquement autorisé, même pour construire un teacher commercial.

## Hors périmètre initial proposé

Kubernetes/Kafka, GPU obligatoire, Qwen auto-hébergé, marketplace ouverte à du code modèle arbitraire, reconnaissance faciale, identification biométrique, scoring individuel de productivité et alerte générique « comportement suspect ».

Le pack incendie restera un travail de validation spécifique. Cette documentation ne présente Pretorian comme remplaçant d'alarme certifiée, de télésurveillance humaine ou de système de sécurité des personnes.
