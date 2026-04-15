# ============================================
# Cạp Nông — RDS Module Outputs
# ============================================

output "endpoint" {
  description = "RDS endpoint (hostname only, no port)"
  value       = aws_db_instance.postgres.address
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.postgres.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgres.db_name
}

output "connection_string" {
  description = "JDBC connection string for Spring Boot"
  value       = "jdbc:postgresql://${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${aws_db_instance.postgres.db_name}"
  sensitive   = true
}
