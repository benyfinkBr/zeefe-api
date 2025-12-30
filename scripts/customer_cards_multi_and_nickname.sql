-- Enable multiple cards per client and add nickname
ALTER TABLE customer_cards DROP INDEX uk_customer_card;
ALTER TABLE customer_cards ADD COLUMN card_nickname VARCHAR(60) NULL DEFAULT NULL AFTER stripe_payment_method_id;
