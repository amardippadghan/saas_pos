# IAM Role for Amplify to access AWS resources (like fetching code from GitHub)
resource "aws_iam_role" "amplify_role" {
  name = "${local.project_name}-amplify-role-${local.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "amplify_admin_access" {
  role       = aws_iam_role.amplify_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

# Amplify App for Next.js Frontend
resource "aws_amplify_app" "frontend" {
  name       = "${local.project_name}-frontend-${local.environment}"
  repository = "https://github.com/${var.github_repository}"
  
  # OAuth token for GitHub access
  access_token = var.github_token_for_amplify

  iam_service_role_arn = aws_iam_role.amplify_role.arn

  # Auto branch creation
  enable_auto_branch_creation = true
  enable_branch_auto_build    = true

  # Build settings (amplify.yml configuration)
  build_spec = <<-EOT
    version: 1
    applications:
      - frontend:
          phases:
            preBuild:
              commands:
                - npm ci
            build:
              commands:
                - npm run build --filter=web
          artifacts:
            baseDirectory: apps/web/.next
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
        appRoot: apps/web
  EOT

  # Environment variables for the frontend
  environment_variables = {
    ENV                      = local.environment
    NEXT_PUBLIC_API_URL      = "https://api.yourdomain.com" # Update once API is deployed
    # AMPILFY_MONOREPO_APP_ROOT is useful for monorepos
    AMPLIFY_MONOREPO_APP_ROOT = "apps/web"
  }

  tags = local.common_tags
}

# Main Branch mapping
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "main"

  enable_auto_build = true
  
  framework = "Next.js - SSR" # Important for Next.js App Router
}
