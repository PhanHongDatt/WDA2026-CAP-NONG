#!/bin/bash
# Create .env for production on VPS
cat > /opt/capnong/.env << 'ENVEOF'
# ============================================
# Cạp Nông - Production Environment
# ============================================

# --- PostgreSQL (Supabase Cloud) ---
POSTGRES_DB=postgres
POSTGRES_USER=postgres.qpzhehhjzniegbcpzqqt
POSTGRES_PASSWORD=hsnXscjF8CKpkIT3
RDS_ENDPOINT=aws-1-ap-northeast-1.pooler.supabase.com
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# --- Redis ---
REDIS_PASSWORD=capnong123

# --- JWT ---
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# --- Supabase ---
SUPABASE_JWT_SECRET=3t5gUazokl1Sj0DoW4Zb410rIXopDNSpqd3GXXg9dOutmVPnzgtt4QhNqgqVLA8QeqLef5/6Si+eqPXBeWEDsQ==
NEXT_PUBLIC_SUPABASE_URL=https://qpzhehhjzniegbcpzqqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwemhlaGhqem5pZWdiY3B6cXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDcwMzEsImV4cCI6MjA4OTg4MzAzMX0.VN5g-mpy4M23yMJLnX3tXjvWtLnzfbw6E42e2z-0t8I

# --- Google Gemini AI ---
GEMINI_API_KEY=AIzaSyB2vdJlWiMsIdYGGLTeE8-qyRNUWdDEjdo

# --- xAI ---
XAI_API_KEY=your_xai_api_key_here

# --- Telegram ---
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=CapNongBot

# --- Frontend ---
DOMAIN_NAME=35.198.244.51
NEXT_PUBLIC_API_URL=http://35.198.244.51/api
NEXT_PUBLIC_APP_NAME=Cạp Nông
NEXT_PUBLIC_USE_MOCK_DATA=false

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=dpog3uuf1
CLOUDINARY_API_KEY=139665836482184
CLOUDINARY_API_SECRET=lVU2OKx8FpqfkOluZuUWZhQhjEo
ENVEOF

echo "✅ .env created at /opt/capnong/.env"
