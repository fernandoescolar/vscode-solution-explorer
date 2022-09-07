<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-layout style="height: 100vh">
        <div class="container">
          <div class="filter">
            <Filter
              @handleProjectType="handleProjectType"
              @languageSelected="languageSelected"
            ></Filter>
          </div>
          <div class="project-list">
            <ProjectList
              :projectTypes="projectTypes"
              :selectedProject="selectedProject"
              @handleProjectClick="handleProjectClick"
            ></ProjectList>
          </div>
          <div class="right-panel" v-if="selectedProject">
            <RightPanel
              :selectedProject="selectedProject"
              @createProject="createProject"
            ></RightPanel>
          </div>
        </div>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui'
import _ from 'lodash'
import { PROJECT_TYPES } from '@/libs/ProjectType'

const projectTypes = ref(PROJECT_TYPES)
const selectedProject = ref(null)

const handleProjectType = _.debounce(val => {
  if (val == '') {
    projectTypes.value = PROJECT_TYPES
  } else {
    projectTypes.value = PROJECT_TYPES.filter(item => {
      var reg = new RegExp(val, 'i')
      return reg.test(item.name)
    })
  }
}, 300)
const languageSelected = val => {
  if (val == 'all') {
    projectTypes.value = PROJECT_TYPES
  } else {
    projectTypes.value = PROJECT_TYPES.filter(item => {
      return item.languages.indexOf(val) != -1
    })
  }
}
const handleProjectClick = item => {
  selectedProject.value = item
}
const createProject = val => {
  console.log(val)
}
</script>

<style scoped>
html,
body {
  height: 100%;
}
.container {
  height: 100%;
  display: grid;
  grid-template-rows: 70px auto;
  grid-template-columns: 50% 50%;
}
.filter {
  grid-column: 1/3;
  padding: 15px;
  border-bottom: 1px solid #747d8c;
}
.project-list {
  grid-row: 2;
  grid-column: 1;
  border-right: 1px solid #747d8c;
  overflow: auto;
}
.right-panel {
  overflow: auto;
}
</style>
