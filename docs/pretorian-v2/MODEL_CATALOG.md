# Catalogue initial des modèles — Pretorian v2

Consolidation : **23 septembre 2026**. Ce catalogue conserve les pistes de la discussion, sans transformer un modèle trouvé sur le Hub en modèle validé pour Pretorian.

**Aucun checkpoint n'a été exécuté, converti, entraîné ou benchmarké pour cette livraison documentaire. Aucun droit de commercialisation n'est certifié ici.** Les formats/licences ci-dessous sont ceux annoncés par les sources consultées ; les poids, configurations et fichiers de droits restent à auditer et épingler par révision.

## 1. Panier prioritaire

| Besoin | Candidat et source | Éléments documentés | Statut Pretorian / travail restant |
|---|---|---|---|
| Détection RGB généraliste | [PekingU/rtdetr_r18vd](https://huggingface.co/PekingU/rtdetr_r18vd) | Point de départ RT-DETR-R18 pour la famille envisagée. | Candidat de base ; inspecter poids/configuration/classes/droits puis tester les voies Rust. Aucun débit CPU acquis. |
| PPE : personne, casque, gilet | [melihuzunoglu/ppe-detection](https://huggingface.co/melihuzunoglu/ppe-detection) | YOLOv11 ; exemple `best.pt` ; badge AGPL-3.0. La fiche liste Human, Helmet, No-Helmet et Vest. | Droits à examiner avant intégration. Modèle YOLOv11 non réputé compatible avec un port YOLOv8. Conversion et parité à établir. |
| PPE alternatif | [Hexmon/vyra-yolo-ppe-detection](https://huggingface.co/Hexmon/vyra-yolo-ppe-detection) | YOLOv8m ; exemple `best.pt`, tag ONNX ; badge CC-BY-4.0. | Confirmer les fichiers exacts et la chaîne de droits du modèle de base, des poids et du dataset. Pas une validation juridique d'Ultralytics. |
| Fumée / flammes | [fireviewer/rtdetr-v2-r50-fire-smoke](https://huggingface.co/fireviewer/rtdetr-v2-r50-fire-smoke) | RT-DETRv2-R50 ; Safetensors ; classes smoke_visible et flame_visible ; licence `other`. | Lire les termes propres au checkpoint avant tout usage. R50 n'est pas un choix CPU léger garanti. Comparator candidat, pas détecteur incendie qualifié. |
| Thermique | [whate/rt-detr-r18-thermal-detection](https://huggingface.co/whate/rt-detr-r18-thermal-detection) | RT-DETR-R18, Safetensors, badge Apache-2.0, entraînement thermique aérien HIT-UAV. | Piste hors MVP. La fiche indique une absence de validation pour caméras au sol et lumière visible : ne pas en faire un modèle RGB généraliste. |
| Pose | [facebook/sapiens2-pose-0.4b](https://huggingface.co/facebook/sapiens2-pose-0.4b) | Safetensors, licence Sapiens2 spécifique ; pose top-down qui nécessite des boîtes de personnes. | Référence d'exploration, pas candidat prioritaire pour la boucle CPU. Droits, coût et éventuel usage hors ligne à vérifier. |
| Compréhension sur événement | [Qwen/Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct) | Modèle image-texte, badge Apache-2.0. La page affiche Featherless AI dans Inference Providers à la consultation. | Cible externalisée. Tester l'appel image réel et le fournisseur avec le compte autorisé ; aucune requête d'inférence réalisée ici. |

### Précautions propres aux candidats

**PPE melihuzunoglu.** La fiche déduit « No-Vest » de l'absence de gilet dans la boîte d'une personne. Pretorian ne doit pas reprendre cette équivalence sans gestion de l'observabilité. Conserver `unknown` pour occultation, dos tourné, tronc hors champ ou résolution inadéquate.

**PPE Hexmon.** La fiche annonce 14 classes : Fall-Detected, Gloves, Goggles, Hardhat, Ladder, Mask, NO-Gloves, NO-Goggles, NO-Hardhat, NO-Mask, NO-Safety Vest, Person, Safety Cone, Safety Vest. La présence d'un libellé Fall-Detected ne valide pas un système temporel de détection de chute. Les gants/lunettes ne sont pas prioritaires avant validation de leur visibilité sur nos flux.

**FireViewer.** La fiche distingue les droits du modèle de base de ceux du checkpoint et des données, et demande une revue humaine. Ne pas recopier les chiffres de dataset/performance évoqués oralement comme des résultats Pretorian. Le checkpoint doit être qualifié sur vapeur, poussière, reflets, éclairages, occultations et scènes négatives réelles, avec un protocole adapté au risque.

**Thermique.** Les classes annoncées sont Bicycle, Car, DontCare, OtherVehicle et Person. Définir explicitement le traitement de DontCare et les domaines de capteurs compatibles. L'existence d'un checkpoint thermique montre une possibilité de spécialisation, pas une transférabilité immédiate à toute caméra thermique.

**Sapiens2.** Le modèle documente de nombreux points du corps et du visage ; Pretorian ne doit pas collecter des détails biométriques inutiles pour son besoin. Un modèle de pose plus léger reste à sélectionner. Toute utilisation comme teacher ou outil d'annotation nécessite aussi une revue des droits ; le mode hors ligne n'est pas une dispense.

## 2. Autres pistes conservées de la discussion

Cette section est une mémoire des alternatives, **pas une nouvelle qualification**.

| Piste | Rôle envisagé | Décision documentaire |
|---|---|---|
| RT-DETRv2 compact | Alternative à la base RT-DETR-R18. | Choisir un checkpoint précis et vérifier les différences v1/v2. |
| RF-DETR Nano / Small | Détection générale ou fine-tuning métier. | Comparaison éventuelle ; versions, poids et licences exactes à vérifier. |
| D-FINE | Famille de détecteurs supplémentaire. | Ajouter seulement si un gain mesuré justifie un nouvel adaptateur. |
| `fireviewer/dfine-large-fire-smoke-v7` | Référence feu/fumée citée précédemment. | Page non récupérée lors de cette consolidation ; format, statut et droits non revalidés. Ne pas l'activer sur la seule base de la discussion. |
| `TommyNgx/YOLOv10-Fire-and-Smoke-Detection` | Autre piste feu/fumée évoquée. | Non requalifiée ici ; ne pas reprendre une affirmation de licence Apache sans audit des poids et de leur provenance. |
| YOLO nano/small, dont YOLO26 évoqué | Référence de détection compacte. | Modèle/version/fichiers/droits à fixer avant toute comparaison. |
| RTMPose / RTMO | Pose plus légère que la référence Sapiens2. | Pistes à examiner ; pas de checkpoint précis ni de compatibilité Rust certifiés ici. |
| Grounding DINO | Exploration de classes et aide à l'annotation. | Hors boucle CPU principale proposée ; usage et droits à qualifier. |
| D-Fire | Dataset fumée/flammes cité comme piste. | Auditer les droits et le protocole de séparation ; ne pas le confondre avec un modèle prêt à déployer. |
| COCO-SSD / YOLO TensorFlow.js historiques | Référence de comportement v1. | Utile pour migration/démonstration, pas runtime professionnel v2 retenu. |

## 3. Une famille réutilisable, pas une hypothèse de compatibilité universelle

Hypothèse de travail : une architecture compacte commune pourrait servir au généraliste, au PPE et au feu/fumée via des poids spécialisés. RT-DETR est la première famille proposée, pas un vainqueur de benchmark.

Le gain recherché est la réutilisation de l'adaptateur, du preprocessing et des outils de validation. R18 et R50, RT-DETR et RT-DETRv2, nombres de classes et variantes de décodeur peuvent néanmoins nécessiter des différences de configuration ou d'implémentation. Un fichier Safetensors ne les résout pas à lui seul.

Ne pas multiplier inutilement les réseaux : un généraliste peut couvrir personnes et véhicules ; un PPE peut couvrir casque et gilet ; un fire/smoke peut avoir deux classes. Les noms internes `pret-general`, `pret-ppe`, `pret-fire-smoke`, `pret-pose`, `pret-thermal` sont des **identifiants envisagés**, pas des modèles déjà publiés.

## 4. Voies d'intégration Rust

| Voie | Artefacts / code nécessaires | Validation indispensable |
|---|---|---|
| Tract | Graphe exporté compatible, poids associés, pré/postprocessing Rust ; préparation éventuellement hors runtime. | Opérateurs, formes, export, stabilité numérique et coût CPU. Tract ne garantit pas tout ONNX. |
| Candle | Architecture disponible ou implémentée, configuration, mapping des poids Safetensors, pré/postprocessing. | Correspondance des noms/formes, calcul exact des couches et sorties. Un modèle HF n'est pas chargé universellement par son seul nom. |
| Burn natif | Modèle défini dans Burn, backend retenu, poids importés et configuration. | Chargement, parité numérique, dépendances et performances du backend réel. |
| Burn par import ONNX | Génération/import de modèle vers les API Rust Burn. | Ensemble d'opérateurs supportés, code généré, pré/postprocessing et parité. |

Sources des capacités : [Tract](https://github.com/sonos/tract), [Candle](https://github.com/huggingface/candle), [Burn](https://github.com/tracel-ai/burn), [Safetensors](https://huggingface.co/docs/safetensors/index).

Candle documente notamment des exemples YOLOv3/YOLOv8 : ce sont des points d'entrée possibles, pas une garantie pour n'importe quel checkpoint dérivé ou une autre génération YOLO. Aucune présence d'un adaptateur RT-DETR complet n'est affirmée ici.

Le choix du runtime ne change pas les droits des poids. L'export d'un `.pt` tiers doit se faire dans un environnement isolé, après audit, sans exécuter aveuglément du code distant ou désérialiser un artefact non fiable dans le SaaS.

## 5. Model Registry proposé

Un modèle candidat devient exécutable seulement après approbation explicite. Exemple volontairement incomplet et bloqué :

```yaml
schema_version: 1
id: pret-general-candidate
status: candidate
approved_for_production: false
task: object_detection
source:
  repository: PekingU/rtdetr_r18vd
  revision: null # commit exact obligatoire avant qualification
architecture:
  family: rtdetr
  variant: r18vd
  implementation_id: null
  implementation_revision: null
artifact:
  format: null # safetensors / onnx / artefact préparé, selon voie validée
  uri: null
  sha256: null
  signature: null
runtime:
  engine: null # tract / candle / burn après benchmark
  version: null
  backend: null
  device: cpu
input:
  shape: null
  dtype: null
  color_order: null
  resize_policy: null
  normalization: null
output:
  class_map: null
  box_format: null
  postprocessing_version: null
rights:
  code: to_review
  weights: to_review
  training_data: to_review
  approved_uses: []
validation:
  numerical_parity_report: null
  event_evaluation_report: null
  cpu_benchmark_report: null
  calibrated_thresholds: null
  known_limitations: []
```

La politique de déploiement doit rejeter les champs obligatoires absents, les hashes invalides, les usages non autorisés et les backends incompatibles. Conserver provenance, licence/fichiers de droits, révision du code, du modèle et des données de test. Une mise à jour du Hub ne doit jamais remplacer silencieusement le modèle en production.

## 6. Cycle de qualification

1. Retrouver le dépôt et les fichiers exacts ; figer une révision.
2. Examiner droits du code, des poids et des données, accès aux artefacts et usages autorisés.
3. Établir une référence numérique dans l'environnement officiel, avec exemples maîtrisés.
4. Importer ou implémenter une première voie Rust et comparer les sorties.
5. Mesurer la performance du pipeline complet sur le CPU cible.
6. Évaluer les événements métier, faux positifs, omissions et cas non observables.
7. Valider la configuration/les seuils par usage, documenter les limites, approuver un artefact signé et son rollback.

Un modèle tiers satisfaisant peut être utilisé tel quel une fois qualifié. L'entraînement/fine-tuning n'est pas une étape obligatoire : il doit répondre à un défaut mesuré ou à une spécialisation justifiée.

## 7. Qualification spécifique Qwen / Hugging Face

Cible : `Qwen/Qwen3-VL-4B-Instruct` derrière `VisionReasoner`. La présence d'un fournisseur sur la fiche est une indication de disponibilité, pas une preuve de service pour notre compte/région ou d'un SLA.

Avant activation : identifier le fournisseur effectif ; tester une requête image sur des données de test autorisées ; mesurer latence/erreurs ; vérifier multi-images, limites de taille, schéma de sortie, quotas et coût ; documenter conservation/région/sous-traitants ; configurer timeout, budget et circuit breaker.

Références : [fiche Qwen](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct), [documentation HF Inference Providers](https://huggingface.co/docs/inference-providers/index). Pas de confusion avec un endpoint dédié, dont la création et la facturation ne sont pas autorisées par ce dossier.
