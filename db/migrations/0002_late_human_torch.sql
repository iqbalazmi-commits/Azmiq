CREATE TABLE "email_suppressions" (
	"email" text PRIMARY KEY NOT NULL,
	"reason" text DEFAULT 'basket_reminder_unsubscribe' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "recovery_token" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "recovery_sent_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_recovery_token_idx" ON "orders" USING btree ("recovery_token");