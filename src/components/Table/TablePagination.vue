<template>
  <div class="pagination-controls">
    <div v-if="showInfo" class="pagination-info">
      {{ $t('table.pagination.total_rows') }}{{ totalItems }}
    </div>
    <div class="pagination-buttons">
      <button
        v-if="currentPage > 1"
        @click="$emit('update:currentPage', currentPage - 1)"
        class="page-button prev"
      >
        <i-material-symbols-arrow-back class="icon" />
        {{ $t('table.pagination.previous') }}
      </button>

      <div class="page-numbers">
        <template v-for="(pageNum, index) in displayedPages" :key="index">
          <input
            v-if="typeof pageNum === 'object'"
            type="text"
            class="page-input"
            :placeholder="'...'"
            @change="handlePageInputChange"
          />
          <button
            v-else
            @click="
              typeof pageNum === 'number' &&
              $emit('update:currentPage', pageNum)
            "
            :class="['page-number', { active: currentPage === pageNum }]"
          >
            {{ pageNum }}
          </button>
        </template>
      </div>

      <button
        v-if="currentPage < totalPages"
        @click="$emit('update:currentPage', currentPage + 1)"
        class="page-button next"
      >
        {{ $t('table.pagination.next') }}
        <i-material-symbols-arrow-forward class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalItems: number
  itemsPerPage: number
  showInfo?: boolean
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const handlePageInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value)
  if (!isNaN(value) && value > 0 && value <= totalPages.value) {
    emit('update:currentPage', value)
  }
  input.value = ''
}

const displayedPages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  range.push(1)

  for (let i = props.currentPage - delta; i <= props.currentPage + delta; i++) {
    if (i < totalPages.value && i > 1) {
      range.push(i)
    }
  }

  if (!range.includes(totalPages.value)) {
    range.push(totalPages.value)
  }

  for (let i = 0; i < range.length; i++) {
    if (l) {
      if (i === range.length - 1 && range[i] - l > 2) {
        rangeWithDots.push({ type: 'input', position: l + 1 })
      } else if (range[i] - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (range[i] - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(range[i])
    l = range[i]
  }

  return rangeWithDots
})
</script>

<style scoped>
.pagination-controls {
  margin: 1.5rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 1600px;
  width: calc(100% - 20px);
}

.pagination-info {
  color: #70757a;
  font-size: 0.9rem;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #1a73e8;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
}

.page-button:hover {
  background: #f8f9fa;
}

.page-button .icon {
  font-size: 1.2rem;
}

.page-numbers {
  display: flex;
  gap: 0.3rem;
}

.page-number {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #4d5156;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 50%;
}

.page-number.active {
  background: #1a73e8;
  color: white;
}

.page-number:not(.active):hover {
  background: #f8f9fa;
}

.page-input {
  width: 50px;
  height: 40px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: none;
  color: #4d5156;
  font-size: 0.9rem;
  padding: 0 8px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.page-input:focus {
  outline: none;
  border-color: #1a73e8;
  background: #f8f9fa;
}

.page-input::placeholder {
  color: #70757a;
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .page-button {
    padding: 0.2rem 0.6rem;
  }

  .page-input {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style>
