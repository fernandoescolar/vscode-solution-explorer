<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <div class="container">
        <Filter
          class="filter"
          :nugetSources="nugetSources"
          @filterChanged="handleFilterChange"
          @reflashFilter="refreshList"
          @sourceChanged="source => (currentSource = source)"
        ></Filter>
        <div class="packages-list">
          <PackageList
            ref="packagesList"
            :filter="filterValue"
            :nugetSource="currentSource"
            @packageChanged="packageChanged"
          ></PackageList>
        </div>

        <div class="package-detail" v-if="selectedPackage">
          <PackageDetail
            @installOrUninstall="installOrUninstall"
            :projects="projects"
            :selectedPackage="selectedPackage"
          ></PackageDetail>
        </div>
      </div>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui'
import _ from 'lodash'
import { command } from './lib/command'

const packagesList = ref()
const filterValue = ref('')
const selectedPackage = ref(null)
const nugetSources = ref([])
const currentSource = ref()
const projects = ref()
const rawProjects = ref()

const handleFilterChange = filter => {
  filterValue.value = filter
  debouncedListRefresh()
}
const refreshList = () => {
  packagesList.value.refresh()
}
const packageChanged = packageInfo => {
  selectedPackage.value = packageInfo
  recalculateProjectsList()
}
const recalculateProjectsList = () => {
  if (!selectedPackage.value) projects.value = null
  else {
    projects.value = []
    let packageId = selectedPackage.value.id
    rawProjects.value.forEach(x => {
      let foundPackage = x?.packages.find(p => p.id == packageId)
      let version = foundPackage ? foundPackage.version : null
      projects.value.push({
        projectName: x.projectName,
        projectPath: x.path,
        version: version
      })
    })
  }
}
const projectsReloadRequest = () => {
  projects.value = null
  command('solutionExplorer.reloadProjects', res => {
    if (res.code == 0) {
      rawProjects.value = res.result
      recalculateProjectsList()
    }
  })
}
const installOrUninstall = args => {
  command('solutionExplorer.manageNugetPackages', args)
}
const debouncedListRefresh = _.debounce(refreshList, 300)

projectsReloadRequest()
command('solutionExplorer.reloadSources', res => {
  nugetSources.value = res.result.map(x => {
    const temp = JSON.parse(x)
    return {
      label: temp.name,
      value: temp.url
    }
  })
})

window.addEventListener('message', event => {
  switch (event.data.command) {
    case 'setProjects':
      projectsReloadRequest()
      break
  }
})
</script>

<style scoped>
.container {
  height: 100vh;
  display: grid;
  grid-template-rows: 60px auto;
  grid-template-columns: 60% 40%;
}

.filter {
  grid-column: 1 / 3;
  border-bottom: 1px solid #747d8c;
}

.packages-list {
  grid-row: 2;
  grid-column: 1;
  border-right: 1px solid #747d8c;
}

.package-detail {
  overflow-y: auto;
}
</style>
