# Requisitos

- Geral
    [ ]  A porta utilizada pelo seu servidor deve ser a `5000`
    [ ]  Versionamento usando Git é obrigatório, crie um **repositório público** no seu perfil do GitHub
    [ ]  Faça commits a cada funcionalidade implementada
    [ ]  Utilize dotenv
- Armazenamento de dados
    [ ]  Para persistir os dados (participantes e mensagens), utilize coleções do Mongo com a biblioteca `mongodb`  
    [ ]  Se conecte ao banco usando sempre a variável de ambiente `DATABASE_URL`. Caso deixe o valor fixo ou use outra variável, a avaliação falhará   
    [ ]  Não adicione nenhum nome customizado para o banco de dados. Use o nome dado pela connection string
        

- **POST** `/participants`
    [ ]  Deve receber (pelo body do request), um parâmetro **name**, contendo o nome do participante a ser cadastrado
    [ ]  Validar: (caso algum erro seja encontrado, retornar **status 422**)
        [ ]  **name** deve ser string não vazio
    [ ]  As validações deverão ser feitas com a biblioteca `joi`
    [ ]  Impeça o cadastro de um nome que já está sendo utilizado (caso exista, retornar **status 409**)
    [ ]  Salvar o participante na coleção de nome `participants` com o MongoDB 
    [ ]  Salvar com o MongoDB uma mensagem 
    [ ]  Por fim, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status.
    
- **GET** `/participants`
    [ ]  Retornar a lista de todos os participantes
- **POST** `/messages`
    [ ]  Deve receber (pelo body da request), os parâmetros `to`, `text` e `type`
        
    [ ]  Já o `from` da mensagem, ou seja, o remetente, **não será enviado pelo body**. Será enviado pelo front através de um **header** na requisição, chamado `User`
    [ ]  Validar: (caso algum erro seja encontrado, retornar **status 422**)
        [ ]  **to** e **text** devem ser strings não vazias
        [ ]  **type** só pode ser `message` ou `private_message`
        [ ]  **from** deve ser um participante existente na lista de participantes
    [ ]  As validações deverão ser feitas com a biblioteca `joi`, com exceção da validação de um participante existente na lista de participantes (use as funções do MongoDB para isso)
    [ ]  Ao salvar essa mensagem, deve ser acrescentado o atributo **time**, contendo a hora atual no formato HH:MM:SS (utilize a biblioteca `dayjs`)
    [ ]  Por fim, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status
    [ ]  Salve a mensagem na collection de nome `messages` com o formato proposto na seção de armazenamento de dados
        
        <aside>
        ⚠️ O nome da coleção deve ser necessariamente `messages`, caso contrário a avaliação falhará
        
        </aside>
        
- **GET** `/messages`
    [ ]  Retornar as mensagens
    [ ]  Essa rota deve aceitar um parâmetro via **query string** (o que vem após a interrogação numa URL), indicando a quantidade de mensagens que gostaria de obter. Esse parâmetro deve se chamar `limit`
    [ ]  Caso não seja informado um `limit`, todas as mensagens devem ser retornadas. Caso tenha sido fornecido um `limit`, por exemplo 100, somente as últimas 100 mensagens mais recentes devem ser retornadas
    [ ]  Além disso, o back-end só deve entregar as mensagens que aquele usuário poderia ver. Ou seja, deve entregar todas as mensagens públicas, todas as mensagens privadas enviadas para ele e por ele. Para isso, o front envia um header `User` para identificar quem está fazendo a requisição
- **POST** `/status`
    [ ]  Deve receber por um **header** na requisição, chamado `User`, contendo o nome do participante a ser atualizado
    [ ]  Caso este participante não conste na lista de participantes, deve ser retornado um **status 404.** Nenhuma mensagem precisa ser retornada além do status.
    [ ]  Atualizar o atributo **lastStatus** do participante informado para o timestamp atual, utilizando `Date.now()`
    [ ]  Por fim, retornar **status 200**
- Remoção automática de usuários inativos
    [ ]  A cada 15 segundos, remova da lista de participantes os participantes que possuam um **lastStatus** de mais de 10 segundos atrás
    [ ]  Para cada participante removido, salve uma nova mensagem em memória