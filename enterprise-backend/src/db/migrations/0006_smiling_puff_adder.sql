ALTER TABLE "order_items" 
  ALTER COLUMN "name_snapshot" TYPE jsonb 
  USING (
    CASE 
      WHEN name_snapshot LIKE '{%' THEN name_snapshot::jsonb
      ELSE jsonb_build_object('en', name_snapshot)
    END
  );
--> statement-breakpoint
ALTER TABLE "order_item_modifiers" 
  ALTER COLUMN "name" TYPE jsonb 
  USING (
    CASE 
      WHEN name LIKE '{%' THEN name::jsonb
      ELSE jsonb_build_object('en', name)
    END
  );