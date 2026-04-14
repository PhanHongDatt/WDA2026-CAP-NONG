# ============================================
# Cạp Nông — Terraform Remote State (S3)
# ============================================
# NOTE: Learner Lab does not support DynamoDB,
# so state locking is not available.
# Create the S3 bucket manually first:
#   aws s3 mb s3://capnong-terraform-state --region us-east-1
# ============================================

terraform {
  backend "s3" {
    bucket  = "capnong-terraform-state"
    key     = "prod/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
