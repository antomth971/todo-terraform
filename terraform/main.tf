# Configuration du provider AWS
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables locales pour réutilisation
locals {
  project_name = "todo-app"
  tags = {
    Project     = "Todo App"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
