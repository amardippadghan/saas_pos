variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

# Database Variables
variable "db_username" {
  description = "Username for the RDS database"
  type        = string
  sensitive   = true
  default     = "postgres"
}

variable "db_password" {
  description = "Password for the RDS database"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Name of the initial database"
  type        = string
  default     = "saas_app_db"
}

variable "db_instance_class" {
  description = "RDS Instance class"
  type        = string
  default     = "db.t3.micro"
}

# GitHub Repository for Amplify
variable "github_repository" {
  description = "The GitHub repository in format 'owner/repo' for Amplify connection"
  type        = string
  default     = "your-github-username/your-repo-name"
}

variable "github_token_for_amplify" {
  description = "GitHub Personal Access Token for Amplify to read the repository"
  type        = string
  sensitive   = true
}
