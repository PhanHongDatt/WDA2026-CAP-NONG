# ============================================
# Cạp Nông — RDS Module Variables
# ============================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
}

variable "storage_size" {
  description = "Allocated storage in GB"
  type        = number
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Master username"
  type        = string
}

variable "db_password" {
  description = "Master password"
  type        = string
  sensitive   = true
}

variable "subnet_ids" {
  description = "Subnet IDs for DB subnet group"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID"
  type        = string
}
