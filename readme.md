# 📝 Todo List - AWS Serverless avec Terraform

Application de todo list moderne déployée sur AWS avec une architecture 100% serverless.

## 🏗️ Architecture

```
Frontend (S3 + CloudFront)
    ↓
API Gateway
    ↓
Lambda Functions (Node.js)
    ↓
DynamoDB
```

## 🛠️ Technologies utilisées

- **Terraform** : Infrastructure as Code
- **AWS Lambda** : Fonctions serverless
- **API Gateway** : REST API
- **DynamoDB** : Base de données NoSQL
- **S3** : Stockage des fichiers statiques
- **CloudFront** : CDN pour la distribution globale

## 📋 Prérequis

1. **Terraform** installé (version >= 1.0)
   ```bash
   # Vérifier l'installation
   terraform --version
   ```

2. **AWS CLI** configuré avec tes credentials
   ```bash
   # Installer AWS CLI
   # https://aws.amazon.com/cli/

   # Configurer les credentials
   aws configure
   ```

3. **Compte AWS** avec les permissions nécessaires

## 🚀 Déploiement

### Étape 1 : Cloner/Préparer le projet

```bash
cd todo-app/terraform
```

### Étape 2 : Initialiser Terraform

```bash
terraform init
```

Cette commande télécharge les providers AWS nécessaires.

### Étape 3 : Planifier le déploiement

```bash
terraform plan
```

Terraform affiche ce qui va être créé. Vérifie qu'il n'y a pas d'erreurs.

### Étape 4 : Déployer l'infrastructure

```bash
terraform apply
```

Tape `yes` pour confirmer. Le déploiement prend environ 5-10 minutes.

### Étape 5 : Récupérer l'URL de l'API

Après le déploiement, Terraform affiche les outputs :

```bash
terraform output api_endpoint
```

Tu verras quelque chose comme :
```
https://abc123xyz.execute-api.eu-west-1.amazonaws.com/dev
```

### Étape 6 : Configurer le frontend

1. Copie l'URL de l'API depuis l'output
2. Ouvre `frontend/app.js`
3. Remplace la ligne :
   ```javascript
   const API_BASE_URL = 'https://YOUR_API_ID...';
   ```
   Par ton URL réelle

### Étape 7 : Re-déployer avec la bonne URL

```bash
terraform apply
```

Le frontend sera uploadé vers S3 avec la bonne configuration.

### Étape 8 : Accéder à l'application

Récupère l'URL CloudFront :

```bash
terraform output cloudfront_domain
```

Ouvre cette URL dans ton navigateur !

## 📊 Outputs disponibles

```bash
# URL de l'API Gateway
terraform output api_endpoint

# Nom de la table DynamoDB
terraform output dynamodb_table_name

# Nom du bucket S3
terraform output s3_bucket_name

# URL CloudFront
terraform output cloudfront_domain
```

## 🧪 Tester l'API manuellement

### GET tous les todos
```bash
curl https://YOUR_API_URL/dev/todos
```

### POST créer un todo
```bash
curl -X POST https://YOUR_API_URL/dev/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Mon premier todo"}'
```

### PUT mettre à jour un todo
```bash
curl -X PUT https://YOUR_API_URL/dev/todos/TODO_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### DELETE supprimer un todo
```bash
curl -X DELETE https://YOUR_API_URL/dev/todos/TODO_ID
```

## 🗑️ Détruire l'infrastructure

⚠️ **Attention** : Cette commande supprime TOUT (données incluses).

```bash
cd terraform
terraform destroy
```

Tape `yes` pour confirmer.

## 💰 Coûts

Avec le **AWS Free Tier**, cette application est **gratuite** pendant 12 mois :

- **Lambda** : 1M requêtes/mois gratuit
- **DynamoDB** : 25 GB stockage + 25 WCU/RCU gratuit
- **API Gateway** : 1M requêtes/mois gratuit
- **S3** : 5 GB stockage gratuit
- **CloudFront** : 50 GB transfert gratuit

Au-delà du free tier, les coûts sont très faibles (quelques centimes par jour).

## 🐛 Dépannage

### Erreur : "bucket already exists"

Les noms de buckets S3 sont globalement uniques. Le suffixe aléatoire devrait éviter ça, mais si ça arrive :

1. Change `random_string.bucket_suffix.length` dans `s3-cloudfront.tf`
2. Re-run `terraform apply`

### Erreur CORS dans le navigateur

Vérifie que les headers CORS sont bien configurés dans les Lambda et API Gateway.

### Lambda timeout

Si une fonction Lambda timeout (> 10s), augmente le `timeout` dans `lambda.tf`.

### Logs CloudWatch

Consulte les logs dans la console AWS :
- CloudWatch > Log Groups > `/aws/lambda/todo-app-*`

## 📚 Ressources

- [Documentation Terraform AWS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)

## 🎓 Prochaines étapes

Pour aller plus loin :

1. **Authentification** : Ajouter Cognito pour gérer les utilisateurs
2. **CI/CD** : Automatiser le déploiement avec GitHub Actions
3. **Monitoring** : Ajouter des alarmes CloudWatch
4. **Tests** : Écrire des tests unitaires pour les Lambda
5. **Multi-environnements** : Dev, staging, prod avec Terraform workspaces
6. **Custom domain** : Utiliser Route53 pour un nom de domaine personnalisé
7. **Optimisation** : Ajouter du caching avec ElastiCache

## 📝 Licence

Projet éducatif - Utilisation libre