from models.module_document import ModuleDocument

class ModulesManager:
    def __init__(self):
        # Cache to avoid multiple initializations of the same scanner
        self._moduleCache = {}

    async def setup_scanner(self, scanner_data):
        scanner_id = scanner_data['scanner_id']
        if scanner_id in self._moduleCache:
            return

        current_scanner = await ModuleDocument.find(
            ModuleDocument.type == "scanner",
            ModuleDocument.module_id == scanner_id
        ).first_or_none()
        if current_scanner is None:
            current_scanner = ModuleDocument(
                module_id=scanner_id,
                name=scanner_id,
                type="scanner",
                status='waiting',
                sw_version=scanner_data['sw_version'],
                serial_number='',
                tuner=scanner_data.get('tuner', {})
            )
            await current_scanner.insert()
        self._moduleCache[scanner_id] = True

    async def rename_module(self, module_id: str, name: str):
        module = await ModuleDocument.find(
            ModuleDocument.module_id == module_id
        ).first_or_none()
        if module is None:
            raise ValueError(f"Module with ID {module_id} not found.")
        if module.name != name:
            module.name = name
            await module.save()
