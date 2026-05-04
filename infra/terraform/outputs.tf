# ============================================
# Cạp Nông — Root Outputs
# ============================================

output "ec2_public_ip" {
  description = "Elastic IP of the EC2 Docker host"
  value       = module.ec2.elastic_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2.instance_id
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = module.rds.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.database_name
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "ecr_backend_url" {
  value = module.ecr.backend_repo_url
}

output "ecr_frontend_url" {
  value = module.ecr.frontend_repo_url
}

output "ecr_ai_service_url" {
  value = module.ecr.ai_service_repo_url
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i ~/.ssh/${var.ec2_key_name}.pem ec2-user@${module.ec2.elastic_ip}"
}

output "app_url" {
  description = "Application URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${module.ec2.elastic_ip}"
}
