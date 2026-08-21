output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "db_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.storage.id
}

output "amplify_app_id" {
  description = "The App ID of the Amplify App"
  value       = aws_amplify_app.frontend.id
}

output "amplify_default_domain" {
  description = "The default domain provided by Amplify"
  value       = aws_amplify_app.frontend.default_domain
}
