-- Tüm faturaların ödeme durumunu düzelt
-- Bu scripti Supabase SQL Editor'da çalıştır

-- Önce tüm faturaların paid_amount değerini ödemelerden hesapla
UPDATE invoices i
SET 
    paid_amount = COALESCE(
        (SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id),
        0
    ),
    status = CASE
        WHEN COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id), 0) >= i.amount THEN 'paid'
        WHEN COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id), 0) > 0 THEN 'partial'
        ELSE 'unpaid'
    END,
    updated_at = NOW()
WHERE status != 'cancelled';

-- Sonucu kontrol et
SELECT 
    invoice_no,
    amount,
    paid_amount,
    amount - paid_amount AS remaining,
    status,
    due_date
FROM invoices
WHERE status != 'cancelled'
ORDER BY created_at DESC;
