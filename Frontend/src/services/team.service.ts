import api from './api'
import type {
  Team,
  TeamMember,
  CreateTeamData,
  UpdateTeamData,
  InviteMemberData,
  UpdateMemberRoleData,
  TeamInvitation
} from '@/types'

export const teamService = {
  // Create team
  async createTeam(data: CreateTeamData): Promise<Team> {
    const response = await api.post<Team>('/teams', data)
    return response.data
  },

  // Get user's teams
  async getTeams(): Promise<Team[]> {
    const response = await api.get<Team[]>('/teams')
    return response.data
  },

  // Get team details
  async getTeamById(teamId: number): Promise<Team> {
    const response = await api.get<Team>(`/teams/${teamId}`)
    return response.data
  },

  // Update team
  async updateTeam(teamId: number, data: UpdateTeamData): Promise<Team> {
    const response = await api.put<Team>(`/teams/${teamId}`, data)
    return response.data
  },

  // Delete team
  async deleteTeam(teamId: number): Promise<void> {
    await api.delete(`/teams/${teamId}`)
  },

  // Get team members
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const response = await api.get<TeamMember[]>(`/teams/${teamId}/members`)
    return response.data
  },

  // Invite member
  async inviteMember(teamId: number, data: InviteMemberData): Promise<TeamInvitation> {
    const response = await api.post<TeamInvitation>(`/teams/${teamId}/invite`, data)
    return response.data
  },

  // Accept invitation
  async acceptInvitation(invitationId: number): Promise<void> {
    await api.post(`/teams/invitations/${invitationId}/accept`)
  },

  // Reject invitation
  async rejectInvitation(invitationId: number): Promise<void> {
    await api.post(`/teams/invitations/${invitationId}/reject`)
  },

  // Update member role
  async updateMemberRole(teamId: number, userId: number, data: UpdateMemberRoleData): Promise<TeamMember> {
    const response = await api.patch<TeamMember>(`/teams/${teamId}/members/${userId}`, data)
    return response.data
  },

  // Remove member
  async removeMember(teamId: number, userId: number): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`)
  },

  // Leave team
  async leaveTeam(teamId: number): Promise<void> {
    await api.post(`/teams/${teamId}/leave`)
  }
}
