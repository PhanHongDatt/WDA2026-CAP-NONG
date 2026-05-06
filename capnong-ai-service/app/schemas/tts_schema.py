from pydantic import BaseModel, Field
from typing import Optional

class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    speed: int = Field(default=0, ge=-3, le=3, description="Speed: -3 (slowest) to +3 (fastest), 0 = normal")
    voice: Optional[str] = Field(default=None, description="FPT.AI voice ID: banmai, lannhi, leminh, myan, thuminh, giahuy, linhsan. Auto-detected from location if omitted.")
    location: Optional[str] = Field(default=None, description="Farmer location for auto voice selection, e.g. 'Tiền Giang', 'Hà Nội'")
