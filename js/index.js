$(document).ready(function() {
    // URL da API de produtos
    const URL_PRODUTOS = "http://localhost:5225/api/v1/produto";

    // Função de guarda: verifica se o usuário está logado
    if (!localStorage.getItem('userEmail') || !localStorage.getItem('userPassword')) {
        window.location.href = '/Login.html';
        return; // Interrompe a execução do script
    }

    // Função helper para realizar requisições com Basic Authentication
    async function fetchWithBasicAuth(url, options = {}) {
        const email = localStorage.getItem('userEmail');
        const password = localStorage.getItem('userPassword');
    
        if (!email || !password) {
            window.location.href = '/login.html';
            return Promise.reject('Credenciais não encontradas.');
        }
    
        // CORREÇÃO: Enviando as credenciais nos cabeçalhos customizados
        // em vez do cabeçalho 'Authorization'.
        options.headers = {
            ...options.headers,
            'X-User-Email': email,
            'X-User-Senha': password,
            'Content-Type': 'application/json'
        };
    
        const response = await fetch(url, options);
    
        // Se a autenticação falhar (401), limpa o cache e vai para o login
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/login.html';
        }
        return response;
    }

    // Função para buscar e exibir os produtos na tabela
    function fetchProdutos() {
        fetchWithBasicAuth(URL_PRODUTOS)
            .then(res => res.json())
            .then(produtos => {
                const tableBody = $('#body-table');
                tableBody.empty();
                produtos.forEach(produto => {
                    tableBody.append(`
                        <tr>
                            <td>${produto.nome}</td>
                            <td>${produto.descricao}</td>
                            <td>R$ ${(produto.preco || 0).toFixed(2)}</td>
                            <td>
                                <button onclick="window.editarProduto(${produto.produtoId})" class="btn btn-sm btn-warning">Editar</button>
                                <button onclick="window.abrirModalRemover(${produto.produtoId})" class="btn btn-sm btn-danger">Excluir</button>
                            </td>
                        </tr>
                    `);
                });
            });
    }

    // Expõe a função para ser chamada pelo `onclick` no HTML
    window.editarProduto = function(id) {
        fetchWithBasicAuth(`${URL_PRODUTOS}/${id}`)
            .then(res => res.json())
            .then(produto => {
                $('#produto-id').val(produto.produtoId);
                $('#produto-nome').val(produto.nome);
                $('#produto-descricao').val(produto.descricao);
                $('#produto-preco').val(produto.preco);
                $('#produto-modal-label').text('Editar Produto');
                $('#produto-modal').modal('show');
            });
    }

    // Expõe a função para abrir o modal de confirmação
    window.abrirModalRemover = function(id) {
        $('#yes-delete').data('id', id); // Armazena o ID no botão de confirmação
        $('#confirm-delete').modal('show');
    }

    // Função para remover o produto após a confirmação
    function removerProduto() {
        const id = $('#yes-delete').data('id');
        fetchWithBasicAuth(`${URL_PRODUTOS}/${id}`, { method: 'DELETE' })
            .then(() => {
                $('#confirm-delete').modal('hide');
                fetchProdutos(); // Atualiza a lista
            });
    }
    
    // Event listener para o formulário de produto (criar e editar)
    $('#produto-form').on('submit', function(e) {
        e.preventDefault();
        const id = $('#produto-id').val();
        
        const produtoData = {
            nome: $('#produto-nome').val().trim(),
            descricao: $('#produto-descricao').val().trim(),
            preco: parseFloat($('#produto-preco').val())
        };
        
        const isEditing = id ? true : false;
        const metodo = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${URL_PRODUTOS}/${id}` : URL_PRODUTOS;

        fetchWithBasicAuth(url, {
            method: metodo,
            body: JSON.stringify(produtoData)
        }).then(() => {
            $('#produto-modal').modal('hide');
            fetchProdutos(); // Atualiza a lista após salvar
        });
    });

    // Event listener para o botão de confirmação de exclusão
    $('#yes-delete').on('click', removerProduto);

    // Event listener para o botão "Novo Produto" (limpa o formulário)
    $('#insert').on('click', () => {
        $('#produto-form')[0].reset();
        $('#produto-id').val('');
        $('#produto-modal-label').text('Novo Produto');
    });

    $('#logout-button').on('click', () => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        window.location.href = 'Login.html';
    });

    // Carga inicial dos produtos
    fetchProdutos();
});