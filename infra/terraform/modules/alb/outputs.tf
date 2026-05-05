output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "acm_certificate_arn" {
  value = aws_acm_certificate.main.arn
}
