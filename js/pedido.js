const URL_PEDIDOS = "http://localhost:8080/pedidos";
const URL_CLIENTES = "http://localhost:8080/clientes";

// Redireciona se não houver token
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

function FetchPedidos() {
  fetchComToken(URL_PEDIDOS)
    .then(res => res.json())
    .then(pedidos => {
      $('#lista-pedidos').empty();
      pedidos.forEach(pedido => {
        $('#lista-pedidos').append(`
          <tr>
            <td>${pedido.id}</td>
            <td>${pedido.cliente.nome}</td>
            <td>${pedido.descricao}</td>
            <td>R$ ${pedido.valor.toFixed(2)}</td>
            <td>${pedido.status}</td>
            <td>
              <button onclick="EditarPedido(${pedido.id})" class="btn btn-warning btn-sm">Editar</button>
              <button onclick="RemoverPedido(${pedido.id})" class="btn btn-danger btn-sm">Excluir</button>
            </td>
          </tr>
        `);
      });
    });
}

function PopularClientes() {
  fetchComToken(URL_CLIENTES)
    .then(res => res.json())
    .then(clientes => {
      $('#pedido-cliente').empty();
      clientes.forEach(cliente => {
        $('#pedido-cliente').append(`<option value="${cliente.id}">${cliente.nome}</option>`);
      });
    });
}

function EditarPedido(id) {
  fetchComToken(`${URL_PEDIDOS}/${id}`)
    .then(res => res.json())
    .then(pedido => {
      $('#pedido-id').val(pedido.id);
      $('#pedido-cliente').val(pedido.cliente.id);
      $('#pedido-descricao').val(pedido.descricao);
      $('#pedido-valor').val(pedido.valor);
      $('#pedido-status').val(pedido.status);
      $('#pedido-modal').modal('show');
    });
}

function RemoverPedido(id) {
  fetchComToken(`${URL_PEDIDOS}/${id}`, {
    method: 'DELETE'
  }).then(() => FetchPedidos());
}

function CadastrarPedido() {
  const id = $('#pedido-id').val();
  const clienteId = $('#pedido-cliente').val();
  const descricao = $('#pedido-descricao').val().trim();
  const valor = parseFloat($('#pedido-valor').val());
  const status = $('#pedido-status').val();

  const pedido = {
    clienteId: parseInt(clienteId),
    descricao,
    valor,
    status
  };

  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `${URL_PEDIDOS}/${id}` : URL_PEDIDOS;

  fetchComToken(url, {
    method: metodo,
    body: JSON.stringify(pedido)
  }).then(() => {
    $('#pedido-modal').modal('hide');
    FetchPedidos();
  });
}

$(document).ready(() => {
  FetchPedidos();
  PopularClientes();

  $('#pedido-form').submit(event => {
    event.preventDefault();
    CadastrarPedido();
  });
});