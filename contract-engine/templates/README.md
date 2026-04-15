# PactAnchor DOCX Templates

이 폴더에 아래 템플릿 파일을 넣으면 `docxtpl` 방식으로 실제 병합됩니다.

## 파일명 규칙

- `asset_purchase_agreement.docx`
- `promissory_note.docx`
- `bill_of_sale.docx`
- `non_compete_agreement.docx`
- `equipment_list.docx`
- `closing_checklist.docx`

## 템플릿 안에서 쓸 수 있는 대표 변수 예시

### 공통
- `{{ business_name }}`
- `{{ state }}`
- `{{ deal_type }}`
- `{{ deal_id }}`
- `{{ generated_at }}`

### Seller / Buyer
- `{{ seller.name }}`
- `{{ seller.address }}`
- `{{ buyer.name }}`
- `{{ buyer.address }}`

### Purchase terms
- `{{ purchase_terms.purchase_price }}`
- `{{ purchase_terms.deposit_amount }}`
- `{{ purchase_terms.closing_date }}`

### Seller financing
- `{{ seller_financing.enabled }}`
- `{{ seller_financing.amount }}`

### Allocation
- `{{ allocation.inventory }}`
- `{{ allocation.furniture_fixtures_equipment }}`
- `{{ allocation.goodwill }}`

### Non-compete
- `{{ restrictive_covenants.non_compete_years }}`
- `{{ restrictive_covenants.non_compete_miles }}`

## 리스트 반복 예시

### Included assets
```jinja
{% for item in included_assets %}
- {{ item }}
{% endfor %}

### Equiment Item
{% for item in items %}
{{ item.line_no }}. {{ item.item_name }} / Qty: {{ item.quantity }} / {{ item.notes }}
{% endfor %}

### Closing checklist
{% for item in items %}
- {{ item.label }} {% if item.completed %}(Completed){% endif %}
{% endfor %}