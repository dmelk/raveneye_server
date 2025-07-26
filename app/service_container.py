import asyncio
from controllers.scanner_controller import ScannerController
from controllers.log_controller import LogController
from services.logger import Logger
from services.message_bus import MessageBus
from services.modules_manager import ModulesManager
from services.mongo_db import MongoDb
from services.websocket_manager import WebsocketManager
import os

class ServiceContainer:
    def __init__(self):
        self.services = {}

    def add_service(self, name, service):
        self.services[name] = service

    def get_service(self, name):
        return self.services[name]

    def add_message_bus(self, broker, port, username, password):
        message_bus = MessageBus(
            broker,
            port,
            username,
            password,
            self.websocket_manager(),
            self.modules_manager(),
            self.logger(),
            asyncio.get_running_loop()
        )
        message_bus.start()
        self.add_service('message_bus', message_bus)

    def message_bus(self) -> MessageBus:
        return self.get_service('message_bus')

    def add_websocket_manager(self):
        websocket_manager = WebsocketManager()
        self.add_service('websocket_manager', websocket_manager)

    def websocket_manager(self) -> WebsocketManager:
        return self.get_service('websocket_manager')

    def add_controllers(self):
        scanner_controller = ScannerController(self.message_bus(), self.modules_manager())
        self.add_service('scanner_controller', scanner_controller)
        log_controller = LogController()
        self.add_service('log_controller', log_controller)

    def scanner_controller(self) -> ScannerController:
        return self.get_service('scanner_controller')

    def log_controller(self) -> LogController:
        return self.get_service('log_controller')

    async def add_mongo_db(self, uri: str, db_name: str):
        mongo_db = MongoDb(uri, db_name)
        await mongo_db.start()
        self.add_service('mongo_db', mongo_db)

    def mongo_db(self) -> MongoDb:
        return self.get_service('mongo_db')

    def add_modules_manager(self):
        modules_manager = ModulesManager()
        self.add_service('modules_manager', modules_manager)

    def modules_manager(self) -> ModulesManager:
        return self.get_service('modules_manager')

    def add_logger(self):
        logger = Logger()
        self.add_service('logger', logger)

    def logger(self) -> Logger:
        return self.get_service('logger')

    async def setup_services(self):
        # init mongo db
        await self.add_mongo_db(os.getenv("MONGODB_URI"), os.getenv("MONGODB_NAME"))

        # Modules Manager Setup
        self.add_modules_manager()

        # Logger Setup
        self.add_logger()

        # Websocket Manager Setup
        self.add_websocket_manager()

        # MQTT Client Setup
        self.add_message_bus(os.getenv("MQTT_BROKER"), int(os.getenv("MQTT_PORT")), os.getenv("MQTT_USER"),
                                          os.getenv("MQTT_PASSWORD"))
        self.message_bus().start()

        # Controllers setup
        self.add_controllers()

    async def close_services(self):
        # Close MongoDB connection
        await self.mongo_db().close()

service_container = ServiceContainer()

