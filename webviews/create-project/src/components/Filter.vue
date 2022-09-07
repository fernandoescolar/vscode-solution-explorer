<template>
  <div class="container-filter">
    <n-input
      placeholder="search"
      autosize
      clearable
      style="min-width: 30%"
      @input="val => $emit('handleProjectType', val)"
    >
      <template #suffix>
        <n-icon><search-icon></search-icon></n-icon>
      </template>
    </n-input>
    <n-select
      v-model:value="language"
      :options="languageOptions"
      @update:value="val => $emit('languageSelected', val)"
      style="width: 200px"
    />
  </div>
</template>

<script setup>
const language = ref('all')
const languageOptions = ref([
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'C#',
    value: 'C#'
  },
  {
    label: 'F#',
    value: 'F#'
  },
  {
    label: 'VB',
    value: 'VB'
  }
])
</script>

<style scoped>
.container-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
