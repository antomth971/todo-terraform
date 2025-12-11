# Table DynamoDB pour stocker les todos
resource "aws_dynamodb_table" "todos" {
  name           = "${local.project_name}-${var.dynamodb_table_name}-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand, pas de capacity planning
  hash_key       = "id"               # Clé primaire
  
  # Définition de la clé primaire
  attribute {
    name = "id"
    type = "S"  # S = String
  }
  
  # Attribut pour trier par date de création
  attribute {
    name = "createdAt"
    type = "N"  # N = Number (timestamp)
  }
  
  # Index secondaire pour récupérer les todos triés par date
  global_secondary_index {
    name            = "CreatedAtIndex"
    hash_key        = "userId"  # Pour filtrer par utilisateur plus tard
    range_key       = "createdAt"
    projection_type = "ALL"     # Inclure tous les attributs dans l'index
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  # Protection contre la suppression accidentelle
  deletion_protection_enabled = false  # Mettre à true en production
  
  # TTL pour auto-suppression (optionnel)
  ttl {
    attribute_name = "ttl"
    enabled        = false
  }
  
  # Point-in-time recovery (sauvegarde continue)
  point_in_time_recovery {
    enabled = false  # Mettre à true en production
  }
  
  tags = merge(local.tags, {
    Name = "${local.project_name}-todos-${var.environment}"
  })
}
