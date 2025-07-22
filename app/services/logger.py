from models.log_document import LogDocument


class Logger:
    def __init__(self):
        self.logable_actions = ['signal_found', 'signal_lost', 'next', 'prev', 'manual_change']

    async def scanner_log(self, message):
        action = message['action']

        if action not in self.logable_actions:
            return

        scanner_id = message['scanner_id']
        await LogDocument(
            module_id=scanner_id,
            action=action,
            log_info=message
        ).insert()
