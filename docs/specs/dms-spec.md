# Especificação - Document Management System

> Especificação funcional e técnica do MVP. O plano da seção 9 descreve etapas futuras; nesta entrega, somente este documento é criado. Nenhum arquivo de backend ou frontend é implementado ou alterado.

## 1. Objetivo

Entregar uma aplicação web que permita a usuários identificados enviar, listar e baixar seus documentos, mantendo os arquivos no filesystem local e os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Envio de um arquivo por requisição.
- Listagem dos documentos associados ao usuário da requisição.
- Download de um documento pelo identificador, limitado ao usuário associado à requisição.
- Armazenamento dos binários no filesystem local da aplicação com `multer` e `diskStorage`.
- Armazenamento dos metadados em memória durante a execução do processo.
- Interface React para envio, listagem e download, consumindo a API via o prefixo `/api` do proxy do Vite.
- Configuração operacional por variáveis de ambiente.

### Fora do escopo

- Armazenamento em nuvem, banco de dados ou qualquer serviço externo.
- Persistência durável dos metadados ou recuperação do catálogo após reiniciar o processo.
- Autenticação, cadastro de usuários, autorização baseada em papéis ou gestão avançada de usuários.
- Versionamento, edição, compartilhamento, busca avançada ou exclusão de documentos.
- Upload em lote, pastas e pré-visualização de arquivos.
- Garantia de remoção automática de arquivos sem metadados após reinicialização.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo por requisição `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema deve rejeitar requisições sem arquivo, com mais de um arquivo ou com identificador de usuário ausente/inválido. |
| RF-03 | O sistema deve gravar o conteúdo recebido em disco local com nome interno gerado pelo sistema, sem usar o nome original como caminho. |
| RF-04 | Após gravar o arquivo, o sistema deve registrar em memória seus metadados, incluindo identificador único, nome original, tamanho, data de envio e dono. |
| RF-05 | O sistema deve retornar os metadados públicos do documento criado e não deve expor caminho local nem nome interno de armazenamento. |
| RF-06 | O usuário deve poder listar seus próprios documentos; documentos de outros usuários não devem aparecer na resposta. |
| RF-07 | A listagem deve retornar uma lista vazia quando o usuário ainda não tiver documentos e ordenar os resultados do mais recente para o mais antigo. |
| RF-08 | O usuário deve poder baixar um documento de sua propriedade por identificador. |
| RF-09 | O sistema deve responder como não encontrado quando o documento não existir ou não pertencer ao usuário da requisição. |
| RF-10 | O download deve preservar um nome de arquivo seguro para o cliente e transmitir o conteúdo como anexo. |
| RF-11 | Falhas de validação, limite de tamanho, leitura ou gravação devem ser convertidas em respostas HTTP previsíveis, sem revelar caminhos ou detalhes internos. |
| RF-12 | A interface deve apresentar estados de envio, carregamento, lista vazia e erro; após envio bem-sucedido, deve atualizar a listagem. |
| RF-13 | A interface deve permitir iniciar o download de um documento listado e comunicar falhas ao usuário. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os binários devem permanecer no filesystem local da aplicação, por padrão em `backend/storage`, usando `multer` com `diskStorage`. Armazenamento externo é proibido neste MVP. |
| RNF-02 | Os metadados devem permanecer em memória. Ao reiniciar o processo, o catálogo começa vazio; arquivos já gravados podem permanecer sem referência. |
| RNF-03 | A configuração deve seguir 12-Factor: porta, diretório de armazenamento e limite de upload devem ser configuráveis por variáveis de ambiente, com padrões documentados. |
| RNF-04 | O nome físico do arquivo deve ser gerado pelo sistema e não pode permitir traversal, colisão previsível ou sobrescrita por nome enviado pelo usuário. |
| RNF-05 | O nome original deve ser tratado como dado não confiável e sanitizado antes de ser usado em cabeçalhos HTTP ou apresentado na interface. |
| RNF-06 | A API deve usar JSON para respostas de sucesso de metadados e para erros, com códigos HTTP adequados. O download é uma resposta binária. |
| RNF-07 | A identidade do usuário no MVP não é autenticação. Para separar os dados, as requisições usam `X-User-Id`; o valor deve ser validado como não vazio. A proteção contra falsificação desse cabeçalho depende de uma camada de autenticação futura e não é garantida nesta fase. |
| RNF-08 | O backend deve manter o fluxo de dependências `routes -> controllers -> services -> repositories`, sem regras de negócio nas rotas e sem dependência das camadas internas de Express. |
| RNF-09 | O frontend deve usar componentes funcionais React e chamadas `fetch` através de `/api`; o proxy de desenvolvimento encaminha as chamadas ao backend. |
| RNF-10 | Os testes do backend devem usar o runner nativo `node:test` e cobrir os contratos, isolamento por usuário e falhas principais. |

## 5. Modelo de dados

### Metadados do documento

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string (UUID) | Público | Identificador único do documento. |
| `originalName` | string | Público | Nome fornecido pelo cliente, sanitizado para resposta e download. |
| `size` | number (bytes) | Público | Tamanho do conteúdo gravado. |
| `uploadedAt` | string (ISO 8601 UTC) | Público | Data e hora em que o upload foi concluído. |
| `owner` | string | Público | Identificador obtido do cabeçalho `X-User-Id`. |
| `contentType` | string | Público | Tipo informado no multipart, tratado como não confiável; usar `application/octet-stream` se ausente. |
| `storageName` | string | Interno | Nome gerado para localizar o binário no diretório de armazenamento. Não retornar na API. |

Os metadados são indexados por `id` em memória. O caminho absoluto deve ser derivado do diretório de armazenamento configurado e do `storageName`; não deve ser aceito diretamente de parâmetros ou do corpo da requisição. O objeto de resposta contém apenas os campos públicos.

### Identidade da requisição

O cabeçalho `X-User-Id` identifica o escopo do catálogo no MVP. A ausência ou valor em branco resulta em `400 Bad Request`. Esta convenção permite testar a separação por dono, mas não substitui autenticação: clientes podem declarar outro identificador enquanto não houver middleware de identidade confiável.

## 6. Contratos de API

Os caminhos abaixo são os caminhos do backend. No frontend, são chamados sob `/api` pelo proxy do Vite, por exemplo `/api/documents`.

### Formato comum de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição segura para o cliente."
  }
}
```

`code` é estável para tratamento pelo frontend. A mensagem não deve incluir stack trace, caminho local ou detalhes internos.

### `POST /upload`

- Cabeçalho obrigatório: `X-User-Id: <identificador>`.
- Entrada: `multipart/form-data` com exatamente um arquivo no campo `file`.
- Limite de tamanho: valor de `MAX_FILE_SIZE_BYTES`; padrão do MVP: `10485760` (10 MiB).
- Sucesso: `201 Created`, corpo JSON com os metadados públicos.

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "relatorio.pdf",
    "size": 24576,
    "uploadedAt": "2026-11-11T12:00:00.000Z",
    "owner": "usuario-123",
    "contentType": "application/pdf"
  }
}
```

- Erros: `400` para usuário/campo/arquivo inválido; `413` quando exceder o limite; `500` para falha inesperada de armazenamento. Se o registro em memória falhar após a gravação, o arquivo recém-gravado deve ser removido quando possível.

### `GET /documents`

- Cabeçalho obrigatório: `X-User-Id: <identificador>`.
- Entrada: sem corpo.
- Sucesso: `200 OK`, lista de metadados públicos do dono, ordenada por `uploadedAt` descendente. Sem resultados, retorna `{"data": []}`.

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "originalName": "relatorio.pdf",
      "size": 24576,
      "uploadedAt": "2026-11-11T12:00:00.000Z",
      "owner": "usuario-123",
      "contentType": "application/pdf"
    }
  ]
}
```

- Erros: `400` se `X-User-Id` estiver ausente ou em branco; `500` para falha inesperada.

### `GET /documents/:id/download`

- Cabeçalho obrigatório: `X-User-Id: <identificador>`.
- Entrada: identificador no parâmetro de rota; sem corpo.
- Sucesso: `200 OK`, conteúdo binário, `Content-Disposition: attachment` com nome seguro e `Content-Type` do documento (ou `application/octet-stream`).
- Erros: `400` para usuário inválido ou identificador malformado; `404` se não existir, não pertencer ao usuário ou o arquivo não estiver disponível; `500` para outra falha de leitura.

### Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretório local de gravação dos binários. Deve ser resolvido de forma previsível a partir da aplicação. |
| `MAX_FILE_SIZE_BYTES` | `10485760` | Limite máximo de tamanho do upload em bytes. |

## 7. Decisões arquiteturais

- **Rotas (`routes/`)**: declaram os três endpoints e conectam middleware de upload e controllers; não implementam regras de negócio.
- **Controllers (`controllers/`)**: leem parâmetros, cabeçalhos e arquivo processado; fazem validação de entrada básica, chamam services e traduzem resultados para status e respostas HTTP.
- **Services (`services/`)**: aplicam regras de propriedade, validação do caso de uso, ordenação e coordenação entre persistência de metadados e arquivo.
- **Repositories (`repositories/`)**: encapsulam o catálogo em memória e acesso ao filesystem local. Devem expor operações necessárias ao caso de uso, sem objetos Express.
- **Upload**: `multer` com `diskStorage`; destino e limite vêm da configuração. A rota deve aceitar somente o campo `file` e garantir nome interno gerado com segurança.
- **Consistência**: como arquivo e metadados não compartilham uma transação, falha ao registrar metadados exige tentativa de remover o arquivo novo. Arquivos órfãos de reinicializações ficam fora do escopo do MVP.
- **Frontend**: React organiza a experiência em páginas/componentes e centraliza chamadas HTTP em `services/`; usa `/api` e não conhece caminhos locais de armazenamento.
- **Identidade**: `X-User-Id` é um mecanismo provisório de escopo, não um controle de acesso seguro. Uma futura autenticação poderá fornecer a identidade ao invés de confiar no cabeçalho do cliente.
- **Respostas**: metadados usam envelope `{ "data": ... }`; erros usam `{ "error": { "code", "message" } }`. Caminhos internos e `storageName` nunca são públicos.

## 8. Critérios de aceite

- Upload válido retorna `201`, gera identificador e metadados e grava o conteúdo somente no armazenamento local.
- Upload sem arquivo, com campo incorreto ou acima do limite retorna o erro documentado e não deixa arquivo parcial conhecido.
- Listagem retorna somente documentos do `X-User-Id` informado e mantém a ordenação definida.
- Download do dono retorna os mesmos bytes enviados como anexo; documento inexistente ou de outro dono retorna `404`.
- Reiniciar o processo limpa o catálogo em memória, sem tentar reconstruí-lo a partir do filesystem.
- A interface consegue enviar, listar e baixar via `/api`, exibindo estados de sucesso, vazio e erro.
- Testes automatizados verificam os contratos HTTP, isolamento por dono, persistência local e tratamento de falhas.

## 9. Plano de execução

As etapas abaixo são uma proposta para trabalho posterior. Nesta tarefa, nenhuma etapa de implementação de backend ou frontend foi executada; o único artefato produzido é esta especificação.

1. Revisar e aprovar os contratos, os padrões das variáveis de ambiente e o uso provisório de `X-User-Id`.
2. Implementar a configuração e o armazenamento local do backend com `multer`/`diskStorage`, geração de nomes internos e limite de tamanho.
3. Implementar modelo e repositórios para binários locais e metadados em memória, incluindo limpeza do arquivo em falha de registro.
4. Implementar services, controllers e rotas para upload, listagem e download seguindo os contratos desta especificação.
5. Adicionar testes `node:test` para casos de sucesso, validação, limite, isolamento por dono, arquivo ausente e falhas de persistência/leitura.
6. Implementar no frontend as chamadas de serviço e os fluxos de upload, listagem, estados de interface e download via proxy `/api`.
7. Validar o fluxo integrado em ambiente local, revisar mensagens e segurança de nomes/cabeçalhos e confirmar os critérios de aceite.