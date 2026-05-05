# ============================================
# Cạp Nông — Root Module
# Orchestrates: networking → ec2 → rds
# ============================================

# ─── Networking ──────────────────────────────

module "networking" {
  source = "./modules/networking"

  project_name         = var.project_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.10.0/24"] # Cần 2 public subnets cho ALB
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  ssh_allowed_cidr     = var.ssh_allowed_cidr
}

# ─── ECR Repositories ────────────────────────

module "ecr" {
  source       = "./modules/ecr"
  project_name = var.project_name
}

# ─── EC2 Docker Host ────────────────────────

module "ec2" {
  source = "./modules/ec2"

  project_name         = var.project_name
  instance_type        = var.ec2_instance_type
  key_name             = var.ec2_key_name
  volume_size          = var.ec2_volume_size
  subnet_id            = module.networking.public_subnet_id
  security_group_id    = module.networking.ec2_security_group_id
  iam_instance_profile = var.iam_instance_profile

  depends_on = [module.networking]
}

# ─── Application Load Balancer & SSL ────────

module "alb" {
  source                = "./modules/alb"
  project_name          = var.project_name
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
  instance_id           = module.ec2.instance_id
  domain_name           = "capnong.shop" # Tên miền của bạn

  depends_on = [module.ec2]
}

# ─── RDS PostgreSQL ─────────────────────────

module "rds" {
  source = "./modules/rds"

  project_name      = var.project_name
  instance_class    = var.db_instance_class
  storage_size      = var.db_storage_size
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  subnet_ids        = module.networking.private_subnet_ids
  security_group_id = module.networking.rds_security_group_id

  depends_on = [module.networking]
}
