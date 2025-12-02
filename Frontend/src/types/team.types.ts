export type TeamRole = 'owner' | 'admin' | 'member'

export interface Team {
  id: number
  name: string
  description?: string
  owner_id: number
  member_count: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  user_id: number
  team_id: number
  role: TeamRole
  user: {
    id: number
    username: string
    email: string
    avatar?: string
  }
  joined_at: string
}

export interface CreateTeamData {
  name: string
  description?: string
}

export interface UpdateTeamData {
  name?: string
  description?: string
}

export interface InviteMemberData {
  email: string
  role: TeamRole
}

export interface UpdateMemberRoleData {
  role: TeamRole
}

export interface TeamInvitation {
  id: number
  team_id: number
  email: string
  role: TeamRole
  status: 'pending' | 'accepted' | 'rejected'
  expires_at: string
  created_at: string
}
