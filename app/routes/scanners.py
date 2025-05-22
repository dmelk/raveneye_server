from fastapi import APIRouter
from service_container import service_container
from pydantic import BaseModel

class ClearSkipModel(BaseModel):
    value: int
    all_values: str

class TuneModel(BaseModel):
    value: int

class FrequencyModel(BaseModel):
    value: int

router = APIRouter()

@router.get("/scanners", tags=["Scanners"])
def list():
    return service_container.scanner_controller().list()

@router.post("/scanners/{scanner_id}/scan/{tuner_id}", tags=["Scanners"])
def scan(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().scan(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/next/{tuner_id}", tags=["Scanners"])
def next(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().next(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/prev/{tuner_id}", tags=["Scanners"])
def prev(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().prev(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/stop/{tuner_id}", tags=["Scanners"])
def stop(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().stop(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/skip/{tuner_id}", tags=["Scanners"])
def skip(scanner_id: str, tuner_id: int):
    service_container.scanner_controller().skip(scanner_id, tuner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/clear_skip/{tuner_id}", tags=["Scanners"])
def clear_skip(scanner_id: str, tuner_id: int, model: ClearSkipModel):
    service_container.scanner_controller().clear_skip(scanner_id, tuner_id, model.value, model.all_values)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/tune/{tuner_id}", tags=["Scanners"])
def tune(scanner_id: str, tuner_id: int, model: TuneModel):
    service_container.scanner_controller().tune(scanner_id, tuner_id, model.value)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/set_frequency/{tuner_id}", tags=["Scanners"])
def set_frequency(scanner_id: str, tuner_id: int, model: FrequencyModel):
    service_container.scanner_controller().set(scanner_id, tuner_id, model.value)
    return {"status": "OK"}