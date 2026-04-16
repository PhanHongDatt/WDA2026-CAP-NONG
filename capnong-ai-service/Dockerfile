# ============================================
# Cạp Nông - AI Service Production Dockerfile
# FastAPI + Python 3.11
# ============================================

FROM python:3.11-slim

WORKDIR /app

RUN addgroup --system capnong && adduser --system --ingroup capnong capnong

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chown -R capnong:capnong /app

USER capnong
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]