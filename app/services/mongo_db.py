import motor.motor_asyncio
from beanie import init_beanie

class MongoDb:
    def __init__(self, uri: str, db_name: str, user: str, password: str):
        self.uri = uri
        self.db_name = db_name
        self.client = motor.motor_asyncio.AsyncIOMotorClient(self.uri, username=user, password=password)
        self.database = self.client[self.db_name]

    async def close(self):
        self.client.close()
