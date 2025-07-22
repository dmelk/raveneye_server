from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from models.log_document import LogDocument
from models.module_document import ModuleDocument
from models.profile_document import ProfileDocument

class MongoDb:
    def __init__(self, uri: str, db_name: str):
        self.uri = uri
        self.db_name = db_name

    async def start(self):
        self.client = AsyncIOMotorClient(self.uri)
        self.db = self.client[self.db_name]

        await init_beanie(database=self.db, document_models=self.get_document_models())
        # check if any profile exists, if not create a default one
        if await ProfileDocument.count() == 0:
            await ProfileDocument(name="Admin").insert()

    async def close(self):
        self.client.close()

    def get_document_models(self):
        return [
            ProfileDocument,
            ModuleDocument,
            LogDocument
        ]

