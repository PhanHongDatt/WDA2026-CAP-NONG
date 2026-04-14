# ============================================
# Cạp Nông — Root Variables
# ============================================

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev/prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "capnong"
}

# ─── Networking ──────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (need 2 for RDS subnet group)"
  type        = list(string)
  default     = ["10.0.2.0/24", "10.0.3.0/24"]
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# ─── EC2 ─────────────────────────────────────

variable "ec2_instance_type" {
  description = "EC2 instance type for Docker host"
  type        = string
  default     = "t3.medium"
}

variable "ec2_key_name" {
  description = "Name of existing EC2 key pair for SSH access"
  type        = string
}

variable "ec2_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 30
}

# ─── RDS ─────────────────────────────────────

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "capnong_prod"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "capnong"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "db_storage_size" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

# ─── Domain ──────────────────────────────────

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

# ─── Security ────────────────────────────────

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into EC2. Restrict to your IP: \"1.2.3.4/32\""
  type        = string
  default     = "0.0.0.0/0"
}

# ─── IAM ─────────────────────────────────────

variable "iam_instance_profile" {
  description = "IAM instance profile name. Learner Lab provides \"LabInstanceProfile\" by default."
  type        = string
  default     = "LabInstanceProfile"
}
