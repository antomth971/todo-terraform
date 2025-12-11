# ============================================================
# S3 Bucket pour le frontend statique
# ============================================================

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.project_name}-frontend-${var.environment}-${random_string.bucket_suffix.result}"

  tags = merge(local.tags, {
    Name = "${local.project_name}-frontend"
  })
}

# Génère un suffixe aléatoire pour rendre le nom du bucket unique
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Bloquer l'accès public (CloudFront accédera via OAI)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Configuration du site web statique
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # SPA routing
  }
}

# Politique du bucket pour autoriser CloudFront
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# ============================================================
# CloudFront Distribution (CDN)
# ============================================================

# Origin Access Identity pour CloudFront
resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for ${local.project_name} frontend"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # Uniquement USA, Canada, Europe (moins cher)

  # Origine : le bucket S3
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  # Comportement par défaut
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    # Policy de cache optimisée
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # CachingOptimized (AWS managed)

    viewer_protocol_policy = "redirect-to-https"  # Force HTTPS
    compress               = true                  # Compression automatique
  }

  # Gestion des erreurs pour SPA
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # Restrictions géographiques (optionnel)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Certificat SSL (CloudFront par défaut)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(local.tags, {
    Name = "${local.project_name}-cdn"
  })
}

# ============================================================
# Upload des fichiers frontend (optionnel - pour automatiser)
# ============================================================

# Upload index.html
resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.frontend.id
  key          = "index.html"
  source       = "${path.module}/../frontend/index.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/../frontend/index.html")
}

# Upload app.js
resource "aws_s3_object" "app_js" {
  bucket       = aws_s3_bucket.frontend.id
  key          = "app.js"
  source       = "${path.module}/../frontend/app.js"
  content_type = "application/javascript"
  etag         = filemd5("${path.module}/../frontend/app.js")
}

# Upload style.css
resource "aws_s3_object" "style_css" {
  bucket       = aws_s3_bucket.frontend.id
  key          = "style.css"
  source       = "${path.module}/../frontend/style.css"
  content_type = "text/css"
  etag         = filemd5("${path.module}/../frontend/style.css")
}

# ============================================================
# Invalidation CloudFront automatique
# ============================================================

resource "null_resource" "cloudfront_invalidation" {
  # Se déclenche quand un fichier frontend change
  triggers = {
    index_html = aws_s3_object.index_html.etag
    app_js     = aws_s3_object.app_js.etag
    style_css  = aws_s3_object.style_css.etag
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws cloudfront create-invalidation \
        --distribution-id ${aws_cloudfront_distribution.frontend.id} \
        --paths "/*"
    EOT
  }

  depends_on = [
    aws_s3_object.index_html,
    aws_s3_object.app_js,
    aws_s3_object.style_css
  ]
}
