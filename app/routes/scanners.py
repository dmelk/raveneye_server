from fastapi import APIRouter
from service_container import service_container
from pydantic import BaseModel

class ClearSkipModel(BaseModel):
    value: int
    all_values: str

class TuneModel(BaseModel):
    value: int

router = APIRouter()

@router.post("/scan/{scanner_id}/{tuner_id}")
def scan(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().scan(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/next/{scanner_id}/{tuner_id}")
def next(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().next(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/prev/{scanner_id}/{tuner_id}")
def prev(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().prev(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/stop/{scanner_id}/{tuner_id}")
def stop(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().stop(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/skip/{scanner_id}/{tuner_id}")
def skip(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().skip(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/clear_skip/{scanner_id}/{tuner_id}")
def clear_skip(scanner_id: str, tuner_id: int, model: ClearSkipModel):
    service_container.scanner_controller().clear_skip(scanner_id, tuner_id, model.value, model.all_values)
    return {"status": "OK"}

@router.post("/tune/{scanner_id}/{tuner_id}")
def tune(scanner_id: str, tuner_id: int, model: TuneModel):
    service_container.scanner_controller().tune(scanner_id, tuner_id, model.value)
    return {"status": "OK"}