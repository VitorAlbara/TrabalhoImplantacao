const LOGIN_URL = 'http://localhost:8080/auth/login'

$('#login-form').on('submit', function (e) {
  e.preventDefault()

  const email = $('#email').val().trim()
  const senha = $('#senha').val().trim()

  if (!email || !senha) {
    showError('Preencha todos os campos.')
    return
  }

  fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })
  .then(async (res) => {
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Erro ao autenticar.')
    }
    return res.json()
  })
  .then((data) => {
    if (!data.token) throw new Error('Token JWT não retornado.')

  
    localStorage.setItem('jwt', data.token)


    window.location.href = 'index.html'
  })
  .catch(err => {
    showError(err.message)
  })
})

function showError(message) {
  $('#login-error').text(message).fadeIn()
}
