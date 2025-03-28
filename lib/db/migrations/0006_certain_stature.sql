CREATE TABLE IF NOT EXISTS "CustomPrompt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"promptText" text NOT NULL,
	"name" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UsageStat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"tokensUsed" integer NOT NULL,
	"chatId" uuid,
	"modelUsed" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenLimit" integer DEFAULT 10000;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomPrompt" ADD CONSTRAINT "CustomPrompt_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UsageStat" ADD CONSTRAINT "UsageStat_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UsageStat" ADD CONSTRAINT "UsageStat_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
