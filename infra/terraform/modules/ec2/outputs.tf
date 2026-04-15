# ============================================
# Cạp Nông — EC2 Module Outputs
# ============================================

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.docker_host.id
}

output "elastic_ip" {
  description = "Elastic IP address"
  value       = aws_eip.docker_host.public_ip
}

output "private_ip" {
  description = "Private IP address"
  value       = aws_instance.docker_host.private_ip
}
