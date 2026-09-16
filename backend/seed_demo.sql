-- Dữ liệu mẫu để demo. Chạy trên DB local:
--   docker exec -i taphoa-db psql -U postgres -d taphoa < backend/seed_demo.sql
-- Xoá sạch dữ liệu mẫu (giữ tài khoản admin):
--   docker exec -i taphoa-db psql -U postgres -d taphoa -c "TRUNCATE invoice_items, invoices, product_batches, products, categories, suppliers, customers, shifts RESTART IDENTITY CASCADE;"

BEGIN;

INSERT INTO categories (name) VALUES
  ('Sữa & Đồ uống'), ('Bánh kẹo'), ('Gia vị'), ('Đồ khô'), ('Hoá mỹ phẩm');

INSERT INTO suppliers (name, phone, address, created_at) VALUES
  ('Vinamilk - NPP Hà Nội', '0912345678', 'Long Biên, Hà Nội', now()),
  ('Bánh kẹo Hải Hà',       '0987654321', 'Trương Định, Hà Nội', now()),
  ('Tạp hoá bán buôn Chợ Đồng Xuân', '0901122334', 'Hoàn Kiếm, Hà Nội', now());

INSERT INTO customers (name, phone, address, total_debt, created_at) VALUES
  ('Cô Lan (nhà số 12)', '0913111222', 'Ngõ 5 Vĩnh Tuy', 0, now()),
  ('Anh Hùng (quán ăn)', '0913333444', 'Phố Minh Khai',   0, now());

-- has_expiry = true cho hàng có hạn sử dụng (sữa, bánh kẹo, đồ khô)
INSERT INTO products (sku, barcode, name, category_id, sell_price, min_quantity, has_expiry, unit, is_active, created_at, updated_at) VALUES
  ('SP001', '8934673001015', 'Sữa tươi Vinamilk 180ml',        1, 8000,  20, true,  'hộp',  true, now(), now()),
  ('SP002', '8934673002012', 'Sữa chua Vinamilk có đường',     1, 6500,  24, true,  'hộp',  true, now(), now()),
  ('SP003', '8935001710011', 'Nước ngọt Coca-Cola 330ml',      1, 10000, 24, true,  'lon',  true, now(), now()),
  ('SP004', '8934563138165', 'Bánh Chocopie Orion hộp 12',     2, 52000, 5,  true,  'hộp',  true, now(), now()),
  ('SP005', '8934841114006', 'Kẹo dẻo Haribo 80g',             2, 25000, 10, true,  'gói',  true, now(), now()),
  ('SP006', '8936007950014', 'Bánh quy Cosy 132g',             2, 18000, 10, true,  'gói',  true, now(), now()),
  ('SP007', '8934804026817', 'Nước mắm Nam Ngư 500ml',         3, 32000, 8,  false, 'chai', true, now(), now()),
  ('SP008', '8935049500018', 'Dầu ăn Simply 1L',               3, 58000, 6,  false, 'chai', true, now(), now()),
  ('SP009', '8936011010012', 'Muối i-ốt 500g',                 3, 5000,  10, false, 'gói',  true, now(), now()),
  ('SP010', '8934868140016', 'Mì tôm Hảo Hảo',                 4, 4500,  50, true,  'gói',  true, now(), now()),
  ('SP011', '8936017310014', 'Gạo ST25 túi 5kg',               4, 185000,4,  false, 'túi',  true, now(), now()),
  ('SP012', '8935001200017', 'Nước rửa chén Sunlight 750ml',   5, 34000, 6,  false, 'chai', true, now(), now());

-- Lô hàng: cố ý rải hạn sử dụng để bật đủ 3 mốc cảnh báo 7 / 15 / 30 ngày
INSERT INTO product_batches (product_id, cost_price, quantity, expiry_date, received_at, created_at) VALUES
  (1, 6200,  18,  now() + interval '5 days',   now() - interval '20 days', now()),  -- sắp hết hạn (<7)
  (1, 6200,  40,  now() + interval '45 days',  now() - interval '3 days',  now()),
  (2, 5000,  12,  now() + interval '6 days',   now() - interval '15 days', now()),  -- sắp hết hạn (<7)
  (2, 5000,  30,  now() + interval '28 days',  now() - interval '2 days',  now()),
  (3, 7800,  60,  now() + interval '120 days', now() - interval '10 days', now()),
  (4, 42000, 8,   now() + interval '12 days',  now() - interval '30 days', now()),  -- cảnh báo mốc 15
  (5, 19000, 25,  now() + interval '25 days',  now() - interval '12 days', now()),  -- cảnh báo mốc 30
  (6, 14000, 3,   now() + interval '60 days',  now() - interval '8 days',  now()),  -- sắp hết kho (min 10)
  (7, 26000, 20,  NULL,                        now() - interval '25 days', now()),
  (8, 49000, 10,  NULL,                        now() - interval '18 days', now()),
  (9, 3500,  40,  NULL,                        now() - interval '40 days', now()),
  (10, 3600, 120, now() + interval '90 days',  now() - interval '6 days',  now()),
  (11, 158000,6,  NULL,                        now() - interval '9 days',  now()),
  (12, 28000, 4,  NULL,                        now() - interval '14 days', now());  -- sắp hết kho (min 6)

-- Ca làm việc: 6 ca đã đóng cho 6 ngày trước + 1 ca đang mở hôm nay
INSERT INTO shifts (user_id, cashier_name, opening_cash, closing_cash, expected_cash, difference, total_sales, total_invoices, opened_at, closed_at) VALUES
  (1, 'Admin', 500000, 1204000, 1204000, 0, 704000, 3, now() - interval '6 days', now() - interval '6 days' + interval '9 hours'),
  (1, 'Admin', 500000, 1046500, 1046500, 0, 546500, 3, now() - interval '5 days', now() - interval '5 days' + interval '9 hours'),
  (1, 'Admin', 500000, 1338000, 1338000, 0, 838000, 3, now() - interval '4 days', now() - interval '4 days' + interval '9 hours'),
  (1, 'Admin', 500000, 917000,  917000,  0, 417000, 2, now() - interval '3 days', now() - interval '3 days' + interval '9 hours'),
  (1, 'Admin', 500000, 1425500, 1425500, 0, 925500, 3, now() - interval '2 days', now() - interval '2 days' + interval '9 hours'),
  (1, 'Admin', 500000, 1121000, 1121000, 0, 621000, 3, now() - interval '1 days', now() - interval '1 days' + interval '9 hours'),
  (1, 'Admin', 500000, NULL,    NULL,    NULL, 0,   0, now() - interval '2 hours', NULL);

-- Hoá đơn rải đều 6 ngày để biểu đồ doanh thu có dáng
INSERT INTO invoices (user_id, shift_id, customer_id, total, discount_amount, final_total, cash_amount, transfer_amount, cash_given, change_amount, payment_method, status, created_at) VALUES
  (1, 1, NULL, 154000, 0,    154000, 154000, 0, 200000, 46000, 'cash',     'completed', now() - interval '6 days' + interval '2 hours'),
  (1, 1, 1,    286000, 6000, 280000, 280000, 0, 300000, 20000, 'cash',     'completed', now() - interval '6 days' + interval '5 hours'),
  (1, 1, NULL, 270000, 0,    270000, 0,      270000, 0, 0,     'transfer', 'completed', now() - interval '6 days' + interval '7 hours'),
  (1, 2, NULL, 96500,  0,    96500,  96500,  0, 100000, 3500,  'cash',     'completed', now() - interval '5 days' + interval '3 hours'),
  (1, 2, 2,    265000, 5000, 260000, 260000, 0, 300000, 40000, 'cash',     'completed', now() - interval '5 days' + interval '6 hours'),
  (1, 2, NULL, 190000, 0,    190000, 0,      190000, 0, 0,     'transfer', 'completed', now() - interval '5 days' + interval '8 hours'),
  (1, 3, NULL, 348000, 0,    348000, 348000, 0, 350000, 2000,  'cash',     'completed', now() - interval '4 days' + interval '2 hours'),
  (1, 3, 1,    305000, 5000, 300000, 300000, 0, 500000, 200000,'cash',     'completed', now() - interval '4 days' + interval '4 hours'),
  (1, 3, NULL, 190000, 0,    190000, 0,      190000, 0, 0,     'transfer', 'completed', now() - interval '4 days' + interval '7 hours'),
  (1, 4, NULL, 217000, 0,    217000, 217000, 0, 250000, 33000, 'cash',     'completed', now() - interval '3 days' + interval '3 hours'),
  (1, 4, NULL, 200000, 0,    200000, 200000, 0, 200000, 0,     'cash',     'completed', now() - interval '3 days' + interval '6 hours'),
  (1, 5, 2,    455500, 5500, 450000, 450000, 0, 500000, 50000, 'cash',     'completed', now() - interval '2 days' + interval '2 hours'),
  (1, 5, NULL, 285500, 0,    285500, 0,      285500, 0, 0,     'transfer', 'completed', now() - interval '2 days' + interval '5 hours'),
  (1, 5, NULL, 190000, 0,    190000, 190000, 0, 200000, 10000, 'cash',     'completed', now() - interval '2 days' + interval '8 hours'),
  (1, 6, NULL, 216000, 0,    216000, 216000, 0, 220000, 4000,  'cash',     'completed', now() - interval '1 days' + interval '3 hours'),
  (1, 6, 1,    220000, 0,    220000, 220000, 0, 250000, 30000, 'cash',     'completed', now() - interval '1 days' + interval '5 hours'),
  (1, 6, NULL, 185000, 0,    185000, 0,      185000, 0, 0,     'transfer', 'completed', now() - interval '1 days' + interval '7 hours');

-- Chi tiết hoá đơn: batch_id trỏ đúng lô, cost_price khớp giá vốn của lô để báo cáo lợi nhuận tính ra số thật
INSERT INTO invoice_items (invoice_id, product_id, batch_id, quantity, unit, price, cost_price) VALUES
  (1, 1, 1, 10, 'hộp', 8000, 6200), (1, 4, 6, 1, 'hộp', 52000, 42000), (1, 10, 12, 5, 'gói', 4500, 3600),
  (2, 11, 13, 1, 'túi', 185000, 158000), (2, 8, 10, 1, 'chai', 58000, 49000), (2, 7, 9, 1, 'chai', 32000, 26000), (2, 12, 14, 1, 'chai', 34000, 28000),
  (3, 3, 5, 12, 'lon', 10000, 7800), (3, 5, 7, 6, 'gói', 25000, 19000),
  (4, 2, 3, 6, 'hộp', 6500, 5000), (4, 10, 12, 10, 'gói', 4500, 3600), (4, 9, 11, 2, 'gói', 5000, 3500),
  (5, 11, 13, 1, 'túi', 185000, 158000), (5, 8, 10, 1, 'chai', 58000, 49000), (5, 6, 8, 1, 'gói', 18000, 14000), (5, 9, 11, 1, 'gói', 5000, 3500),
  (6, 4, 6, 2, 'hộp', 52000, 42000), (6, 5, 7, 2, 'gói', 25000, 19000), (6, 1, 2, 5, 'hộp', 8000, 6200),
  (7, 11, 13, 1, 'túi', 185000, 158000), (7, 3, 5, 10, 'lon', 10000, 7800), (7, 5, 7, 2, 'gói', 25000, 19000), (7, 9, 11, 2, 'gói', 5000, 3500),
  (8, 8, 10, 2, 'chai', 58000, 49000), (8, 7, 9, 3, 'chai', 32000, 26000), (8, 12, 14, 2, 'chai', 34000, 28000), (8, 9, 11, 5, 'gói', 5000, 3500),
  (9, 4, 6, 2, 'hộp', 52000, 42000), (9, 1, 2, 8, 'hộp', 8000, 6200), (9, 10, 12, 5, 'gói', 4500, 3600),
  (10, 3, 5, 12, 'lon', 10000, 7800), (10, 2, 4, 10, 'hộp', 6500, 5000), (10, 9, 11, 6, 'gói', 5000, 3500),
  (11, 11, 13, 1, 'túi', 185000, 158000), (11, 10, 12, 2, 'gói', 4500, 3600), (11, 9, 11, 1, 'gói', 5000, 3500),
  (12, 11, 13, 2, 'túi', 185000, 158000), (12, 8, 10, 1, 'chai', 58000, 49000), (12, 5, 7, 1, 'gói', 25000, 19000), (12, 10, 12, 3, 'gói', 4500, 3600),
  (13, 4, 6, 3, 'hộp', 52000, 42000), (13, 3, 5, 8, 'lon', 10000, 7800), (13, 1, 2, 6, 'hộp', 8000, 6200), (13, 9, 11, 1, 'gói', 5000, 3500),
  (14, 11, 13, 1, 'túi', 185000, 158000), (14, 9, 11, 1, 'gói', 5000, 3500),
  (15, 8, 10, 2, 'chai', 58000, 49000), (15, 7, 9, 2, 'chai', 32000, 26000), (15, 10, 12, 8, 'gói', 4500, 3600),
  (16, 4, 6, 2, 'hộp', 52000, 42000), (16, 5, 7, 3, 'gói', 25000, 19000), (16, 6, 8, 1, 'gói', 18000, 14000), (16, 9, 11, 4, 'gói', 5000, 3500),
  (17, 11, 13, 1, 'túi', 185000, 158000);

COMMIT;
