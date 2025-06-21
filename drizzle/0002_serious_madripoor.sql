ALTER TABLE "clients" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "user_id" text NOT NULL;