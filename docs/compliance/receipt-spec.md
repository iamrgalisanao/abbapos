# Receipt Specification

## Sections
1. Header (Store Info, Terminal ID, TIN)
2. Item Lines (Qty, Description, Price, Amount)
3. Subtotal
4. Discounts
5. Taxes (VATable, VAT-Exempt, VAT)
6. Service Charge
7. Total Amount Due
8. Payment Summary
9. Footer (BIR Accreditation Details, Receipt #, Timestamp)

## Rules
- Receipt numbering must be sequential and gapless per terminal.
- Reprints must clearly state "REPRINT" at the top.
- Voided transactions must not produce a "Final" receipt.
