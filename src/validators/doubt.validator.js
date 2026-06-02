const { z } = require("zod");

const createDoubtSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200),
  content: z.string().min(20, "Please describe your doubt in detail").max(5000),
  topic: z.string().min(1, "Topic is required"),
  tags: z.array(z.string().trim()).max(5).optional().default([]),
});

const createAnswerSchema = z.object({
  content: z.string().min(10, "Answer must be at least 10 characters").max(10000),
});

module.exports = { createDoubtSchema, createAnswerSchema };
