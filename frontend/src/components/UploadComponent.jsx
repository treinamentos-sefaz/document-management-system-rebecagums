import { useRef, useState } from 'react';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default function UploadComponent({
  onUpload,
  isUploading,
  errorMessage,
  successMessage,
}) {
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;
    setValidationError('');
    setFile(null);

    if (selectedFile && selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setValidationError('O arquivo excede o limite de 10 MiB.');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError('');

    if (!file) {
      setValidationError('Selecione um arquivo para enviar.');
      return;
    }

    const uploaded = await onUpload(file);
    if (uploaded) {
      setFile(null);
      inputRef.current.value = '';
    }
  }

  return (
    <section className="upload-panel" aria-labelledby="upload-heading">
      <div className="panel-heading">
        <p className="eyebrow">NOVO ARQUIVO</p>
        <h2 id="upload-heading">Adicionar documento</h2>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-picker" htmlFor="document-file">
          <span className="file-picker-icon" aria-hidden="true">+</span>
          <span>{file ? 'Trocar arquivo' : 'Escolher arquivo'}</span>
          <input
            ref={inputRef}
            id="document-file"
            className="visually-hidden"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {file && (
          <div className="selected-file" aria-live="polite">
            <span className="selected-file-name" title={file.name}>{file.name}</span>
            <span className="selected-file-size">
              {(file.size / (1024 * 1024)).toFixed(2)} MiB
            </span>
          </div>
        )}

        <button className="primary-button upload-submit" type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>

      {(validationError || errorMessage) && (
        <p className="form-message error-message" role="alert">
          {validationError || errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="form-message success-message" role="status">{successMessage}</p>
      )}
    </section>
  );
}