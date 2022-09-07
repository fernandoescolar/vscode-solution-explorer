<template>
  <n-space vertical>
    <strong>Framework</strong>
    <n-select v-model:value="framework" :options="frameworkOptions" />
    <div v-if="framework == 'net6.0'">
      <n-space vertical>
        <n-checkbox v-model:checked="cfgHttps">
          Configure for HTTPS
        </n-checkbox>
        <n-checkbox v-model:checked="cfgMinimal">
          Use controllers (uncheck to use minimal APIs)
        </n-checkbox>
        <n-checkbox v-model:checked="cfgTopLevel">
          Do not use top-level statements
        </n-checkbox>
      </n-space>
    </div>
    <div v-if="framework == 'netcoreapp3.1'">
      <n-space vertical>
        <n-checkbox v-model:checked="cfgHttps">
          Configure for HTTPS
        </n-checkbox>
      </n-space>
    </div>
  </n-space>
</template>

<script setup>
const emit = defineEmits(['addAdditionalInfo'])
const framework = ref('net6.0')
const frameworkOptions = ref([
  {
    label: '.NET 6.0',
    value: 'net6.0'
  },
  {
    label: '.NET Core 3.1',
    value: 'netcoreapp3.1'
  }
])
const cfgHttps = ref(true)
const cfgMinimal = ref(true)
const cfgTopLevel = ref(false)

const addAdditionalInfo = () => {
  let tempList = []
  if (framework.value === 'net6.0') {
    tempList.push('-f net6.0')
    if (!cfgHttps.value) tempList.push('--no-https')
    if (!cfgMinimal.value) tempList.push('-minimal')
    if (cfgTopLevel) tempList.push('--use-program-main')
  } else {
    tempList.push('-f netcoreapp3.1')
    if (!cfgHttps.value) tempList.push('--no-https')
  }
  emit('addAdditionalInfo', tempList)
}
defineExpose({ addAdditionalInfo })
</script>

<style scoped></style>
