# App Runner needs a VPC connector to talk to resources in the VPC (like RDS)
resource "aws_apprunner_vpc_connector" "connector" {
  vpc_connector_name = "${local.project_name}-vpc-connector-${local.environment}"
  subnets            = module.vpc.private_subnets
  security_groups    = [aws_security_group.apprunner_sg.id]
}

# Role for App Runner to pull images or access other AWS resources
resource "aws_iam_role" "apprunner_instance_role" {
  name = "${local.project_name}-apprunner-role-${local.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

# (Optional Placeholder) You would typically use a Docker image from ECR
# We are assuming you will build and push the Docker image to ECR in GitHub actions, 
# and then App Runner will deploy it. 
# Alternatively, App Runner can build from source, but it's less reliable for monorepos.

# resource "aws_apprunner_service" "api" {
#   service_name = "${local.project_name}-api-${local.environment}"

#   source_configuration {
#     authentication_configuration {
#       access_role_arn = aws_iam_role.apprunner_instance_role.arn
#     }
#     image_repository {
#       image_configuration {
#         port = "3000"
#         runtime_environment_variables = {
#           DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${module.db.db_instance_endpoint}/${var.db_name}"
#         }
#       }
#       image_identifier      = "public.ecr.aws/aws-containers/hello-app-runner:latest" # Placeholder
#       image_repository_type = "ECR_PUBLIC" # Usually ECR for private repos
#     }
#   }

#   network_configuration {
#     egress_configuration {
#       egress_type       = "VPC"
#       vpc_connector_arn = aws_apprunner_vpc_connector.connector.arn
#     }
#   }

#   tags = local.common_tags
# }
