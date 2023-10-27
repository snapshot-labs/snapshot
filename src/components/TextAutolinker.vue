<script setup lang="ts">
import Autolinker from 'autolinker';
import { isSnapshotUrl } from '@/helpers/utils';

interface Props {
  text: string;
  truncate?: number;
}
const props = withDefaults(defineProps<Props>(), {
  truncate: 0
});

const textAutolinker = ref();
const showModal = ref(false);
const clickedUrl = ref('');

const textWithLinks = computed(() =>
  Autolinker.link(props.text, {
    truncate: props.truncate,
    sanitizeHtml: true
  })
);

function handleLinkClick(e, url) {
  e.preventDefault();
  clickedUrl.value = url;

  if (isSnapshotUrl(url)) {
    return handleConfirm();
  }

  showModal.value = true;
}

function handleConfirm() {
  window.open(clickedUrl.value, '_blank', 'noopener,noreferrer');
}

onMounted(() => {
  textAutolinker.value.querySelectorAll('a[href]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      handleLinkClick(e, link.getAttribute('href'));
    });
  });
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span ref="textAutolinker" v-html="textWithLinks" />
  <Teleport to="#modal">
    <ModalLinkPreview
      :open="showModal"
      :clicked-url="clickedUrl"
      @close="showModal = false"
      @confirm="handleConfirm"
    />
  </Teleport>
</template>
