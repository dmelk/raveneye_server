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

@router.post("/scanners/{scanner_id}/scan", tags=["Scanners"])
def scan(scanner_id: str):
    service_container.scanner_controller().scan(scanner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/next", tags=["Scanners"])
def next(scanner_id: str):
    service_container.scanner_controller().next(scanner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/prev", tags=["Scanners"])
def prev(scanner_id: str):
    service_container.scanner_controller().prev(scanner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/stop", tags=["Scanners"])
def stop(scanner_id: str):
    service_container.scanner_controller().stop(scanner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/skip", tags=["Scanners"])
def skip(scanner_id: str):
    service_container.scanner_controller().skip(scanner_id)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/clear_skip", tags=["Scanners"])
def clear_skip(scanner_id: str, model: ClearSkipModel):
    service_container.scanner_controller().clear_skip(scanner_id, model.value, model.all_values)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/tune", tags=["Scanners"])
def tune(scanner_id: str, model: TuneModel):
    service_container.scanner_controller().tune(scanner_id, model.value)
    return {"status": "OK"}

@router.post("/scanners/{scanner_id}/set_frequency", tags=["Scanners"])
def set_frequency(scanner_id: str, model: FrequencyModel):
    service_container.scanner_controller().set(scanner_id, model.value)
    return {"status": "OK"}