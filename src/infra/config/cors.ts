import { FastifyCorsOptions } from "@fastify/cors";

const originDevelopment = [
  'http://localhost:3000',
  'http://localhost:5173',
]

const origins = process.env.ORIGIN?.split(',') || []

export const corsConfig: FastifyCorsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}
