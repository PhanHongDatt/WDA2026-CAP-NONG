# ============================================
# Cạp Nông — EC2 Module
# Docker host with Elastic IP
# ============================================

# ─── AMI: Amazon Linux 2023 (latest) ────────

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ─── IAM Instance Profile (Learner Lab) ─────
# Learner Lab provides "LabInstanceProfile" by default.
# If using a regular AWS account, create a custom role.

data "aws_iam_instance_profile" "lab" {
  name = var.iam_instance_profile
}

# ─── EC2 Instance ───────────────────────────

resource "aws_instance" "docker_host" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = data.aws_iam_instance_profile.lab.name

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/userdata.sh", {
    project_name = var.project_name
  })

  tags = {
    Name = "${var.project_name}-docker-host"
  }
}

# ─── Elastic IP (fixed public IP) ───────────

resource "aws_eip" "docker_host" {
  instance = aws_instance.docker_host.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }
}
