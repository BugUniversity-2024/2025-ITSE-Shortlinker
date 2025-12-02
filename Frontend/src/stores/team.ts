import { defineStore } from 'pinia'
import { ref } from 'vue'
import { teamService } from '@/services/team.service'
import type { Team, TeamMember, CreateTeamData, UpdateTeamData, InviteMemberData, TeamRole } from '@/types'

interface TeamResult {
  success: boolean
  message?: string
  data?: Team
}

export const useTeamStore = defineStore('team', () => {
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const members = ref<TeamMember[]>([])
  const isLoading = ref(false)

  // 获取团队列表
  async function fetchTeams(): Promise<void> {
    isLoading.value = true
    try {
      teams.value = await teamService.getTeams()
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      teams.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 获取团队详情
  async function fetchTeamById(teamId: number): Promise<Team | null> {
    try {
      const team = await teamService.getTeamById(teamId)
      currentTeam.value = team
      return team
    } catch (error) {
      console.error('Failed to fetch team:', error)
      currentTeam.value = null
      return null
    }
  }

  // 获取团队成员
  async function fetchTeamMembers(teamId: number): Promise<void> {
    try {
      members.value = await teamService.getTeamMembers(teamId)
    } catch (error) {
      console.error('Failed to fetch team members:', error)
      members.value = []
    }
  }

  // 创建团队
  async function createTeam(data: CreateTeamData): Promise<TeamResult> {
    try {
      const newTeam = await teamService.createTeam(data)
      teams.value.push(newTeam)
      return { success: true, data: newTeam }
    } catch (error) {
      console.error('Failed to create team:', error)
      return { success: false, message: '创建团队失败' }
    }
  }

  // 更新团队
  async function updateTeam(teamId: number, data: UpdateTeamData): Promise<TeamResult> {
    try {
      const updatedTeam = await teamService.updateTeam(teamId, data)
      const index = teams.value.findIndex(t => t.id === teamId)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }
      if (currentTeam.value?.id === teamId) {
        currentTeam.value = updatedTeam
      }
      return { success: true, data: updatedTeam }
    } catch (error) {
      console.error('Failed to update team:', error)
      return { success: false, message: '更新团队失败' }
    }
  }

  // 删除团队
  async function deleteTeam(teamId: number): Promise<TeamResult> {
    try {
      await teamService.deleteTeam(teamId)
      teams.value = teams.value.filter(t => t.id !== teamId)
      if (currentTeam.value?.id === teamId) {
        currentTeam.value = null
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to delete team:', error)
      return { success: false, message: '删除团队失败' }
    }
  }

  // 邀请成员
  async function inviteMember(teamId: number, data: InviteMemberData): Promise<TeamResult> {
    try {
      await teamService.inviteMember(teamId, data)
      return { success: true }
    } catch (error) {
      console.error('Failed to invite member:', error)
      return { success: false, message: '邀请成员失败' }
    }
  }

  // 更新成员角色
  async function updateMemberRole(teamId: number, userId: number, role: TeamRole): Promise<TeamResult> {
    try {
      const updatedMember = await teamService.updateMemberRole(teamId, userId, { role })
      const index = members.value.findIndex(m => m.user_id === userId)
      if (index !== -1) {
        members.value[index] = updatedMember
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to update member role:', error)
      return { success: false, message: '更新成员角色失败' }
    }
  }

  // 移除成员
  async function removeMember(teamId: number, userId: number): Promise<TeamResult> {
    try {
      await teamService.removeMember(teamId, userId)
      members.value = members.value.filter(m => m.user_id !== userId)
      return { success: true }
    } catch (error) {
      console.error('Failed to remove member:', error)
      return { success: false, message: '移除成员失败' }
    }
  }

  // 退出团队
  async function leaveTeam(teamId: number): Promise<TeamResult> {
    try {
      await teamService.leaveTeam(teamId)
      teams.value = teams.value.filter(t => t.id !== teamId)
      return { success: true }
    } catch (error) {
      console.error('Failed to leave team:', error)
      return { success: false, message: '退出团队失败' }
    }
  }

  return {
    teams,
    currentTeam,
    members,
    isLoading,
    fetchTeams,
    fetchTeamById,
    fetchTeamMembers,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveTeam
  }
})
