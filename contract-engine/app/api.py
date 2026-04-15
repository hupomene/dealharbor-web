from __future__ import annotations

import base64
import traceback
from typing import List, Literal

from fastapi import FastAPI
from pydantic import BaseModel

from .document_generator import build_document_bytes, build_package_zip_bytes
from .template_requirements import validate_payloads

app = FastAPI()

OutputFormat = Literal["docx", "pdf", "zip"]


class DocumentPayload(BaseModel):
    templateKey: str
    documentName: str
    outputFilename: str
    generatedAt: str
    dealId: str
    businessName: str
    data: dict


class GenerateRequest(BaseModel):
    payloads: List[DocumentPayload]
    output_format: OutputFormat = "docx"


@app.get("/health")
def health_check():
    return {"ok": True}


@app.post("/generate")
def generate_documents(req: GenerateRequest):
    try:
        validation_errors = validate_payloads(req.payloads)
        if validation_errors:
            return {
                "error": "Template validation failed.",
                "validation_errors": validation_errors,
            }

        if req.output_format == "zip":
            zip_bytes = build_package_zip_bytes(
                req.payloads,
                output_formats=("docx", "pdf"),
            )
            return {
                "files": [
                    {
                        "file_name": "contract_package.zip",
                        "file_type": "zip",
                        "content_base64": base64.b64encode(zip_bytes).decode("utf-8"),
                    }
                ]
            }

        results = []

        for payload in req.payloads:
            file_bytes, _media_type, filename = build_document_bytes(
                payload,
                req.output_format,
            )

            results.append(
                {
                    "file_name": filename,
                    "file_type": req.output_format,
                    "content_base64": base64.b64encode(file_bytes).decode("utf-8"),
                }
            )

        return {"files": results}
    except Exception as exc:
        traceback.print_exc()
        return {
            "error": f"Document generation failed: {str(exc)}",
            "detail": traceback.format_exc(),
        }