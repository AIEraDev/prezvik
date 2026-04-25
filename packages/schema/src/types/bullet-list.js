import { z } from "zod";
/**
 * Bullet list slide content schema
 *
 * Classic presentation format - title + bullets
 */
export const BulletListContentSchema = z.object({
    title: z.string(),
    bullets: z.array(z.string()).min(1),
});
//# sourceMappingURL=bullet-list.js.map