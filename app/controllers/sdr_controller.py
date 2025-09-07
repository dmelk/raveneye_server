from models.module_document import ModuleDocument
from services.message_bus import MessageBus
from services.modules_manager import ModulesManager

class SdrController:
    def __init__(self, message_bus: MessageBus, modules_manager: ModulesManager):
        self._message_bus = message_bus
        self._modules_manager = modules_manager
        self._topic = 'sdr_in'

    async def list(self):
        documents = await ModuleDocument.find(ModuleDocument.type == "sdr").to_list()
        scanners = {}
        for document in documents:
            scanners[document.module_id] = {
                "name": document.name,
                "status": document.status,
                "sw_version": document.sw_version,
                "serial_number": document.serial_number,
                "sdr": document.sdr
            }
        return scanners

    async def rename(self, sdr_id, name):
        await self._modules_manager.rename_module(sdr_id, name)

    def start(self, sdr_id):
        self._send_message({
            "action": "start"
        }, sdr_id)

    def stop(self, sdr_id):
        self._send_message({
            "action": "stop"
        }, sdr_id)

    def add_interval(self, sdr_id, start, end):
        self._send_message({
            "action": "add_interval",
            "from": start,
            "to": end
        }, sdr_id)

    def change_interval(self, sdr_id, interval_id, start, end):
        self._send_message({
            "action": "change_interval",
            "interval_id": interval_id,
            "from": start,
            "to": end
        }, sdr_id)

    def remove_interval(self, sdr_id, interval_id):
        self._send_message({
            "action": "remove_interval",
            "interval_id": interval_id,
        }, sdr_id)

    def clear_intervals(self, sdr_id):
        self._send_message({
            "action": "clear_intervals"
        }, sdr_id)

    def configure(self, sdr_id, lna, vga, amp):
        self._send_message({
            "action": "configure",
            "lna": lna,
            "vga": vga,
            "amp": amp
        }, sdr_id)

    def _send_message(self, payload, sdr_id):
        self._message_bus.send(payload, f"sdr_in/{sdr_id}")
