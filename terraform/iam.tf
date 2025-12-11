# Rôle IAM pour les fonctions Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${local.project_name}-lambda-role-${var.environment}"

  # Politique de confiance : qui peut assumer ce rôle
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

# Politique pour écrire dans CloudWatch Logs (logs des Lambda)
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Politique personnalisée pour accéder à DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${local.project_name}-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",      # Lire un item
          "dynamodb:PutItem",      # Créer/Mettre à jour un item
          "dynamodb:UpdateItem",   # Mettre à jour un item
          "dynamodb:DeleteItem",   # Supprimer un item
          "dynamodb:Query",        # Requête avec index
          "dynamodb:Scan"          # Scanner toute la table
        ]
        Resource = [
          aws_dynamodb_table.todos.arn,
          "${aws_dynamodb_table.todos.arn}/index/*"  # Pour les index secondaires
        ]
      }
    ]
  })
}
