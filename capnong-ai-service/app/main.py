import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import voice, voice_chat, tts, refiner, caption, poster

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.getLogger(__name__).info("🌱 Cạp Nông AI Service starting...")
    yield
    logging.getLogger(__name__).info("🌱 Cạp Nông AI Service shutting down...")


app = FastAPI(
    title="Cạp Nông AI Service",
    description="AI microservice cho Voice-to-Product, AI Refiner, Caption Generator và Poster Generator",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký routers
app.include_router(voice.router)
app.include_router(voice_chat.router)
app.include_router(tts.router)
app.include_router(refiner.router)
app.include_router(caption.router)
app.include_router(poster.router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "cap-nong-ai"}