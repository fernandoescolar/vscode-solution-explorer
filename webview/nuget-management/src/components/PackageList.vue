<template>
  <div v-if="status == 'loaded'" class="packages-list-container">
    <div v-if="packages && packages.length > 0">
      <n-layout
        style="height: 90vh"
        :native-scrollbar="false"
        @scroll="onScroll"
      >
        <PackageItem
          v-for="(packageInfo, index) in packages"
          :packageInfo="packageInfo"
          :key="index"
          :isSelected="selectedPackage == packageInfo"
          @click.native="selectPackage(packageInfo)"
        ></PackageItem>
      </n-layout>
    </div>
    <div v-else>
      <n-empty description="nothing"> </n-empty>
    </div>
  </div>
  <div v-else-if="status == 'loading'" style="margin: 50px">
    <n-spin size="large" />
  </div>
  <div v-else style="margin: 50px">
    <h4>Error</h4>
  </div>
</template>

<script setup>
import { useLoadingBar } from 'naive-ui'
import { command } from '../lib/command'

const props = defineProps({
  filter: {
    type: String,
    default: ''
  },
  nugetSource: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['packageChanged'])

const packages = ref([])
const status = ref('loading')
const moreStatus = ref('loaded')
const loadingBar = useLoadingBar()
const page = ref(0)
const pageSize = ref(20)
const selectedPackage = ref({})
const queryUrl = ref(null)

const onScroll = e => {
  const { scrollTop, clientHeight, scrollHeight } = e.target

  if (
    scrollTop + clientHeight === scrollHeight &&
    moreStatus.value == 'loaded'
  ) {
    page.value += 1
    appendPackages()
  }
}
const selectPackage = packageInfo => {
  selectedPackage.value = packageInfo
  emit('packageChanged', packageInfo)
}
const refresh = () => {
  page.value = 0
  selectedPackage.value = null
  emit('packageChanged', null)
  packages.value = null
  status.value = 'loading'
  createQuery()
}
const appendPackages = () => {
  moreStatus.value = 'loading'
  loadingBar.start()
  command(
    'solutionExplorer.httpRequest',
    queryUrl.value,
    {
      q: props.filter,
      take: pageSize.value,
      skip: pageSize.value * page.value,
      prerelease: false
    },
    response => {
      let temp = JSON.parse(response.result)
      moreStatus.value = 'loaded'
      loadingBar.finish()
      if (temp && temp.data.length > 0) {
        temp.data.forEach(x => {
          packages.value.push(x)
        })
      } else {
        moreStatus.value = 'all'
      }
    }
  )
}
const createQuery = () => {
  if (queryUrl.value == null) {
    command('solutionExplorer.httpRequest', props.nugetSource, response => {
      let temp = JSON.parse(response.result)
      let resource = temp.resources.find(x =>
        x['@type'].includes('SearchQueryService')
      )
      if (resource != null) queryUrl.value = resource['@id']
      if (queryUrl.value == null) status = 'error'
      packages.value = createQuery()
    })
  } else {
    command(
      'solutionExplorer.httpRequest',
      queryUrl.value,
      {
        q: props.filter,
        take: pageSize.value,
        skip: pageSize.value * page.value,
        prerelease: false
      },
      response => {
        let temp = JSON.parse(response.result)
        if (response.result) packages.value = temp.data
        status.value = 'loaded'
      }
    )
  }
}

watch(
  () => props.nugetSource,
  newVal => {
    queryUrl.value = null
    refresh()
  }
)

defineExpose({
  refresh
})
</script>

<style scoped>
.packages-list-container {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
