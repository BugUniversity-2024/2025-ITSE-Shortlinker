<template>
  <DashboardLayout>
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Teams</h1>
          <p class="mt-1 text-gray-600">Create and manage your teams</p>
        </div>
        <BaseButton variant="primary" @click="showCreateModal = true">
          <PlusIcon class="h-5 w-5 mr-2" />
          Create Team
        </BaseButton>
      </div>

      <div v-if="teamStore.isLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else-if="teamStore.teams.length === 0" class="card text-center py-12">
        <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No Teams Yet</h3>
        <p class="mt-2 text-gray-500">Create a team and invite members to collaborate on links</p>
        <BaseButton variant="primary" class="mt-4" @click="showCreateModal = true">
          Create Team
        </BaseButton>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="team in teamStore.teams"
          :key="team.id"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          @click="selectTeam(team)"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ team.name }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ team.description || 'No description' }}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {{ team.member_count }} members
            </span>
          </div>
          <div class="mt-4 flex items-center text-sm text-gray-500">
            <CalendarIcon class="h-4 w-4 mr-1" />
            Created {{ formatDate(team.created_at, 'short') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Create Team Modal -->
    <BaseModal v-model="showCreateModal" title="Create Team">
      <form @submit.prevent="handleCreateTeam" class="space-y-4">
        <BaseInput
          v-model="createForm.name"
          label="Team Name"
          placeholder="Enter team name"
          required
        />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <textarea
            v-model="createForm.description"
            rows="3"
            class="input-field"
            placeholder="Briefly describe the team"
          />
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showCreateModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="isCreating" @click="handleCreateTeam">Create</BaseButton>
      </template>
    </BaseModal>

    <!-- Team Details Modal -->
    <BaseModal v-model="showDetailModal" :title="selectedTeam?.name" size="lg">
      <div v-if="selectedTeam" class="space-y-6">
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-2">Team Members</h4>
          <div class="space-y-2">
            <div
              v-for="member in teamStore.members"
              :key="member.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span class="text-sm text-white font-medium">
                    {{ member.user.username.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ member.user.username }}</p>
                  <p class="text-xs text-gray-500">{{ member.user.email }}</p>
                </div>
              </div>
              <span
                class="text-xs font-medium px-2 py-1 rounded"
                :class="{
                  'bg-yellow-100 text-yellow-800': member.role === 'owner',
                  'bg-blue-100 text-blue-800': member.role === 'admin',
                  'bg-gray-100 text-gray-800': member.role === 'member'
                }"
              >
                {{ roleLabels[member.role] }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-2">Invite Members</h4>
          <div class="flex space-x-2">
            <input
              v-model="inviteEmail"
              type="email"
              placeholder="Enter email address"
              class="input-field flex-1"
            />
            <BaseButton variant="primary" @click="handleInvite">Invite</BaseButton>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showDetailModal = false">Close</BaseButton>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useUIStore } from '@/stores/ui'
import { formatDate } from '@/utils/formatters'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { PlusIcon, UserGroupIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import type { Team, TeamRole } from '@/types'

const teamStore = useTeamStore()
const uiStore = useUIStore()

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const isCreating = ref(false)
const selectedTeam = ref<Team | null>(null)
const inviteEmail = ref('')

const createForm = reactive({
  name: '',
  description: ''
})

const roleLabels: Record<TeamRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member'
}

async function handleCreateTeam() {
  if (!createForm.name) {
    uiStore.error('Please enter team name')
    return
  }

  isCreating.value = true
  const result = await teamStore.createTeam(createForm)

  if (result.success) {
    uiStore.success('Team created successfully')
    showCreateModal.value = false
    createForm.name = ''
    createForm.description = ''
  } else {
    uiStore.error(result.message || 'Failed to create team')
  }

  isCreating.value = false
}

async function selectTeam(team: Team) {
  selectedTeam.value = team
  await teamStore.fetchTeamMembers(team.id)
  showDetailModal.value = true
}

async function handleInvite() {
  if (!inviteEmail.value || !selectedTeam.value) {
    uiStore.error('Please enter email address')
    return
  }

  const result = await teamStore.inviteMember(selectedTeam.value.id, {
    email: inviteEmail.value,
    role: 'member'
  })

  if (result.success) {
    uiStore.success('Invitation sent')
    inviteEmail.value = ''
  } else {
    uiStore.error(result.message || 'Failed to send invitation')
  }
}

onMounted(() => {
  teamStore.fetchTeams()
})
</script>
