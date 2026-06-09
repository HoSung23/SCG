insert into users (id, name, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'Admin SCG', 'admin@scg.gt', 'superadmin'),
  ('22222222-2222-2222-2222-222222222222', 'Gerente Operaciones', 'gerente@scg.gt', 'gerente'),
  ('33333333-3333-3333-3333-333333333333', 'Contador SCG', 'contador@scg.gt', 'contador'),
  ('44444444-4444-4444-4444-444444444444', 'Piloto Demo', 'piloto@scg.gt', 'piloto');

insert into trucks (plate, brand, model, year, capacity_tons, fuel_efficiency, mileage, current_driver_id) values
  ('C-001BCD', 'Freightliner', 'Cascadia', 2022, 32.0, 8.5, 120000, '44444444-4444-4444-4444-444444444444'),
  ('C-002BCD', 'Kenworth', 'T680', 2021, 30.0, 7.9, 98000, null),
  ('C-003BCD', 'International', 'LT', 2023, 34.0, 8.1, 45000, null);

insert into drivers (id, license_number, license_expiry, license_type, truck_id) values
  ('44444444-4444-4444-4444-444444444444', 'D-123456', '2027-12-31', 'D', (select id from trucks where plate = 'C-001BCD'));

insert into fuel_prices (station, fuel_type, price_per_gallon, price_date, source_url, is_active) values
  ('Shell', 'diesel', 36.9000, current_date, 'https://mem.gob.gt/combustibles/', true),
  ('UNO', 'diesel', 37.4000, current_date, 'https://mem.gob.gt/combustibles/', true),
  ('Puma', 'diesel', 36.7000, current_date, 'https://mem.gob.gt/combustibles/', true);
