import { ref } from 'vue';
import { upload as pin } from '@snapshot-labs/pineapple';
import { useI18n } from './useI18n';
import { useFlashNotification } from '@/composables/useFlashNotification';

export function useImageUpload({
  onSuccess
}: {
  onSuccess: (image: { name: string; url: string }) => void;
}) {
  const uploading = ref(false);
  const error = ref('');
  const imageUrl = ref('');
  const imageName = ref('');

  const { t } = useI18n();
  const { notify } = useFlashNotification();

  const reset = () => {
    uploading.value = false;
    error.value = '';
    imageUrl.value = '';
    imageName.value = '';
  };

  const upload = async file => {
    reset();
    if (!file) return;
    uploading.value = true;
    const formData = new FormData();

    // TODO: Additional Validations - File Size, File Type, Empty File, Hidden File
    // TODO: Make this composable useFileUpload

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      error.value = t('errors.unsupportedImageType');
      uploading.value = false;
      return;
    }
    formData.append('file', file);
    try {
      const receipt = await pin(formData);
      imageUrl.value = `ipfs://${receipt.cid}`;
      imageName.value = file.name;
      onSuccess({ name: file.name, url: imageUrl.value });
    } catch (err) {
      notify(['red', t('notify.somethingWentWrong')]);
      error.value = (err as Error).message;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    error,
    image: {
      url: imageUrl,
      name: imageName
    },
    upload
  };
}
