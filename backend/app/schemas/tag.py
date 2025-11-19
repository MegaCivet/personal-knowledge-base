from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", mode="before")
    def _id_to_str(cls, v):
        return str(v) if v is not None else v