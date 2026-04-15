from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel


OutputFormat = Literal["docx", "pdf"]


class DocumentPreviewPayload(BaseModel):
    templateKey: str
    documentName: str
    outputFilename: str
    generatedAt: str
    dealId: str
    businessName: str
    data: Dict[str, Any]


class GenerateDocumentRequest(BaseModel):
    payload: DocumentPreviewPayload
    outputFormat: OutputFormat = "docx"


class GeneratePackageRequest(BaseModel):
    packageName: str
    payloads: List[DocumentPreviewPayload]
    outputFormat: OutputFormat = "docx"


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    version: str


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None