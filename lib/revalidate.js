import { revalidatePath } from "next/cache";

/**
 * Campaign totals changed (a donation was approved) — refresh the cached
 * public pages, which are statically generated with ISR for speed.
 */
export function revalidatePublicPages() {
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    console.error("revalidatePath failed:", err.message);
  }
}
