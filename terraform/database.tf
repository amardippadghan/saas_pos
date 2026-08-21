module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${local.project_name}-db-${local.environment}"

  engine               = "postgres"
  engine_version       = "15" # Check if your Prisma setup needs a specific version
  family               = "postgres15" # DB parameter group
  major_engine_version = "15"         # DB option group
  instance_class       = var.db_instance_class

  allocated_storage = 20
  storage_encrypted = false # Set true in production

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  manage_master_user_password = false

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  
  # Deploy in private subnets
  subnet_ids             = module.vpc.private_subnets
  create_db_subnet_group = true

  # Backup and maintenance
  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"

  # Disable backups in dev for cost saving (set to true in prod)
  skip_final_snapshot = true
  deletion_protection = false

  tags = local.common_tags
}
