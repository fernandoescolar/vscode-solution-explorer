<template>
  <div class="project-list-container">
    <n-list hoverable clickable>
      <n-list-item
        v-for="(item, index) in projectTypes"
        :key="index"
        @click="$emit('handleProjectClick', item)"
      >
        <n-thing content-indented>
          <template #avatar>
            <n-avatar>
              <n-icon>
                <project-icon></project-icon>
              </n-icon>
            </n-avatar>
          </template>
          <template #header> {{ item.name }} </template>
          <template #header-extra>
            <n-icon :size="18">
              <selected-green-icon
                v-if="selectedProject && selectedProject.value == item.value"
              ></selected-green-icon>
              <selected-icon v-else></selected-icon>
            </n-icon>
          </template>
          {{
            item?.description
              ? item.description
              : 'no description'
          }}
          <template #footer>
            <n-space>
              <n-tag
                v-for="(language, index) in item.languages"
                :bordered="false"
                type="info"
                size="small"
              >
                {{ language }}
              </n-tag>
            </n-space>
          </template>
        </n-thing>
      </n-list-item>
    </n-list>
  </div>
</template>

<script setup>
const props = defineProps({
  projectTypes: {
    type: Array,
    default: []
  },
  selectedProject: {
    type: Object,
    default: {}
  }
})
</script>

<style scoped>
.project-list-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}
</style>
