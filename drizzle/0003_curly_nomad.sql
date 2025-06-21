ALTER TABLE "clients" ADD COLUMN "outseam" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "ankle" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "shoulder" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "sleeve_length" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "knee" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "wrist" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "rise" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "bicep" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_type" varchar(50);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_balance" integer;