const { z } = require("zod");

const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000),
  type: z.enum(["text", "image", "project", "question"]).default("text"),
  mediaUrl: z.string().url().optional(),
  tags: z.array(z.string().toLowerCase().trim()).max(5).optional().default([]),
});

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(1000),
  parentId: z.string().optional(),
});

module.exports = { createPostSchema, createCommentSchema };
