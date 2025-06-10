$(document).ready(function() {
  const LOGIN_URL = 'http://localhost:5225/api/v1/usuario/login';

  // Se o usuário já está logado, redireciona para o index
  if (localStorage.getItem('userEmail') && localStorage.getItem('userPassword')) {
      window.location.href = 'index.html';
  }

  $('#login-form').on('submit', function (e) {
      e.preventDefault();

      const email = $('#email').val().trim();
      const senha = $('#senha').val().trim();

      if (!email || !senha) {
          showError('Preencha todos os campos.');
          return;
      }

      fetch(LOGIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
      })
      .then(async (res) => {
          // Se a resposta NÃO for OK (ex: 401 Unauthorized), trata como erro.
          if (!res.ok) {
              // A resposta de erro provavelmente tem um corpo JSON com a mensagem.
              const errorData = await res.json();
              throw new Error(errorData.message || 'Erro ao autenticar.');
          }

          // CORREÇÃO: Se a resposta for OK (2xx), a lógica de sucesso é executada aqui.
          // Não há corpo para ler com res.json(), então apenas procedemos.
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userPassword', senha);
          
          window.location.href = 'index.html';
      })
      // O segundo .then() foi removido pois a lógica foi movida para o primeiro.
      .catch(err => {
          // Captura tanto erros de rede quanto os erros lançados do .then()
          showError(err.message);
      });
  });

  function showError(message) {
      $('#login-error').text(message).fadeIn();
  }
});