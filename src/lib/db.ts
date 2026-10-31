import Dexie, { type EntityTable } from "dexie";
import { DocumentMeta } from "@/types/document";

export class SoulDocsDatabase extends Dexie {
  documents!: EntityTable<DocumentMeta, "id">;

  constructor() {
    super("SoulDocsDB");
    this.version(1).stores({
      documents: "id, title, isFavorite, createdAt, updatedAt",
    });
  }
}

// Client-side singleton instance
export const db = new SoulDocsDatabase();

/**
 * Sorts documents: favorites first, then by updatedAt descending.
 */
export function sortDocumentMetas(docs: DocumentMeta[]): DocumentMeta[] {
  return [...docs].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

// In-flight initialization promise to deduplicate concurrent calls
let initPromise: Promise<DocumentMeta[]> | null = null;

/**
 * Internal atomic initialization using a Dexie read-write transaction.
 * 1. Checks which document IDs already exist in the database.
 * 2. Inserts only genuinely missing records via bulkAdd.
 * 3. Never overwrites existing document metadata (no bulkPut).
 * 4. Gracefully handles any BulkError / ConstraintError.
 */
async function executeGetOrInitializeDocuments(
  fallbackMetas: DocumentMeta[]
): Promise<DocumentMeta[]> {
  try {
    return await db.transaction("rw", db.documents, async () => {
      // 1. Fetch all existing records within the transaction
      const existingDocs = await db.documents.toArray();
      const existingIdSet = new Set(existingDocs.map((doc) => doc.id));

      // 2. Identify genuinely missing records
      const missingRecords = fallbackMetas.filter(
        (meta) => !existingIdSet.has(meta.id)
      );

      // 3. Insert only genuinely missing records, avoiding ConstraintErrors
      if (missingRecords.length > 0) {
        try {
          await db.documents.bulkAdd(missingRecords);
        } catch (bulkErr) {
          // Gracefully handle BulkError or ConstraintError by attempting individual additions
          if (
            bulkErr instanceof Dexie.BulkError ||
            (bulkErr as any)?.name === "ConstraintError"
          ) {
            for (const record of missingRecords) {
              try {
                await db.documents.add(record);
              } catch {
                // Record already exists or inserted concurrently; safely skip
              }
            }
          } else {
            throw bulkErr;
          }
        }
      }

      // 4. Return all documents, preserving existing metadata without overwrite
      const allDocs = await db.documents.toArray();
      return sortDocumentMetas(allDocs.length > 0 ? allDocs : fallbackMetas);
    });
  } catch (err) {
    console.error("[SoulDocsDB] Error loading document metadata:", err);
    // Graceful fallback: return existing documents if readable, or fallbackMetas
    try {
      const existing = await db.documents.toArray();
      if (existing.length > 0) return sortDocumentMetas(existing);
    } catch {
      // If table cannot be read, return fallbackMetas in memory
    }
    return fallbackMetas;
  }
}

/**
 * Loads all document metadata from Dexie.
 * Thread-safe, idempotent, and safe against React Strict Mode and concurrent calls.
 */
export async function getOrInitializeDocuments(
  fallbackMetas: DocumentMeta[]
): Promise<DocumentMeta[]> {
  if (typeof window === "undefined") return fallbackMetas;

  // Deduplicate concurrent calls in flight
  if (initPromise) {
    return initPromise;
  }

  initPromise = executeGetOrInitializeDocuments(fallbackMetas).finally(() => {
    initPromise = null;
  });

  return initPromise;
}

/**
 * Saves or updates a document's metadata in Dexie.
 * Notice: Document content is NEVER stored in Dexie.
 */
export async function saveDocumentMeta(meta: DocumentMeta): Promise<void> {
  if (typeof window === "undefined") return;
  await db.documents.put(meta);
}

/**
 * Updates partial document metadata in Dexie.
 */
export async function updateDocumentMeta(
  id: string,
  updates: Partial<Omit<DocumentMeta, "id">>
): Promise<void> {
  if (typeof window === "undefined") return;
  await db.documents.update(id, updates);
}

/**
 * Deletes a document's metadata from Dexie.
 */
export async function deleteDocumentMeta(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  await db.documents.delete(id);
}
