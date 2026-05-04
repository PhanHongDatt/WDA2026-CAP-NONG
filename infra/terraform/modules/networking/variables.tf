# ============================================
# Cạp Nông — Networking Module Variables
# ============================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (need 2 for ALB)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.10.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into EC2 (restrict to your IP in production)"
  type        = string
  default     = "0.0.0.0/0"
}
