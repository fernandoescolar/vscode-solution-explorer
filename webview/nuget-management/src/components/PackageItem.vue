<template>
  <n-card
    class="package-item"
    :class="{ selected: isSelected }"
    :bordered="false"
    content-style="display: flex;"
  >
    <n-image
      width="70"
      :src="packageInfo.iconUrl"
      fallback-src="https://www.nuget.org/Content/gallery/img/default-package-icon.svg"
      preview-disabled
      style="margin-right: 5px; flex-shrink: 0"
    />
    <div style="word-break: break-all; width: 100%">
      <div style="display: flex">
        <n-ellipsis :tooltip="false" :line-clamp="1">
          <span style="font-weight: bold; font-size: 16px">{{
            packageInfo.id
          }}</span>
          by
          {{ packageInfo.authors.join(',') }}
        </n-ellipsis>
        <div style="flex-shrink: 0; margin-left: auto">
          v{{ packageInfo.version }}
        </div>
      </div>

      <n-ellipsis v-if="packageInfo.summary" :tooltip="false" :line-clamp="2">
        {{ packageInfo.summary }}
      </n-ellipsis>
      <n-ellipsis v-else :tooltip="false" :line-clamp="2">
        {{ packageInfo.description }}
      </n-ellipsis>
    </div>
  </n-card>
</template>

<script setup>
const props = defineProps({
  isSelected: {
    type: Boolean,
    default: false
  },
  packageInfo: {
    type: Object,
    default: {}
  }
})
</script>

<style scoped>
.package-item {
  background: #2f3542;
}
.package-item:hover {
  background: #27ae60;
  color: #2f3542;
  cursor: pointer;
}
.package-item.selected {
  background: #2980b9;
}
</style>
