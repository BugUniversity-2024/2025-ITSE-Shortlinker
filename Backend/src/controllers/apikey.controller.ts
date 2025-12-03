import type { Request, Response, NextFunction } from 'express'
import * as apikeyService from '../services/apikey.service.js'

export async function listApiKeys(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKeys = await apikeyService.listApiKeys(req.user!.id)
    res.json(apiKeys)
  } catch (error) {
    next(error)
  }
}

export async function createApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await apikeyService.createApiKey(req.user!.id, req.body)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export async function updateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const keyId = parseInt(req.params.id)
    const apiKey = await apikeyService.updateApiKey(req.user!.id, keyId, req.body)
    res.json(apiKey)
  } catch (error) {
    next(error)
  }
}

export async function deleteApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const keyId = parseInt(req.params.id)
    await apikeyService.deleteApiKey(req.user!.id, keyId)
    res.json({ message: 'API Key revoked successfully' })
  } catch (error) {
    next(error)
  }
}

export async function getApiKeyStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await apikeyService.getApiKeyStats(req.user!.id)
    res.json(stats)
  } catch (error) {
    next(error)
  }
}
