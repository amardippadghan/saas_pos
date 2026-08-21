terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Note: It's best practice to store state in S3. 
  # We will use local state for now to validate, but for GitHub Actions, uncomment the backend block below
  # and create the S3 bucket and DynamoDB table first.
  # backend "s3" {
  #   bucket         = "saas-app-terraform-state-bucket-unique-name" # Change to a unique name
  #   key            = "global/s3/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-state-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}
