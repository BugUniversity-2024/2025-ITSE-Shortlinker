import type { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service.js'

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.register(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getProfile(req.user!.id)
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.updateProfile(req.user!.id, req.body)
    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.changePassword(req.user!.id, req.body)
    res.json({ message: '密码修改成功' })
  } catch (error) {
    next(error)
  }
}

export async function getSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const settings = await authService.getSettings(req.user!.id)
    res.json(settings)
  } catch (error) {
    next(error)
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const settings = await authService.updateSettings(req.user!.id, req.body)
    res.json(settings)
  } catch (error) {
    next(error)
  }
}

export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await authService.getStats(req.user!.id)
    res.json(stats)
  } catch (error) {
    next(error)
  }
}

export async function deleteAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.deleteAccount(req.user!.id, req.body.password)
    res.json({ message: '账户已删除' })
  } catch (error) {
    next(error)
  }
}

export async function getApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.getApiKey(req.user!.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.refreshToken(req.user!.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function exportUserData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.exportUserData(req.user!.id)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=user-data-export-${req.user!.id}.json`)
    res.json(data)
  } catch (error) {
    next(error)
  }
}
