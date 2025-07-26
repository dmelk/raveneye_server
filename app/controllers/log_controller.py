import pymongo
from models.log_document import LogDocument

class LogController:
    async def list(
            self,
           module_id: str = None,
           from_timestamp: int = None,
           to_timestamp: int = None,
           skip: int = 0, limit:
            int = 100,
            order_direction: str = "desc"
    ):
        findArguments = {}
        if module_id:
            findArguments['module_id'] = module_id
        if from_timestamp:
            findArguments['timestamp'] = {'$gte': from_timestamp}
        if to_timestamp:
            findArguments['timestamp'] = {'$lte': to_timestamp}
        sort_order = pymongo.DESCENDING if order_direction == "desc" else pymongo.ASCENDING
        documents = await (LogDocument.find(findArguments)
                           .sort(("timestamp", sort_order))
                           .skip(skip)
                           .limit(limit)
                           .to_list()
                    )
        total_count = await LogDocument.find(findArguments).count()
        logs = []
        for document in documents:
            tuner = document.log_info.get("tuner") if document.log_info else None
            frequency = tuner.get("frequency") if tuner else None
            logs.append({
                "timestamp": document.timestamp.isoformat(),
                "action": document.action,
                "module_id": document.module_id,
                "frequency": frequency,
                "log_info": document.log_info
            })
        return {
            "logs": logs,
            "total": total_count
        }
