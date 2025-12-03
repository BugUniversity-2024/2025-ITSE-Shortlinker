import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import prisma from '../config/database.js'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

// 格式化团队响应
function formatTeam(team: {
  id: number
  name: string
  description: string | null
  ownerId: number
  createdAt: Date
  updatedAt: Date
  _count?: { members: number }
}) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    owner_id: team.ownerId,
    member_count: (team._count?.members ?? 0) + 1,
    created_at: team.createdAt.toISOString(),
    updated_at: team.updatedAt.toISOString(),
  }
}

// 格式化邀请响应
function formatInvitation(inv: {
  id: number
  teamId: number
  email: string
  role: string
  status: string
  expiresAt: Date
  createdAt: Date
}) {
  return {
    id: inv.id,
    team_id: inv.teamId,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    expires_at: inv.expiresAt.toISOString(),
    created_at: inv.createdAt.toISOString(),
  }
}

// 获取用户的团队列表
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { ownerId: req.user!.id },
          { members: { some: { userId: req.user!.id } } },
        ],
      },
      include: {
        _count: { select: { members: true } },
      },
    })

    res.json(teams.map(formatTeam))
  } catch (error) {
    next(error)
  }
})

// 创建团队
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body
    const team = await prisma.team.create({
      data: {
        name,
        description,
        ownerId: req.user!.id,
        members: {
          create: {
            userId: req.user!.id,
            role: 'owner',
          },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    })

    res.status(201).json(formatTeam(team))
  } catch (error) {
    next(error)
  }
})

// 获取团队详情
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [
          { ownerId: req.user!.id },
          { members: { some: { userId: req.user!.id } } },
        ],
      },
      include: {
        _count: { select: { members: true } },
      },
    })

    if (!team) {
      res.status(404).json({ detail: 'Team not found' })
      return
    }

    res.json(formatTeam(team))
  } catch (error) {
    next(error)
  }
})

// Update team info
router.put('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)
    const { name, description } = req.body

    // Verify is team owner
    const team = await prisma.team.findFirst({
      where: { id: teamId, ownerId: req.user!.id },
    })

    if (!team) {
      res.status(404).json({ detail: 'Team not found or no permission to modify' })
      return
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        _count: { select: { members: true } },
      },
    })

    res.json(formatTeam(updated))
  } catch (error) {
    next(error)
  }
})

// 获取团队成员
router.get('/:id/members', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    })

    res.json(members.map((m) => ({
      id: m.id,
      user: m.user,
      role: m.role,
      joined_at: m.joinedAt.toISOString(),
    })))
  } catch (error) {
    next(error)
  }
})

// 邀请成员 (创建邀请记录，需用户确认)
router.post('/:id/invite', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)
    const { email, role = 'member' } = req.body

    // Verify is team owner or admin
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: req.user!.id } },
    })
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      res.status(403).json({ detail: 'No permission to invite members' })
      return
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(404).json({ detail: 'User not found' })
      return
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: user.id } },
    })
    if (existingMember) {
      res.status(409).json({ detail: 'User is already a team member' })
      return
    }

    // Check for pending invitation
    const existingInvite = await prisma.teamInvitation.findFirst({
      where: { teamId, email, status: 'pending' },
    })
    if (existingInvite) {
      res.status(409).json({ detail: 'Pending invitation already exists' })
      return
    }

    // Create invitation, expires in 7 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.teamInvitation.create({
      data: { teamId, email, role, expiresAt },
    })

    res.json(formatInvitation(invitation))
  } catch (error) {
    next(error)
  }
})

// 接受邀请
router.post('/invitations/:id/accept', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invitationId = parseInt(req.params.id, 10)

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      res.status(404).json({ detail: 'Invitation not found' })
      return
    }

    // Verify invitation status and expiration
    if (invitation.status !== 'pending') {
      res.status(400).json({ detail: 'Invitation already processed' })
      return
    }

    if (invitation.expiresAt < new Date()) {
      res.status(400).json({ detail: 'Invitation has expired' })
      return
    }

    // Verify current user email matches
    if (req.user!.email !== invitation.email) {
      res.status(403).json({ detail: 'This invitation does not belong to you' })
      return
    }

    // Create member record and update invitation status
    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId: req.user!.id,
          role: invitation.role,
        },
      }),
      prisma.teamInvitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      }),
    ])

    res.json({ message: 'Joined team' })
  } catch (error) {
    next(error)
  }
})

// Reject invitation
router.post('/invitations/:id/reject', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invitationId = parseInt(req.params.id, 10)

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      res.status(404).json({ detail: 'Invitation not found' })
      return
    }

    // Verify current user email matches
    if (req.user!.email !== invitation.email) {
      res.status(403).json({ detail: 'This invitation does not belong to you' })
      return
    }

    if (invitation.status !== 'pending') {
      res.status(400).json({ detail: 'Invitation already processed' })
      return
    }

    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'rejected' },
    })

    res.json({ message: 'Invitation rejected' })
  } catch (error) {
    next(error)
  }
})

// Leave team
router.post('/:id/leave', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)

    // Check if is team member
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: req.user!.id } },
    })

    if (!membership) {
      res.status(404).json({ detail: 'You are not a member of this team' })
      return
    }

    // Owner cannot leave, can only delete team
    if (membership.role === 'owner') {
      res.status(400).json({ detail: 'Team owner cannot leave. Please transfer ownership or delete the team' })
      return
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: req.user!.id } },
    })

    res.json({ message: 'Left team' })
  } catch (error) {
    next(error)
  }
})

// Update member role
router.patch('/:id/members/:userId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)
    const userId = parseInt(req.params.userId, 10)
    const { role } = req.body

    await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role },
    })

    res.json({ message: 'Role updated' })
  } catch (error) {
    next(error)
  }
})

// Remove member
router.delete('/:id/members/:userId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)
    const userId = parseInt(req.params.userId, 10)

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } },
    })

    res.json({ message: 'Member removed' })
  } catch (error) {
    next(error)
  }
})

// Delete team
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = parseInt(req.params.id, 10)

    await prisma.team.delete({
      where: { id: teamId, ownerId: req.user!.id },
    })

    res.json({ message: 'Team deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
