export type DealRecord = {
  id: string;
  user_id: string;
  business_name: string | null;
  purchase_price: number | null;
  down_payment: number | null;
  seller_financing: boolean | null;
  created_at: string | null;

  seller_name?: string | null;
  seller_address?: string | null;
  buyer_name?: string | null;
  buyer_address?: string | null;
  agreement_date?: string | null;
  closing_date?: string | null;

  included_assets_text?: string | null;
  excluded_assets_text?: string | null;
  deposit_amount?: number | null;
  cash_at_closing?: number | null;
  seller_financing_amount?: number | null;
  seller_financing_clause?: string | null;
  allocated_inventory?: number | null;
  allocated_ffe?: number | null;
  allocated_goodwill?: number | null;
  allocation_total?: number | null;
  state?: string | null;
  non_compete_years?: number | null;
  non_compete_miles?: number | null;

  equipment_items_text?: string | null;
  closing_checklist_text?: string | null;
};

export type CreateDealInput = {
  business_name?: string | null;
  purchase_price?: number | null;
  down_payment?: number | null;
  seller_financing?: boolean | null;

  seller_name?: string | null;
  seller_address?: string | null;
  buyer_name?: string | null;
  buyer_address?: string | null;
  agreement_date?: string | null;
  closing_date?: string | null;

  included_assets_text?: string | null;
  excluded_assets_text?: string | null;
  deposit_amount?: number | null;
  cash_at_closing?: number | null;
  seller_financing_amount?: number | null;
  seller_financing_clause?: string | null;
  allocated_inventory?: number | null;
  allocated_ffe?: number | null;
  allocated_goodwill?: number | null;
  allocation_total?: number | null;
  state?: string | null;
  non_compete_years?: number | null;
  non_compete_miles?: number | null;

  equipment_items_text?: string | null;
  closing_checklist_text?: string | null;
};

export type UpdateDealInput = Partial<CreateDealInput>;

export type DocumentRecord = {
  id: string;
  deal_id: string;
  user_id: string;
  batch_id?: string | null;
  file_name: string;
  file_type: "docx" | "pdf" | "zip";
  document_type?: string | null;
  file_url: string;
  created_at: string | null;
};

export type CreateDocumentInput = {
  deal_id: string;
  user_id: string;
  batch_id?: string | null;
  file_name: string;
  file_type: "docx" | "pdf" | "zip";
  document_type?: string | null;
  file_url: string;
};