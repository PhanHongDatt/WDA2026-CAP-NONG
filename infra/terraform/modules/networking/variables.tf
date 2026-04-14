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

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
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
