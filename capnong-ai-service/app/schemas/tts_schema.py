from pydantic import BaseModel, Field

class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    speaker_id: int = Field(default=3, description="1: South women 1, 2: Northern women 1, 3: South men, 4: Northern men")
    speed: float = Field(default=1.0)
