from beanie import Document


class ProfileDocument(Document):
    name: str

    class Settings:
        name = "profiles"  # MongoDB collection name