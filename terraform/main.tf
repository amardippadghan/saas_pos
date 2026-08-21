# This file will be the entry point to call modules if we refactor,
# or simply contain random overarching configurations. 
# For now, we will separate resources by concern in network.tf, database.tf, etc.

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  project_name = "saas-app"
  environment  = var.environment
  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "Terraform"
  }
}
