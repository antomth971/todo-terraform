# Région AWS où déployer l'infrastructure
variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-west-1"  # Paris - change selon ta préférence
}

# Environnement (dev, staging, prod)
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# Nom de la table DynamoDB
variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
  default     = "todos"
}
