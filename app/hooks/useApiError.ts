import { useCallback } from 'react';
import useSnackbar from './useSnackbar';

const useApiError = () => {
  const { showError } = useSnackbar();

  const handleError = useCallback((error: any) => {
    if (!error.response) {
      showError('Connection error. Please check your internet.');
      return;
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        const firstError = Object.values(data)[0];
        showError(
          Array.isArray(firstError) 
            ? firstError[0] as string
            : 'Invalid data. Please check your inputs.'
        );
        break;

      case 401:
        showError('Session expired. Please login again.');
        break;

      case 403:
        showError('You do not have permission to do this.');
        break;

      case 404:
        showError('Not found.');
        break;

      case 500:
        showError('Server error. Please try again later.');
        break;

      default:
        showError('Something went wrong. Please try again.');
    }
  }, [showError]);

  return { handleError };
};

export default useApiError;