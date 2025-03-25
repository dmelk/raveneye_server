from controllers.scanner_controller import ScannerController
from services.message_bus import MessageBus
from services.redis_db import RedisDb
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
        message_bus = MessageBus(broker, port, username, password)
        message_bus.start()
        self.add_service('message_bus', message_bus)

    def message_bus(self) -> MessageBus:
        return self.get_service('message_bus')

    def add_websocket_manager(self):
        websocket_manager = WebsocketManager()
        self.add_service('websocket_manager', websocket_manager)

    def websocket_manager(self) -> WebsocketManager:
        return self.get_service('websocket_manager')

    def add_scanner_controller(self):
        scanner_controller = ScannerController(self.message_bus())
        self.add_service('scanner_controller', scanner_controller)

    def scanner_controller(self) -> ScannerController:
        return self.get_service('scanner_controller')

    def add_redis_db(self, host, port):
        redis_db = RedisDb(host, port)
        self.add_service('redis_db', redis_db)

    def redis_db(self) -> RedisDb:
        return self.get_service('redis_db')

    def setup_services(self):
        # Redis DB Setup
        self.add_redis_db(os.getenv("REDIS_HOST"), int(os.getenv("REDIS_PORT")))

        # MQTT Client Setup
        self.add_message_bus(os.getenv("MQTT_BROKER"), int(os.getenv("MQTT_PORT")), os.getenv("MQTT_USER"),
                                          os.getenv("MQTT_PASSWORD"))
        self.message_bus().start()

        # Websocket Manager Setup
        self.add_websocket_manager()

        # Scanner controller setup
        self.add_scanner_controller()

service_container = ServiceContainer()

