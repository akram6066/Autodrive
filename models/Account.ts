// models/Account.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  provider: string;
  type: string;
  providerAccountId: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    provider: { type: String, required: true },
    type: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
  },
  { timestamps: true }
);

export default mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);
