from models.module_document import ModuleDocument
from services.message_bus import MessageBus
from services.modules_manager import ModulesManager


class ScannerController:
    def __init__(self, message_bus: MessageBus, modules_manager: ModulesManager):
        self._message_bus = message_bus
        self._modules_manager = modules_manager

    async def list(self):
        documents = await ModuleDocument.find(ModuleDocument.type == "scanner").to_list()
        scanners = {}
        for document in documents:
            scanners[document.module_id] = {
                "name": document.name,
                "status": document.status,
                "sw_version": document.sw_version,
                "serial_number": document.serial_number,
                "tuner": document.tuner
            }
        return scanners

    async def rename(self, scanner_id, name):
        await self._modules_manager.rename_module(scanner_id, name)

    def scan(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "scan"
        })

    def next(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "next"
        })

    def prev(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "prev"
        })

    def set(self, scanner_id, value):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "set",
            "value": value
        })

    def stop(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "stop"
        })

    def skip(self, scanner_id):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "skip"
        })

    def clear_skip(self, scanner_id, value, all_values):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "clear_skip",
            "value": value,
            "all": all_values
        })

    def tune(self, scanner_id, value):
        self._message_bus.send({
            "scanner_id": scanner_id,
            "action": "tune",
            "value": value
        })