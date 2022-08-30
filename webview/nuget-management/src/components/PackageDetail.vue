<template>
  <n-layout>
    <n-layout-content content-style="padding: 24px; background: #2f3542;">
      <div
        style="display: flex; justify-content: center; align-items: center; word-break: break-all"
      >
        <n-image
          width="35"
          :src="selectedPackage.iconUrl"
          fallback-src="https://www.nuget.org/Content/gallery/img/default-package-icon.svg"
          preview-disabled
        />
        <n-ellipsis :line-clamp="1" style="margin-left: 5px">
          <strong style="font-size: 16px">{{ selectedPackage.id }}</strong>
        </n-ellipsis>
      </div>
      <div style="margin-top: 15px">
        <n-checkbox-group v-model:value="selectedProjects">
          <n-space item-style="display: flex;" vertical>
            <n-checkbox v-for="(item, index) in projects" :key="index" :value="item"
              >{{ item.projectName }}
              <n-tag v-if="item.version" type="info" size="small">
                {{ item.version }}
              </n-tag></n-checkbox
            >
          </n-space>
        </n-checkbox-group>
        <div
          style="display: flex; align-items: center; justify-content: space-around; margin-top: 8px"
        >
          <n-select
            style="width: 110px"
            v-model:value="selectedVersion"
            size="small"
            :options="
              selectedPackage.versions
                .map(x => {
                  return { label: x.version, value: x.version }
                })
                .reverse()
            "
            @update:value="changeVersion"
          />
          <n-button
            :disabled="!canInstall()"
            @click="install"
            type="success"
            size="small"
            strong
            secondary
          >
            install
          </n-button>
          <n-button
            :disabled="!canUninstall()"
            @click="uninstall"
            type="success"
            size="small"
            strong
            secondary
          >
            uninstall
          </n-button>
        </div>
      </div>
      <div style="padding: 20px">
        <div v-if="metadataLoading == 'loading'">
          <n-skeleton text :repeat="2" /> <n-skeleton text style="width: 60%" />
        </div>
        <div v-else-if="metadataLoading == 'loaded'">
          <div style="display: flex; word-break: break-all">
            <div style="width: 30%">version：</div>
            <div style="width: 70%">{{ packageMetadata?.version }}</div>
          </div>
          <div style="display: flex; word-break: break-all">
            <div style="width: 30%">author：</div>
            <div style="width: 70%">{{ packageMetadata?.authors }}</div>
          </div>
          <div style="display: flex; word-break: break-all">
            <div style="width: 30%">license：</div>
            <div style="width: 70%">{{ packageMetadata?.license }}</div>
          </div>
          <div style="display: flex; word-break: break-all">
            <div style="width: 30%">published：</div>
            <div style="width: 70%">{{ packageMetadata?.published }}</div>
          </div>
          <div style="display: flex; word-break: break-all">
            <div style="width: 30%">project URL：</div>
            <div style="width: 70%">{{ packageMetadata?.projectUrl }}</div>
          </div>
          <div style="display: flex; word-break: break-all">
            <div style="width: 30%">description：</div>
            <div style="width: 70%">{{ packageMetadata?.description }}</div>
          </div>
          <div style="display: flex; word-break: break-all">
            <div style="width: 30%">dependencyGroups：</div>
          </div>
          <div v-for="(item, index) in packageMetadata?.dependencyGroups" :key="index">
            <n-tree
              block-line
              :data="[item]"
              key-field="targetFramework"
              label-field="targetFramework"
              children-field="dependencies"
            />
          </div>
        </div>
        <div v-else>
          <h4>Error</h4>
        </div>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import moment from 'moment'
import { command } from '../lib/command'

const emit = defineEmits(['installOrUninstall'])

const props = defineProps({
  selectedPackage: {
    type: Object,
    default: {}
  },
  projects: Array
})
const selectedVersion = ref(props.selectedPackage.version)
const packageMetadata = ref()
const selectedProjects = ref([])
const metadataLoading = ref('loading')

const existsItem = items => {
  let exists = false
  for (let i in items) {
    if ('items' in items[i]) {
      exists = true
      break
    }
  }
  return exists
}
const filterItems = (items, version) => {
  let result = []

  let filterResult = []
  let element = {}
  for (let index = 0, length = items.length; index < length; index++) {
    element = items[index]
    filterResult = element.filter(x => x.catalogEntry.version == version)
    if (filterResult.length > 0) {
      result = filterResult
      break
    }
  }
  return result
}
const getRegistrationPage = url => {
  return axios
    .get(url.replace(/(https?:\/\/)[^\/]+/g, 'https://nuget.cdn.azure.cn'))
    .then(response => response.data)
}
const getPackageMetadataAlternative = async (items, version) => {
  let result = []
  let itemsPage = []
  let filter = []

  for (let index = 0, length = items.length; index < length; index++) {
    itemsPage = await getRegistrationPage(items[index]['@id'])
    filter = itemsPage.items.filter(x => x.catalogEntry.version == version)

    if (filter.length > 0) {
      result = filter
      break
    }
  }

  return result
}
const getDependencies = catalogEntry => {
  let dependencyGroups = []

  if (catalogEntry.dependencyGroups !== undefined) {
    let dependencies = []

    for (
      let indexGroup = 0, lengthGroup = catalogEntry.dependencyGroups.length;
      indexGroup < lengthGroup;
      indexGroup++
    ) {
      dependencies = []
      const elementGroup = catalogEntry.dependencyGroups[indexGroup]

      let targetFramework =
        elementGroup.targetFramework === undefined || elementGroup.targetFramework === ''
          ? 'Any, Version=v0.0'
          : elementGroup.targetFramework

      if (elementGroup.dependencies !== undefined) {
        for (
          let indexDep = 0, lengthDep = elementGroup.dependencies.length;
          indexDep < lengthDep;
          indexDep++
        ) {
          let elementDep = elementGroup.dependencies[indexDep]
          dependencies.push({
            targetFramework: elementDep.id,
            range: elementDep.range
          })
        }
      } else {
        dependencies.push({
          targetFramework: 'No dependencies',
          range: ''
        })
      }

      dependencyGroups.push({
        targetFramework: targetFramework,
        dependencies: dependencies
      })
    }
  }
  return dependencyGroups
}
const getPackageMetadata = (packageId, version) => {
  let metadata = {}

  command('solutionExplorer.httpRequest', props.selectedPackage['@id'], response => {
    let temp = JSON.parse(response.result)
    let result = []
    const items = temp.items

    if (existsItem(items)) {
      result = filterItems(
        items.map(x => x.items),
        version
      )
    } else {
      // result = await getPackageMetadataAlternative(items, version);
    }

    if (result.length > 0) {
      const catalogEntry = result[0].catalogEntry
      metadata = {
        version: catalogEntry.version,
        authors: catalogEntry.authors,
        license: catalogEntry.licenseExpression,
        licenseUrl: catalogEntry.licenseUrl,
        projectUrl: catalogEntry.projectUrl,
        description: catalogEntry.description,
        tags: Array.isArray(catalogEntry.tags) ? catalogEntry.tags.join(', ') : catalogEntry.tags,
        published: moment(catalogEntry.published).format('dddd, MMMM D, YYYY (MM/DD/YYYY)'),
        nugetUrl: `https://www.nuget.org/packages/${packageId}/${version}`,
        dependencyGroups: getDependencies(catalogEntry)
      }
      packageMetadata.value = metadata
      metadataLoading.value = 'loaded'
    }
  })
}
const canInstall = () => {
  let safeSelectedVersion = selectedVersion.value
  return (
    selectedProjects.value &&
    selectedProjects.value.length > 0 &&
    selectedProjects.value.every(function (p) {
      return (
        p.version === null || (safeSelectedVersion !== null && p.version !== safeSelectedVersion)
      )
    })
  )
}
const canUninstall = () => {
  let safeSelectedVersion = selectedVersion.value
  return (
    selectedProjects.value &&
    selectedProjects.value.length > 0 &&
    selectedProjects.value.every(function (project) {
      return project.version && project.version === safeSelectedVersion
    })
  )
}
const install = () => {
  if (selectedProjects.value && selectedProjects.value.length > 0) {
    let args = {
      command: 'add',
      projects: selectedProjects.value.map(x => {
        return {
          projectName: x.projectName,
          projectPath: x.projectPath
        }
      }),
      package: props.selectedPackage.id,
      version: selectedVersion.value
    }
    emit('installOrUninstall', args)
  }
}
const uninstall = () => {
  if (selectedProjects.value && selectedProjects.value.length > 0) {
    let args = {
      command: 'remove',
      projects: selectedProjects.value.map(x => {
        return {
          projectName: x.projectName,
          projectPath: x.projectPath
        }
      }),
      package: props.selectedPackage.id,
      version: selectedVersion.value
    }
    emit('installOrUninstall', args)
  }
}
const changeVersion = value => {
  metadataLoading.value = 'loading'
  selectedVersion.value = value
  getPackageMetadata(props.selectedPackage.id, selectedVersion.value)
}

watch(
  () => props.selectedPackage,
  (val, preVal) => {
    metadataLoading.value = 'loading'
    selectedVersion.value = props.selectedPackage.version

    getPackageMetadata(props.selectedPackage.id, selectedVersion.value)
  },
  { immediate: true, deep: true }
)
watch(
  () => props.projects,
  newValue => {
    let oldSelectedProjects = selectedProjects.value
    selectedProjects.value = []
    oldSelectedProjects.forEach(x => {
      let previouslySelectedProject = newValue.find(p => p.projectName == x.projectName)
      if (previouslySelectedProject) {
        selectedProjects.value.push(previouslySelectedProject)
      }
    })
  }
)
</script>

<style scoped></style>
