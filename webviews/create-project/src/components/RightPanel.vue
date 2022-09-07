<template>
  <div class="panel-container">
    <h1 style="text-align: center">{{ selectedProject.name }}</h1>
    <n-card title="Configure your new project">
      <n-space vertical>
        <strong>Project language</strong>
        <n-select v-model:value="projectLanguage" :options="languageOptions" />
      </n-space>
      <n-space vertical>
        <strong>Project name</strong>
        <n-input
          v-model:value="projectName"
          type="text"
          placeholder="Please input project name"
        />
      </n-space>
      <n-space vertical style="margin-top: 5px">
        <strong>Folder name</strong>
        <n-input
          v-model:value="folderName"
          type="text"
          placeholder="Please input folder name"
        />
      </n-space>
    </n-card>
    <n-card title="Additional information" style="margin-top: 20px">
      <div>
        <web-api
          ref="additional"
          v-if="selectedProject.value == 'webapi'"
          @addAdditionalInfo="addAdditionalInfo"
        ></web-api>
        <h2 v-else>no more 😀</h2>
      </div>
    </n-card>
    <n-button style="margin: 20px" @click="handleCreateProject"
      >create</n-button
    >
  </div>
</template>

<script setup>
import { useMessage } from 'naive-ui'
const message = useMessage()

const emit = defineEmits(['createProject'])
const props = defineProps({
  selectedProject: {
    type: Object,
    default: {}
  }
})
const languageOptions = computed(() => {
  return props.selectedProject.languages.map(item => {
    return { label: item, value: item }
  })
})
const projectLanguage = ref(props.selectedProject.languages[0])
const projectName = ref('')
const folderName = ref('')
const additionalInfo = ref([])
const additional = ref(null)
watch(
  () => props.selectedProject,
  nVal => {
    projectLanguage.value = nVal.languages[0]
    projectName.value = ''
    folderName.value = ''
    additionalInfo.value = []
    additional.value = null
  }
)
const handleCreateProject = () => {
  if (additional.value) {
    additional.value.addAdditionalInfo()
  }
  if (projectName.value == '' || folderName.value == '') {
    message.error("Project name and Folder name can't be empty", {
      keepAliveOnHover: true
    })
  } else {
    emit('createProject', {
      projectLanguage: projectLanguage.value,
      projectName: projectName.value,
      folderName: folderName.value,
      additionalInfo: JSON.parse(JSON.stringify(additionalInfo.value))
    })
  }
}
const addAdditionalInfo = val => {
  additionalInfo.value = val
}
</script>

<style scoped>
.panel-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
