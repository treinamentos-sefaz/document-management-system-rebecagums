import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments, uploadDocument } from './services/documentApi.js';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');

    listDocuments(controller.signal)
      .then(setDocuments)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadVersion]);

  async function handleUpload(file) {
    setIsUploading(true);
    setUploadError('');
    setUploadMessage('');

    try {
      const document = await uploadDocument(file);
      setUploadMessage(`${document.originalName} enviado com sucesso.`);
      setReloadVersion((version) => version + 1);
      return true;
    } catch (error) {
      setUploadError(error.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name">DMS <small>DOCUMENTOS</small></span>
        </a>
        <div className="account-indicator">
          <span className="account-dot" aria-hidden="true" />
          <span>usuario-local</span>
        </div>
      </header>

      <main className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ESPAÇO DE TRABALHO</p>
            <h1>Biblioteca</h1>
          </div>
          <div className="document-total" aria-live="polite">
            <strong>{documents.length.toString().padStart(2, '0')}</strong>
            <span>documentos</span>
          </div>
        </div>

        <div className="workspace-grid">
          <UploadComponent
            onUpload={handleUpload}
            isUploading={isUploading}
            errorMessage={uploadError}
            successMessage={uploadMessage}
          />
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            errorMessage={loadError}
            onRetry={() => setReloadVersion((version) => version + 1)}
          />
        </div>
      </main>
    </div>
  );
}