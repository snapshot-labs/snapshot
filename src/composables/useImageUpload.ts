import { ref } from 'vue';
import { useI18n } from './useI18n';
import { getIpfsUrl } from '@/helpers/utils';

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

  const reset = () => {
    uploading.value = false;
    error.value = '';
    imageUrl.value = '';
    imageName.value = '';
  };

  const upload = async e => {
    reset();
    const file = e.target.files[0];
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
      const url = `${import.meta.env.VITE_HUB_URL}/api/upload`;
      const init = {
        method: 'POST',
        body: formData
      };
      const result = await fetch(url, init);
      const output = await result.json();
      imageUrl.value = getIpfsUrl(output.file.ipfs_hash);
      imageName.value = file.name;
      onSuccess({ name: file.name, url: imageUrl.value });
    } catch (err) {
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
