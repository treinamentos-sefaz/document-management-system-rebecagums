import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, isLoading, errorMessage, onRetry }) {
  return (
    <section className="library-panel" aria-labelledby="library-heading">
      <div className="library-heading">
        <div>
          <p className="eyebrow">ARQUIVO LOCAL</p>
          <h2 id="library-heading">Seus documentos</h2>
        </div>
        <span className="list-count">{documents.length} itens</span>
      </div>

      {isLoading && <p className="list-state">Carregando documentos...</p>}

      {!isLoading && errorMessage && (
        <div className="list-state list-error" role="alert">
          <p>{errorMessage}</p>
          <button className="text-button" type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      )}

      {!isLoading && !errorMessage && documents.length === 0 && (
        <div className="empty-state">
          <span className="empty-mark" aria-hidden="true">0</span>
          <p>Nenhum documento ainda.</p>
        </div>
      )}

      {!isLoading && !errorMessage && documents.length > 0 && (
        <ul className="document-list">
          {documents.map((document) => (
            <li className="document-row" key={document.id}>
              <span className="document-glyph" aria-hidden="true">DOC</span>
              <div className="document-details">
                <span className="document-name" title={document.originalName}>
                  {document.originalName}
                </span>
                <span className="document-meta">
                  {formatSize(document.size)} <span aria-hidden="true">/</span> {formatDate(document.uploadedAt)}
                </span>
              </div>
              <DownloadButton documentId={document.id} fileName={document.originalName} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}