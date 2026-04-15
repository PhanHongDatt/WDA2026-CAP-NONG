# ============================================
# Cạp Nông — EC2 Module Variables
# ============================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_name" {
  description = "Name of EC2 key pair"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID to launch instance in"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for the instance"
  type        = string
}

variable "volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
}

variable "iam_instance_profile" {
  description = "IAM instance profile name (LabInstanceProfile for Learner Lab)"
  type        = string
  default     = "LabInstanceProfile"
}
