document.getElementById('formCadastro').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const erroDiv = document.getElementById('cadastro-erro');
  
    if (!nome || !email || !telefone || !senha) {
      erroDiv.textContent = "Preencha todos os campos.";
      erroDiv.style.display = "block";
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8080/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, telefone, senha })
      });
  
      if (!response.ok) {
        throw new Error("Erro ao cadastrar cliente.");
      }
  
      const resultado = await response.json();
      alert("Cliente cadastrado com sucesso!");
      window.location.href = "login.html";
  
    } catch (error) {
      erroDiv.textContent = error.message;
      erroDiv.style.display = "block";
    }
  });
  