import { createServerFn } from "@tanstack/react-start";

import { StudyReviewRequestSchema, type StudyReviewResponse } from "./schemas";

/**
 * Isomorphic RPC stub. The dynamic import stays inside the server-function
 * boundary, so the `.server.ts` implementation and API key cannot enter the
 * browser bundle.
 */
export const getStudyReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => StudyReviewRequestSchema.parse(input))
  .handler(async ({ data }): Promise<StudyReviewResponse> => {
    const { getStudyReviewOnServer } = await import("@/server/study-review.server");
    return getStudyReviewOnServer(data);
  });
