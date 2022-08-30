<template>
  <div class="filter">
    <div class="filterInput">
      <n-space>
        <n-input type="text" clearable @input="value => $emit('filterChanged', value)" />
        <n-button strong secondary circle type="info" @click="$emit('reflashFilter')">
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M400 148l-21.12-24.57A191.43 191.43 0 0 0 240 64C134 64 48 150 48 256s86 192 192 192a192.09 192.09 0 0 0 181.07-128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" data-darkreader-inline-stroke="" style="--darkreader-inline-stroke:currentColor;"></path><path d="M464 97.42V208a16 16 0 0 1-16 16H337.42c-14.26 0-21.4-17.23-11.32-27.31L436.69 86.1C446.77 76 464 83.16 464 97.42z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path></svg></n-icon>
          </template>
        </n-button>
      </n-space>
    </div>
    <div class="source">
      <n-select
        style="width: 180px"
        v-model:value="selectedSource"
        :options="nugetSources"
        @update:value="
          value => {
            selectedSource = value
            $emit('sourceChanged', value)
          }
        "
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  nugetSources: {
    type: Array,
    default: []
  }
})
const emit = defineEmits(['sourceChanged'])
const selectedSource = ref()

watch(
  () => props.nugetSources,
  newValue => {
    if (newValue && newValue.length > 0) {
      selectedSource.value = newValue[0].value
      emit('sourceChanged', selectedSource.value)
    } else {
      selectedSource.value = null
    }
  }
)
</script>

<style scoped>
.filter {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.filterInput {
  margin: 10px;
}
.source {
  display: inline;
  width: 180px;
  margin-right: 20px;
}
</style>
