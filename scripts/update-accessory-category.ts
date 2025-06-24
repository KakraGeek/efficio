import { db } from '../db/client';
import { inventory } from '../db/schema';
import { sql } from 'drizzle-orm';

async function updateAccessoryCategory() {
  // Update all items where category is any case/whitespace variation of 'accessory'
  const result = await db
    .update(inventory)
    .set({ category: 'Accessories' })
    .where(sql`${inventory.category} ~* '^\\s*accessory\\s*$'`);
  console.log('Updated items:', result.rowCount);
}

updateAccessoryCategory()
  .then(() => {
    console.log('Category update complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error updating categories:', err);
    process.exit(1);
  });
