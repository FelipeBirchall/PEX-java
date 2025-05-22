const btnCadastrar = document.querySelector(".btnLogin.entrarBotao");
if (btnCadastrar && window.location.pathname.includes("cadastro.html")) {
  btnCadastrar.addEventListener("click", () => {
    const nome = document
      .querySelector('input[placeholder="Nome"]')
      .value.trim();
    const email = document
      .querySelector('input[placeholder="Email"]')
      .value.trim();
    const senha = document
      .querySelector('input[placeholder="Senha"]')
      .value.trim();
    const confirmar = document
      .querySelector('input[placeholder="Confirmar senha"]')
      .value.trim();
    const matricula = document
      .querySelector('input[placeholder="Instituição"]')
      .value.trim();

    if (!nome || !email || !senha || !confirmar || !matricula) {
      return alert("Preencha todos os campos.");
    }

    if (senha !== confirmar) {
      return alert("As senhas não coincidem.");
    }

    fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, matricula }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          alert("Cadastro realizado com sucesso!");
          window.location.href = "login.html";
        } else {
          alert(data.error || "Erro ao cadastrar.");
        }
      })
      .catch((err) => {
        console.error("Erro ao cadastrar:", err);
        alert("Erro na comunicação com o servidor.");
      });
  });
}

const entrarButton = document.querySelector(".entrarBotao");
if (entrarButton) {
  entrarButton.addEventListener("click", () => {
    const campos = document.querySelectorAll(".inputLogin");
    const matricula = campos[0].value.trim();
    const senha = campos[1].value.trim();

    fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, senha }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.usuario) {
          localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
          if (data.usuario.tipo === "admin") {
            window.location.href = "homeAdm.html";
          } else {
            window.location.href = "home.html";
          }
        } else {
          alert(data.error || "Erro ao fazer login.");
        }
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        alert("Erro na comunicação com o servidor.");
      });
  });
}

const sairLink = document.querySelector('a[href="login.html"]');
if (sairLink) {
  sairLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });
}

const cadastroButton = document.querySelector("#cadastrarBotao");
if (cadastroButton && window.location.pathname.includes("login.html")) {
  cadastroButton.addEventListener("click", () => {
    window.location.href = "cadastro.html";
  });
}

const formProjeto = document.getElementById("formProjeto");
if (formProjeto) {
  formProjeto.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const area = document.getElementById("area").value.trim();
    const vagas = parseInt(document.getElementById("vagas").value.trim());

    if (!titulo || !descricao || !area || !vagas) {
      return alert("Preencha todos os campos.");
    }

    fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao, area, vagas }),
    })
      .then((res) => res.json())
      .then((data) => {
        const msg = document.getElementById("mensagemProjeto");
        if (data.message) {
          msg.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          formProjeto.reset();
        } else {
          msg.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        }
      })
      .catch((err) => {
        console.error("Erro ao cadastrar projeto:", err);
        alert("Erro na comunicação com o servidor.");
      });
  });
}

const listaProjetos = document.getElementById("listaProjetos");

if (listaProjetos && window.location.pathname.includes("home.html")) {
  fetch("/api/projetos")
    .then((res) => res.json())
    .then((projetos) => {
      if (projetos.length === 0) {
        listaProjetos.innerHTML =
          "<p>Nenhum projeto disponível no momento.</p>";
        return;
      }

      projetos.forEach((proj) => {
        const card = document.createElement("div");
        card.classList.add("card", "mb-3", "w-75");
        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${proj.titulo}</h5>
            <p class="card-text">${proj.descricao}</p>
            <p class="card-text"><strong>Área:</strong> ${proj.area}</p>
            <p class="card-text"><strong>Vagas:</strong> ${proj.vagas}</p>
          </div>
        `;
        listaProjetos.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar projetos:", err);
      listaProjetos.innerHTML = "<p>Erro ao carregar os projetos.</p>";
    });
}
