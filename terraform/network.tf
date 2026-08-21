module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.project_name}-vpc-${local.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  # Enable NAT Gateways for private subnets to reach the internet (e.g. for updates)
  enable_nat_gateway = true
  single_nat_gateway = true # Save costs in dev, use false in prod

  tags = local.common_tags
}

# Security group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "${local.project_name}-rds-sg-${local.environment}"
  description = "Allow inbound traffic for RDS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "PostgreSQL access from within VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

# Security group for App Runner VPC Connector
resource "aws_security_group" "apprunner_sg" {
  name        = "${local.project_name}-apprunner-sg-${local.environment}"
  description = "Security group for App Runner VPC connector"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}
