import { Schema, model } from 'mongoose';
import type { LogInterface } from '../types/models.js';

const logSchema = new Schema<LogInterface>({
    ip: { type: String, required: true },
    headers: { type: Schema.Types.Mixed },
    method: { type: String, required: true },
    url: { type: String, required: true },
    params: { type: Schema.Types.Mixed },
    queryParams: { type: Schema.Types.Mixed },
    body: { type: Schema.Types.Mixed },
    responseTime: { type: Number, required: true },
    status: { type: Number, required: true },
    errorMessage: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
});

export const Log = model<LogInterface>('Log', logSchema);