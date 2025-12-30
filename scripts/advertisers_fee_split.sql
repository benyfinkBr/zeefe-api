-- Separate fee for room rentals and workshops
ALTER TABLE advertisers
  ADD COLUMN fee_pct_room DECIMAL(5,2) NULL DEFAULT NULL AFTER fee_pct,
  ADD COLUMN fee_pct_workshop DECIMAL(5,2) NULL DEFAULT NULL AFTER fee_pct_room;
