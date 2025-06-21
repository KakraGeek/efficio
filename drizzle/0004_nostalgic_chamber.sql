CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" varchar(255),
	"address" varchar(255),
	"phone" varchar(30),
	"email" varchar(255),
	"logo_url" text
);
