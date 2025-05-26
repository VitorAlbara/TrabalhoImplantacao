const URL_CLIENTES = "http://localhost:8080/clientes";

if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

async function fetchComToken(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  options.headers = {
    ...options.headers,
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }

  return response;
}

function FetchRegistros() {
  fetchComToken(URL_CLIENTES)
    .then(res => res.json())
    .then(clientes => {
      $('#lista-clientes').empty();
      clientes.forEach(cliente => {
        $('#lista-clientes').append(`
          <tr>
            <td>${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.cpf}</td>
            <td>${cliente.telefone}</td>
            <td>
              <button onclick="EditarCliente(${cliente.id})" class="btn btn-warning btn-sm">Editar</button>
              <button onclick="RemoverCliente(${cliente.id})" class="btn btn-danger btn-sm">Excluir</button>
            </td>
          </tr>
        `);
      });
    });
}

function EditarCliente(id) {
  fetchComToken(`${URL_CLIENTES}/${id}`)
    .then(res => res.json())
    .then(cliente => {
      $('#cliente-id').val(cliente.id);
      $('#cliente-nome').val(cliente.nome);
      $('#cliente-cpf').val(cliente.cpf);
      $('#cliente-telefone').val(cliente.telefone);
      $('#cliente-modal').modal('show');
    });
}

function RemoverCliente(id) {
  fetchComToken(`${URL_CLIENTES}/${id}`, {
    method: 'DELETE'
  }).then(() => FetchRegistros());
}

function CadastrarCliente() {
  const id = $('#cliente-id').val();
  const nome = $('#cliente-nome').val().trim();
  const cpf = $('#cliente-cpf').val().trim();
  const telefone = $('#cliente-telefone').val().trim();

  const cliente = { nome, cpf, telefone };

  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `${URL_CLIENTES}/${id}` : URL_CLIENTES;

  fetchComToken(url, {
    method: metodo,
    body: JSON.stringify(cliente)
  }).then(() => {
    $('#cliente-modal').modal('hide');
    FetchRegistros();
  });
}

$(document).ready(() => {
  FetchRegistros();

  $('#cliente-form').submit(event => {
    event.preventDefault();
    CadastrarCliente();
  });
});
