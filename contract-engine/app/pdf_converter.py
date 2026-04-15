from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path


class PdfConversionError(Exception):
    pass


def convert_docx_bytes_to_pdf_bytes(docx_bytes: bytes, filename_stem: str) -> bytes:
    soffice_path = _find_soffice()

    if not soffice_path:
        raise PdfConversionError(
            "LibreOffice (soffice) was not found. Install LibreOffice and ensure soffice is available on PATH."
        )

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        docx_path = tmp_path / f"{filename_stem}.docx"
        pdf_path = tmp_path / f"{filename_stem}.pdf"

        docx_path.write_bytes(docx_bytes)

        command = [
            str(soffice_path),
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            str(tmp_path),
            str(docx_path),
        ]

        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False,
        )

        if result.returncode != 0:
            raise PdfConversionError(
                f"LibreOffice conversion failed. stdout={result.stdout} stderr={result.stderr}"
            )

        if not pdf_path.exists():
            raise PdfConversionError("PDF file was not created by LibreOffice.")

        return pdf_path.read_bytes()


def _find_soffice() -> str | None:
    candidates = [
        shutil.which("soffice"),
        shutil.which("soffice.exe"),
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    ]

    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return candidate

    return None