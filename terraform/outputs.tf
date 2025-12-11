# Outputs - informations affichées après le déploiement

output "api_endpoint" {
  description = "URL de l'API Gateway"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "dynamodb_table_name" {
  description = "Nom de la table DynamoDB"
  value       = aws_dynamodb_table.todos.name
}

output "s3_bucket_name" {
  description = "Nom du bucket S3 pour le frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_domain" {
  description = "URL CloudFront pour accéder au site"
  value       = aws_cloudfront_distribution.frontend.domain_name
}
