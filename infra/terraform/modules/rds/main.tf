# ============================================
# Cạp Nông — RDS Module
# PostgreSQL 16 (Free Tier compatible)
# ============================================

# ─── DB Subnet Group ────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# ─── RDS PostgreSQL Instance ────────────────

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-postgres"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.instance_class

  # Storage
  # NOTE: max_allocated_storage (autoscaling) and encryption not supported in Learner Lab
  allocated_storage = var.storage_size
  storage_type      = "gp2"
  storage_encrypted = false

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]
  publicly_accessible    = false

  # Backup
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Settings
  multi_az                = false # Free Tier
  skip_final_snapshot     = true
  deletion_protection     = false
  apply_immediately       = true

  # Performance Insights: not available on db.t3.micro in Learner Lab
  performance_insights_enabled = false

  tags = {
    Name = "${var.project_name}-postgres"
  }
}
