import { Document } from 'mongoose';

/*
*  User Model 
*/

export type RoleType = "user" | "admin";

export interface UserInterface extends Document {
  name: string;
  email: string;
  role: RoleType;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

/*
*  Log Model
*/

export interface LogInterface extends Document {
    ip: string;
    headers?: Record<string, any>;
    method: string;
    url: string;
    params?: Record<string, any>;
    queryParams?: Record<string, any>;
    body?: Record<string, any>;
    responseTime: number;
    status: number;
    errorMessage?: string;
    userAgent?: string;
    timestamp: Date;
}

