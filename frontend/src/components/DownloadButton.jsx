import { useState } from 'react';
import { downloadDocument } from '../services/documentApi.js';

function safeFileName(fileName) {
  const leafName = fileName.replace(/\\/g, '/').split('/').pop();
  return leafName.replace(/[\u0000-\u001f\u007f]/g, '') || 'document';
}

export default function DownloadButton({ documentId, fileName }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleDownload() {
    setIsDownloading(true);
    setErrorMessage('');

    try {
      const blob = await downloadDocument(documentId);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = safeFileName(fileName);
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-control">
      <button
        className="secondary-button"
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={`Baixar ${fileName}`}
      >
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {errorMessage && <span className="download-error" role="alert">{errorMessage}</span>}
    </div>
  );
}