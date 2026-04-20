import { randomBytes } from "node:crypto";

import Counter from "../models/counter.model.js";

export const getNextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return counter.seq;
};

export const formatPublicId = (prefix, seq, date = new Date()) => {
  const year = new Date(date).getFullYear();
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
};

export const createVerificationCode = (length = 8) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};
