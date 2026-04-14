# ============================================
# Cạp Nông — Root Module
# Orchestrates: networking → ec2 → rds
# ============================================

# ─── Networking ──────────────────────────────

module "networking" {
  source = "./modules/networking"

  project_name         = var.project_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidr   = var.public_subnet_cidr
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  ssh_allowed_cidr     = var.ssh_allowed_cidr
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
