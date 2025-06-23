import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../db/client';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

// Helper to get the first (and only) settings row
async function getSettings() {
  const rows = await db.select().from(schema.settings).limit(1);
  console.log('Fetched settings row:', rows[0]);
  return rows[0] || null;
}

// Helper to upsert (insert or update) the settings row
async function upsertSettings(data: any) {
  // Try to update the row with id=1
  const updated = await db
    .update(schema.settings)
    .set(data)
    .where(eq(schema.settings.id, 1));
  console.log('Update result:', updated);
  if (updated.rowCount === 0) {
    // If no row was updated, insert a new one with id=1
    await db.insert(schema.settings).values({ id: 1, ...data });
    console.log('Inserted new settings row:', { id: 1, ...data });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Fetch settings from the database
    const row = await getSettings();
    if (!row) {
      // If no settings exist, return empty defaults
      console.log('No settings found, returning defaults.');
      return res.status(200).json({
        businessName: '',
        address: '',
        phone: '',
        email: '',
        logoUrl: '',
      });
    }
    console.log('Returning settings row:', row);
    return res.status(200).json(row);
  }

  if (req.method === 'PUT') {
    // Update settings in the database
    const { businessName, address, phone, email, logoUrl } = req.body;
    await upsertSettings({ businessName, address, phone, email, logoUrl });
    console.log('Settings updated via PUT:', {
      businessName,
      address,
      phone,
      email,
      logoUrl,
    });
    return res.status(200).json({ success: true });
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end('Method Not Allowed');
}
