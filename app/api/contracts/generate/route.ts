import { NextResponse } from "next/server";
import {
  buildGeneratedDocuments,
  buildSingleGeneratedDocument,
} from "@/lib/contracts/build-documents";

type GenerateRequestBody = {
  dealId: string;
  sellerFinancingEnabled: boolean;
  targetDocumentName?: string;
  fileType?: "pdf" | "docx";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;

    if (!body?.dealId) {
      return NextResponse.json(
        { error: "dealId is required" },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (body.targetDocumentName && body.fileType) {
      return NextResponse.json({
        success: true,
        document: buildSingleGeneratedDocument(
          body.targetDocumentName,
          body.fileType
        ),
        generatedAt: new Date().toISOString(),
      });
    }

    const documents = buildGeneratedDocuments(body.sellerFinancingEnabled);

    return NextResponse.json({
      success: true,
      documents,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate contract package." },
      { status: 500 }
    );
  }
}