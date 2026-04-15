from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from .document_generator import (
    build_document_bytes,
    build_package_zip_bytes,
    sanitize_filename,
)
from .schemas import (
    ErrorResponse,
    GenerateDocumentRequest,
    GeneratePackageRequest,
    HealthResponse,
)

app = FastAPI(
    title="PactAnchor Contract Engine",
    version="0.3.0",
    description="FastAPI document generation engine for PactAnchor."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="pactanchor-contract-engine",
        version="0.3.0",
    )


@app.post(
    "/generate-document",
    responses={500: {"model": ErrorResponse}},
)
def generate_document(request: GenerateDocumentRequest) -> Response:
    payload = request.payload
    file_bytes, media_type, filename = build_document_bytes(
        payload,
        request.outputFormat,
    )

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }

    return Response(
        content=file_bytes,
        media_type=media_type,
        headers=headers,
    )


@app.post(
    "/generate-package",
    responses={500: {"model": ErrorResponse}},
)
def generate_package(request: GeneratePackageRequest) -> Response:
    zip_bytes = build_package_zip_bytes(
        request.payloads,
        request.outputFormat,
    )

    suffix = request.outputFormat
    filename = sanitize_filename(request.packageName)
    if not filename.lower().endswith(".zip"):
        filename = f"{filename}-{suffix}.zip"

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers=headers,
    )