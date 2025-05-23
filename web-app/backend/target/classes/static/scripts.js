console.log("Scripts.js carregado em:", window.location.origin);

if (window.location.pathname.includes("cadastro.html")) {
  const cadastroForm = document.getElementById("cadastroForm");
  
  if (cadastroForm) {
    cadastroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const nome = document.getElementById("nome").value;
      const matricula = document.getElementById("matricula").value;
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      const confirmarSenha = document.getElementById("confirmarSenha").value;
      
      console.log("Tentativa de cadastro:", { nome, matricula, email });
      
      // Validações
      if (!nome || !matricula || !email || !senha) {
        document.getElementById("mensagem").innerHTML = 
          '<div class="alert alert-danger">Todos os campos são obrigatórios!</div>';
        return;
      }
      
      if (senha !== confirmarSenha) {
        document.getElementById("mensagem").innerHTML = 
          '<div class="alert alert-danger">As senhas não coincidem!</div>';
        return;
      }
      
      if (senha.length < 6) {
        document.getElementById("mensagem").innerHTML = 
          '<div class="alert alert-danger">A senha deve ter pelo menos 6 caracteres!</div>';
        return;
      }
      
      // Fazer requisição
      fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nome, 
          matricula, 
          email, 
          senha,
          tipo: "user" // Padrão como usuário normal
        })
      })
      .then(res => {
        console.log("Status do cadastro:", res.status);
        if (res.ok) {
          return res.json();
        } else if (res.status === 409) {
          throw new Error("Usuário já existe com este email ou matrícula");
        } else {
          throw new Error("Erro no servidor. Tente novamente.");
        }
      })
      .then(usuario => {
        console.log("Cadastro realizado:", usuario);
        document.getElementById("mensagem").innerHTML = 
          '<div class="alert alert-success">Cadastro realizado com sucesso! Redirecionando...</div>';
        
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      })
      .catch(err => {
        console.error("Erro no cadastro:", err);
        document.getElementById("mensagem").innerHTML = 
          '<div class="alert alert-danger">Erro: ' + err.message + '</div>';
      });
    });
  }
}


if (window.location.pathname.includes("login.html")) {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Email ou senha incorretos");
      })
      .then(usuario => {
        localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
        if (usuario.tipo && usuario.tipo.toLowerCase().trim() === "admin") {
          window.location.href = "homeAdm.html";
        } else {
          window.location.href = "home.html";
        }
      })
      .catch(err => {
        document.getElementById("mensagem").innerHTML = 
          '<div class="alert alert-danger">Erro: ' + err.message + '</div>';
      });
    });
  }

  // Botão cadastrar
  const cadastroButton = document.getElementById("cadastrarBotao");
  if (cadastroButton) {
    cadastroButton.addEventListener("click", () => {
      window.location.href = "cadastro.html";
    });
  }
}

// Funcionalidades da página Home (Usuário)
if (window.location.pathname.includes("home.html")) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  let isEditMode = false;

  // Carregar notificações não lidas
  function carregarNotificacoesNaoLidas() {
    fetch(`/api/notificacoes/usuario/${usuario.email}/nao-lidas`)
      .then(res => res.json())
      .then(notificacoes => {
        const badge = document.getElementById("notificationBadge");
        if (notificacoes.length > 0) {
          badge.textContent = notificacoes.length;
          badge.style.display = "inline";
        } else {
          badge.style.display = "none";
        }
      })
      .catch(err => console.error("Erro ao carregar notificações:", err));
  }

  // Formulário de projeto
  const formProjeto = document.getElementById("formProjeto");
  if (formProjeto) {
    formProjeto.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const titulo = document.getElementById("titulo").value;
      const descricao = document.getElementById("descricao").value;
      const area = document.getElementById("area").value;
      const vagas = document.getElementById("vagas").value;
      const projetoId = document.getElementById("projetoId").value;
      
      const projetoData = {
        titulo,
        descricao,
        area,
        vagas: parseInt(vagas),
        criadorEmail: usuario.email
      };
      
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/api/projetos/${projetoId}` : "/api/projetos";
      
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projetoData)
      })
      .then(res => {
        if (res.ok) {
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalProjeto'));
          modal.hide();
          carregarProjetos();
          return res.json();
        }
        throw new Error("Erro ao salvar projeto");
      })
      .catch(err => {
        console.error("Erro:", err);
        document.getElementById("mensagemProjeto").innerHTML = 
          '<div class="alert alert-danger">Erro ao salvar projeto</div>';
      });
    });
  }

  // Função para se inscrever em projeto
  window.inscreverProjeto = function(projetoId) {
    fetch("/api/inscricoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projeto: { id: projetoId },
        usuarioEmail: usuario.email
      }),
    })
      .then(res => {
        if (res.ok) {
          alert("Inscrição realizada com sucesso!");
          carregarProjetos();
        } else if (res.status === 400) {
          alert("Você já está inscrito neste projeto!");
        } else {
          throw new Error("Erro ao se inscrever");
        }
      })
      .catch(err => {
        console.error("Erro:", err);
        alert("Erro ao se inscrever no projeto");
      });
  };

  // Função para carregar projetos
  function carregarProjetos() {
    const listaProjetos = document.getElementById("listaProjetos");
    
    if (listaProjetos) {
      fetch("/api/projetos")
        .then(res => res.json())
        .then(projetos => {
          listaProjetos.innerHTML = "";
          
          if (projetos.length === 0) {
            listaProjetos.innerHTML = '<p class="text-center">Nenhum projeto disponível.</p>';
            return;
          }
          
          projetos.forEach(projeto => {
            const isOwner = projeto.criadorEmail === usuario.email;
            
            const col = document.createElement("div");
            col.classList.add("col-md-6", "col-lg-4", "mb-4");
            
            col.innerHTML = `
              <div class="card h-100">
                <div class="card-body">
                  <h5 class="card-title">${projeto.titulo}</h5>
                  <p class="card-text">${projeto.descricao}</p>
                  <p class="text-muted">
                    <strong>Área:</strong> ${projeto.area}<br>
                    <strong>Vagas:</strong> ${projeto.vagas}<br>
                    <strong>Criador:</strong> ${projeto.criadorEmail}
                  </p>
                  ${isOwner ? `
                    <button class="btn btn-warning btn-sm me-2" onclick="editarProjeto(${projeto.id})">
                      <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletarProjeto(${projeto.id})">
                      <i class="bi bi-trash"></i> Excluir
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-sm" onclick="inscreverProjeto(${projeto.id})">
                      <i class="bi bi-person-plus"></i> Inscrever-se
                    </button>
                  `}
                </div>
              </div>
            `;
            listaProjetos.appendChild(col);
          });
        })
        .catch(err => {
          console.error("Erro ao carregar projetos:", err);
          listaProjetos.innerHTML = '<p class="text-center text-danger">Erro ao carregar projetos.</p>';
        });
    }
  }

  // Função para editar projeto
  window.editarProjeto = function(id) {
    fetch(`/api/projetos`)
      .then(res => res.json())
      .then(projetos => {
        const projeto = projetos.find(p => p.id === id);
        if (projeto && projeto.criadorEmail === usuario.email) {
          document.getElementById("projetoId").value = projeto.id;
          document.getElementById("titulo").value = projeto.titulo;
          document.getElementById("descricao").value = projeto.descricao;
          document.getElementById("area").value = projeto.area;
          document.getElementById("vagas").value = projeto.vagas;
          
          document.getElementById("modalProjetoTitle").textContent = "Editar Projeto";
          document.getElementById("btnSalvarProjeto").textContent = "Salvar Alterações";
          isEditMode = true;
          
          const modal = new bootstrap.Modal(document.getElementById('modalProjeto'));
          modal.show();
        }
      })
      .catch(err => {
        console.error("Erro ao buscar projeto:", err);
        alert("Erro ao carregar dados do projeto");
      });
  };

  // Função para deletar projeto
  window.deletarProjeto = function(id) {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

    fetch(`/api/projetos/${id}?criadorEmail=${usuario.email}`, {
      method: "DELETE"
    })
      .then(res => {
        if (res.ok) {
          alert("Projeto excluído com sucesso!");
          carregarProjetos();
        } else if (res.status === 403) {
          alert("Você não tem permissão para excluir este projeto!");
        } else {
          throw new Error("Erro ao excluir projeto");
        }
      })
      .catch(err => {
        console.error("Erro:", err);
        alert("Erro ao excluir projeto");
      });
  };

  // Resetar modal ao fechar
  const modalProjeto = document.getElementById('modalProjeto');
  if (modalProjeto) {
    modalProjeto.addEventListener('hidden.bs.modal', function () {
      document.getElementById("formProjeto").reset();
      document.getElementById("projetoId").value = "";
      document.getElementById("modalProjetoTitle").textContent = "Criar Novo Projeto";
      document.getElementById("btnSalvarProjeto").textContent = "Criar Projeto";
      document.getElementById("mensagemProjeto").innerHTML = "";
      isEditMode = false;
    });
  }

  // Carregar dados iniciais
  carregarProjetos();
  carregarNotificacoesNaoLidas();
}

// Logout
const sairLink = document.querySelector('a[href="login.html"]');
if (sairLink) {
  sairLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });
}

// Funcionalidades da página HomeAdm (Admin)
if (window.location.pathname.includes("homeAdm.html")) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  // Carregar projetos para admin
  function carregarProjetosAdmin() {
    const listaProjetos = document.getElementById("listaProjetosAdmin");
    
    if (listaProjetos) {
      listaProjetos.innerHTML = "<p>Carregando projetos...</p>";
      
      fetch("/api/projetos")
        .then(res => res.json())
        .then(projetos => {
          listaProjetos.innerHTML = "";
          
          if (projetos.length === 0) {
            listaProjetos.innerHTML = "<p>Nenhum projeto disponível.</p>";
            return;
          }

          projetos.forEach(proj => {
            const isResponsavel = proj.adminResponsavel === usuario.email;
            const temResponsavel = proj.adminResponsavel != null;
            
            const card = document.createElement("div");
            card.classList.add("card", "mb-3");
            card.innerHTML = `
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 class="card-title">
                      ${proj.titulo}
                      ${isResponsavel ? '<span class="badge bg-success ms-2">Você é responsável</span>' : ''}
                      ${temResponsavel && !isResponsavel ? '<span class="badge bg-secondary ms-2">Tem responsável</span>' : ''}
                    </h5>
                    <p class="card-text">${proj.descricao}</p>
                    <p class="card-text"><strong>Área:</strong> ${proj.area}</p>
                    <p class="card-text"><strong>Vagas:</strong> ${proj.vagas}</p>
                    <p class="card-text"><small class="text-muted">Criado por: ${proj.criadorEmail}</small></p>
                    ${proj.adminResponsavel ? `<p class="card-text"><small class="text-muted">Admin responsável: ${proj.adminResponsavel}</small></p>` : ''}
                  </div>
                  <div class="btn-group-vertical">
                    ${!temResponsavel ? `
                      <button class="btn btn-sm btn-success mb-2" onclick="assumirResponsabilidade(${proj.id})">
                        Assumir Responsabilidade
                      </button>
                    ` : ''}
                    ${isResponsavel || !temResponsavel ? `
                      <button class="btn btn-sm btn-primary mb-2" onclick="gerenciarProjeto(${proj.id})">
                        Gerenciar
                      </button>
                      <button class="btn btn-sm btn-info mb-2" onclick="verInscritos(${proj.id})">
                        Ver Inscritos
                      </button>
                      <button class="btn btn-sm btn-warning" onclick="criarTarefa(${proj.id})">
                        Criar Tarefa
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
            listaProjetos.appendChild(card);
          });
        })
        .catch(err => {
          console.error("Erro ao carregar projetos:", err);
          listaProjetos.innerHTML = "<p>Erro ao carregar projetos.</p>";
        });
    }
  }

  // Assumir responsabilidade do projeto
  window.assumirResponsabilidade = function(projetoId) {
    if (!confirm("Tem certeza que deseja assumir a responsabilidade por este projeto?")) {
      return;
    }

    fetch(`/api/projetos/${projetoId}/assumir-responsabilidade?adminEmail=${usuario.email}`, {
      method: "PUT"
    })
      .then(res => {
        if (res.ok) {
          alert("Responsabilidade assumida com sucesso!");
          carregarProjetosAdmin();
        } else {
          throw new Error(`Erro HTTP ${res.status}`);
        }
      })
      .catch(err => {
        console.error("Erro ao assumir responsabilidade:", err);
        alert("Erro ao assumir responsabilidade");
      });
  };

  // Criar tarefa
  window.criarTarefa = function(projetoId) {
    const titulo = prompt("Título da tarefa:");
    const descricao = prompt("Descrição da tarefa:");
    const usuarioDesignado = prompt("Email do usuário responsável:");

    if (!titulo || !descricao || !usuarioDesignado) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    fetch("/api/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projeto: { id: projetoId },
        titulo,
        descricao,
        usuarioDesignado
      }),
    })
      .then(res => {
        if (res.ok) {
          alert("Tarefa criada e designada com sucesso!");
        } else {
          throw new Error(`Erro HTTP ${res.status}`);
        }
      })
      .catch(err => {
        console.error("Erro ao criar tarefa:", err);
        alert("Erro ao criar tarefa");
      });
  };

  // Ver inscritos
  window.verInscritos = function(projetoId) {
    fetch(`/api/inscricoes/projeto/${projetoId}`)
      .then(res => res.json())
      .then(inscricoes => {
        if (inscricoes.length === 0) {
          alert("Nenhum usuário inscrito neste projeto.");
          return;
        }

        let lista = "Usuários inscritos:\n\n";
        inscricoes.forEach(inscricao => {
          lista += `• ${inscricao.usuarioEmail} - Status: ${inscricao.status}\n`;
        });
        alert(lista);
      })
      .catch(err => {
        console.error("Erro ao carregar inscritos:", err);
        alert("Erro ao carregar inscritos");
      });
  };

  // Gerenciar projeto (ver tarefas)
  window.gerenciarProjeto = function(projetoId) {
    fetch(`/api/tarefas/projeto/${projetoId}`)
      .then(res => res.json())
      .then(tarefas => {
        if (tarefas.length === 0) {
          alert("Nenhuma tarefa criada para este projeto.");
          return;
        }

        let lista = "Tarefas do projeto:\n\n";
        tarefas.forEach(tarefa => {
          lista += `• ${tarefa.titulo}\n`;
          lista += `  Responsável: ${tarefa.usuarioDesignado}\n`;
          lista += `  Status: ${tarefa.status}\n`;
          if (tarefa.nota) {
            lista += `  Nota: ${tarefa.nota}\n`;
          }
          lista += "\n";
        });
        alert(lista);
      })
      .catch(err => {
        console.error("Erro ao carregar tarefas:", err);
        alert("Erro ao carregar tarefas");
      });
  };

  // Carregar dados iniciais
  if (document.getElementById("listaProjetosAdmin")) {
    carregarProjetosAdmin();
  }
}

// Funcionalidades da página de Tarefas
if (window.location.pathname.includes("tarefas.html")) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  function carregarMinhasTarefas() {
    const listaTarefas = document.getElementById("listaTarefas");
    
    if (listaTarefas) {
      listaTarefas.innerHTML = "<p>Carregando suas tarefas...</p>";
      
      fetch(`/api/tarefas/usuario/${usuario.email}`)
        .then(res => res.json())
        .then(tarefas => {
          listaTarefas.innerHTML = "";
          
          if (tarefas.length === 0) {
            listaTarefas.innerHTML = "<p>Você não possui tarefas designadas.</p>";
            return;
          }

          tarefas.forEach(tarefa => {
            const card = document.createElement("div");
            card.classList.add("card", "mb-3");
            
            let statusBadge = "";
            let acoes = "";
            
            if (tarefa.status === "PENDENTE") {
              statusBadge = '<span class="badge bg-warning">Pendente</span>';
              acoes = `<button class="btn btn-success btn-sm" onclick="entregarTarefa(${tarefa.id})">Entregar</button>`;
            } else if (tarefa.status === "ENTREGUE") {
              statusBadge = '<span class="badge bg-info">Entregue</span>';
              acoes = '<small class="text-muted">Aguardando correção</small>';
            } else if (tarefa.status === "AVALIADA") {
              statusBadge = '<span class="badge bg-success">Avaliada</span>';
              acoes = `<strong>Nota: ${tarefa.nota}</strong>`;
            }

            card.innerHTML = `
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 class="card-title">${tarefa.titulo} ${statusBadge}</h5>
                    <p class="card-text">${tarefa.descricao}</p>
                    <p class="card-text"><small class="text-muted">Projeto: ${tarefa.projeto.titulo}</small></p>
                    ${tarefa.resposta ? `<p class="card-text"><strong>Sua resposta:</strong> ${tarefa.resposta}</p>` : ''}
                  </div>
                  <div>
                    ${acoes}
                  </div>
                </div>
              </div>
            `;
            listaTarefas.appendChild(card);
          });
        })
        .catch(err => {
          console.error("Erro ao carregar tarefas:", err);
          listaTarefas.innerHTML = "<p>Erro ao carregar suas tarefas.</p>";
        });
    }
  }

  // Entregar tarefa
  window.entregarTarefa = function(tarefaId) {
    const resposta = prompt("Digite sua resposta/entrega:");
    if (!resposta) return;

    fetch(`/api/tarefas/${tarefaId}/entregar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resposta)
    })
      .then(res => {
        if (res.ok) {
          alert("Tarefa entregue com sucesso!");
          carregarMinhasTarefas();
        } else {
          throw new Error(`Erro HTTP ${res.status}`);
        }
      })
      .catch(err => {
        console.error("Erro ao entregar tarefa:", err);
        alert("Erro ao entregar tarefa");
      });
  };

  // Carregar tarefas
  carregarMinhasTarefas();
}

// Funcionalidades da página de Notificações
if (window.location.pathname.includes("notificações.html")) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  let filtroAtual = 'TODAS';

  function mostrarLoading() {
    document.getElementById("loadingNotificacoes").style.display = "block";
    document.getElementById("listaNotificacoes").innerHTML = "";
    document.getElementById("semNotificacoes").style.display = "none";
  }

  function esconderLoading() {
    document.getElementById("loadingNotificacoes").style.display = "none";
  }

  function mostrarSemNotificacoes(mensagem = "Você não possui notificações no momento.") {
    document.getElementById("semNotificacoes").style.display = "block";
    document.getElementById("semNotificacoes").querySelector("p").textContent = mensagem;
  }

  function carregarNotificacoes(filtro = 'TODAS') {
    console.log("Carregando notificações para:", usuario.email, "Filtro:", filtro);
    
    mostrarLoading();
    
    const url = filtro === 'NAO_LIDAS' 
      ? `/api/notificacoes/usuario/${encodeURIComponent(usuario.email)}/nao-lidas`
      : `/api/notificacoes/usuario/${encodeURIComponent(usuario.email)}`;
    
    fetch(url)
      .then(res => {
        console.log("Status da resposta:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(notificacoes => {
        console.log("Notificações recebidas:", notificacoes);
        esconderLoading();
        exibirNotificacoes(notificacoes, filtro);
      })
      .catch(err => {
        console.error("Erro ao carregar notificações:", err);
        esconderLoading();
        exibirErro(err.message);
      });
  }

  function exibirNotificacoes(notificacoes, filtro) {
    const listaNotificacoes = document.getElementById("listaNotificacoes");
    listaNotificacoes.innerHTML = "";
    
    if (notificacoes.length === 0) {
      const mensagem = filtro === 'NAO_LIDAS' 
        ? "Você não possui notificações não lidas."
        : "Você não possui notificações no momento.";
      mostrarSemNotificacoes(mensagem);
      return;
    }

    notificacoes.forEach((notif, index) => {
      const col = document.createElement("div");
      col.classList.add("col-12", "mb-3");
      
      const dataFormatada = new Date(notif.dataCriacao).toLocaleString('pt-BR');
      const isNova = !notif.lida;
      
      col.innerHTML = `
        <div class="card ${isNova ? 'border-primary shadow-sm' : ''}" style="transition: all 0.3s;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                  <span class="badge bg-${getTipoBadgeColor(notif.tipo)} me-2">
                    <i class="bi bi-${getTipoIcon(notif.tipo)}"></i> ${notif.tipo}
                  </span>
                  ${isNova ? '<span class="badge bg-primary">Nova</span>' : ''}
                </div>
                <h6 class="card-title mb-2 ${isNova ? 'fw-bold' : ''}">
                  ${notif.titulo}
                </h6>
                <p class="card-text text-muted">
                  ${notif.mensagem}
                </p>
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>
                  ${dataFormatada}
                </small>
              </div>
              <div class="ms-3">
                ${isNova ? `
                  <button class="btn btn-sm btn-outline-primary" onclick="marcarComoLida(${notif.id})" title="Marcar como lida">
                    <i class="bi bi-check"></i>
                  </button>
                ` : `
                  <i class="bi bi-check-circle-fill text-success" title="Já lida"></i>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
      listaNotificacoes.appendChild(col);
    });
  }

  function exibirErro(mensagemErro) {
    const listaNotificacoes = document.getElementById("listaNotificacoes");
    listaNotificacoes.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          <h4><i class="bi bi-exclamation-triangle"></i> Erro ao carregar notificações!</h4>
          <p><strong>Detalhes:</strong> ${mensagemErro}</p>
          <button class="btn btn-primary" onclick="carregarNotificacoes('${filtroAtual}')">
            <i class="bi bi-arrow-clockwise"></i> Tentar novamente
          </button>
        </div>
      </div>
    `;
  }

  // Função para determinar cor do badge baseado no tipo
  function getTipoBadgeColor(tipo) {
    switch(tipo) {
        case 'INSCRICAO': return 'success';
        case 'TAREFA': return 'warning';
        case 'ENTREGA': return 'info';
        case 'NOTA': return 'primary';
        case 'COMENTARIO': return 'secondary';
        default: return 'dark';
    }
}

  // Função para determinar ícone baseado no tipo
  function getTipoIcon(tipo) {
    switch(tipo) {
        case 'INSCRICAO': return 'person-plus';
        case 'TAREFA': return 'list-task';
        case 'ENTREGA': return 'upload';
        case 'NOTA': return 'star';
        case 'COMENTARIO': return 'chat-dots';
        default: return 'bell';
    }
}

  // Filtrar notificações
  window.filtrarNotificacoes = function(filtro) {
    filtroAtual = filtro;
    
    // Atualizar botões ativos
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    carregarNotificacoes(filtro);
  };

  // Marcar como lida
  window.marcarComoLida = function(notifId) {
    console.log("Marcando notificação como lida:", notifId);
    
    fetch(`/api/notificacoes/${notifId}/marcar-lida`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        console.log("Notificação marcada como lida com sucesso");
        // Recarregar lista
        carregarNotificacoes(filtroAtual);
      })
      .catch(err => {
        console.error("Erro ao marcar notificação:", err);
        alert("Erro ao marcar notificação como lida. Tente novamente.");
      });
  };

  // Marcar todas como lidas
  window.marcarTodasComoLidas = function() {
    if (!confirm("Tem certeza que deseja marcar todas as notificações como lidas?")) {
      return;
    }

    // Buscar todas as não lidas primeiro
    fetch(`/api/notificacoes/usuario/${encodeURIComponent(usuario.email)}/nao-lidas`)
      .then(res => res.json())
      .then(notificacoes => {
        if (notificacoes.length === 0) {
          alert("Não há notificações não lidas.");
          return;
        }

        // Marcar cada uma como lida
        const promises = notificacoes.map(notif => 
          fetch(`/api/notificacoes/${notif.id}/marcar-lida`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
          })
        );

        Promise.all(promises)
          .then(() => {
            alert(`${notificacoes.length} notificações marcadas como lidas!`);
            carregarNotificacoes(filtroAtual);
          })
          .catch(err => {
            console.error("Erro ao marcar todas:", err);
            alert("Erro ao marcar algumas notificações. Tente novamente.");
          });
      })
      .catch(err => {
        console.error("Erro ao buscar notificações:", err);
        alert("Erro ao buscar notificações não lidas.");
      });
  };

  // Carregar notificações ao inicializar
  console.log("Inicializando página de notificações");
  carregarNotificacoes();
}

// Funcionalidades da página NotasAdm (Admin)
if (window.location.pathname.includes("notasAdm.html")) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    let tarefaAtualParaAvaliar = null;
    let filtroAtual = 'TODAS';

    // Carregar todas as tarefas para avaliação
    function carregarTarefasParaAvaliacao(filtro = 'TODAS') {
        const listaTarefas = document.getElementById("listaTarefasAdmin");
        
        if (listaTarefas) {
            listaTarefas.innerHTML = "<p>Carregando tarefas...</p>";
            
            // Buscar todas as tarefas de todos os projetos
            fetch("/api/tarefas")
                .then(res => res.json())
                .then(tarefas => {
                    // Filtrar tarefas baseado no filtro selecionado
                    let tarefasFiltradas = tarefas;
                    if (filtro === 'ENTREGUE') {
                        tarefasFiltradas = tarefas.filter(t => t.status === 'ENTREGUE');
                    } else if (filtro === 'AVALIADA') {
                        tarefasFiltradas = tarefas.filter(t => t.status === 'AVALIADA');
                    }

                    listaTarefas.innerHTML = "";
                    
                    if (tarefasFiltradas.length === 0) {
                        listaTarefas.innerHTML = `
                            <div class="col-12">
                                <div class="alert alert-info">
                                    <h4>Nenhuma tarefa encontrada!</h4>
                                    <p>Não há tarefas ${filtro === 'ENTREGUE' ? 'para corrigir' : filtro === 'AVALIADA' ? 'avaliadas' : 'disponíveis'} no momento.</p>
                                </div>
                            </div>
                        `;
                        return;
                    }

                    tarefasFiltradas.forEach(tarefa => {
                        const col = document.createElement("div");
                        col.classList.add("col-md-6", "col-lg-4", "mb-4");
                        
                        let statusBadge = "";
                        let acoesBotoes = "";
                        
                        if (tarefa.status === "PENDENTE") {
                            statusBadge = '<span class="badge bg-warning">Pendente</span>';
                            acoesBotoes = '<small class="text-muted">Aguardando entrega do aluno</small>';
                        } else if (tarefa.status === "ENTREGUE") {
                            statusBadge = '<span class="badge bg-info">Entregue</span>';
                            acoesBotoes = `
                                <button class="btn btn-success btn-sm" onclick="abrirModalAvaliacao(${tarefa.id})">
                                    <i class="bi bi-check-circle"></i> Avaliar
                                </button>
                            `;
                        } else if (tarefa.status === "AVALIADA") {
                            statusBadge = '<span class="badge bg-success">Avaliada</span>';
                            acoesBotoes = `
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="fw-bold text-success">Nota: ${tarefa.nota}</span>
                                    <button class="btn btn-outline-primary btn-sm" onclick="reavaliarTarefa(${tarefa.id})">
                                        Reeditar
                                    </button>
                                </div>
                            `;
                        }

                        col.innerHTML = `
                            <div class="card h-100">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0">${tarefa.titulo}</h6>
                                    ${statusBadge}
                                </div>
                                <div class="card-body">
                                    <p class="card-text">${tarefa.descricao}</p>
                                    <p class="card-text">
                                        <small class="text-muted">
                                            <strong>Projeto:</strong> ${tarefa.projeto ? tarefa.projeto.titulo : 'N/A'}<br>
                                            <strong>Aluno:</strong> ${tarefa.usuarioDesignado}<br>
                                            <strong>Criada em:</strong> ${new Date(tarefa.dataCriacao).toLocaleDateString()}
                                            ${tarefa.dataEntrega ? `<br><strong>Entregue em:</strong> ${new Date(tarefa.dataEntrega).toLocaleDateString()}` : ''}
                                        </small>
                                    </p>
                                    ${tarefa.resposta ? `
                                        <div class="border-top pt-2">
                                            <strong>Resposta do aluno:</strong>
                                            <p class="text-muted">${tarefa.resposta}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="card-footer">
                                    ${acoesBotoes}
                                </div>
                            </div>
                        `;
                        listaTarefas.appendChild(col);
                    });
                })
                .catch(err => {
                    console.error("Erro ao carregar tarefas:", err);
                    listaTarefas.innerHTML = `
                        <div class="col-12">
                            <div class="alert alert-danger">
                                <h4>Erro ao carregar tarefas!</h4>
                                <p>Ocorreu um erro ao buscar as tarefas. Tente novamente.</p>
                            </div>
                        </div>
                    `;
                });
        }
    }

    // Filtrar tarefas
    window.filtrarTarefas = function(filtro) {
        filtroAtual = filtro;
        
        // Atualizar botões ativos
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        carregarTarefasParaAvaliacao(filtro);
    };

    // Abrir modal de avaliação
    window.abrirModalAvaliacao = function(tarefaId) {
        // Buscar detalhes da tarefa
        fetch("/api/tarefas")
            .then(res => res.json())
            .then(tarefas => {
                const tarefa = tarefas.find(t => t.id === tarefaId);
                if (!tarefa) {
                    alert("Tarefa não encontrada!");
                    return;
                }

                tarefaAtualParaAvaliar = tarefa;
                
                // Preencher modal com detalhes da tarefa
                const detalheTarefa = document.getElementById("detalheTarefa");
                detalheTarefa.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h5>${tarefa.titulo}</h5>
                            <p><strong>Descrição:</strong> ${tarefa.descricao}</p>
                            <p><strong>Projeto:</strong> ${tarefa.projeto ? tarefa.projeto.titulo : 'N/A'}</p>
                            <p><strong>Aluno:</strong> ${tarefa.usuarioDesignado}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Data de criação:</strong> ${new Date(tarefa.dataCriacao).toLocaleString()}</p>
                            <p><strong>Data de entrega:</strong> ${new Date(tarefa.dataEntrega).toLocaleString()}</p>
                            ${tarefa.nota ? `<p><strong>Nota atual:</strong> ${tarefa.nota}</p>` : ''}
                        </div>
                    </div>
                    <div class="mt-3">
                        <h6>Resposta do Aluno:</h6>
                        <div class="border p-3 bg-light">
                            ${tarefa.resposta || 'Nenhuma resposta fornecida.'}
                        </div>
                    </div>
                `;

                // Limpar campos
                document.getElementById("notaTarefa").value = tarefa.nota || '';
                document.getElementById("comentarioAvaliacao").value = '';

                // Abrir modal
                new bootstrap.Modal(document.getElementById('modalAvaliarTarefa')).show();
            })
            .catch(err => {
                console.error("Erro ao buscar tarefa:", err);
                alert("Erro ao carregar detalhes da tarefa");
            });
    };

    // Reavaliar tarefa (mesmo que avaliar, mas com dados preenchidos)
    window.reavaliarTarefa = function(tarefaId) {
        abrirModalAvaliacao(tarefaId);
    };

    // Salvar nota
    const btnSalvarNota = document.getElementById("btnSalvarNota");
    if (btnSalvarNota) {
        btnSalvarNota.addEventListener("click", () => {
            const nota = parseFloat(document.getElementById("notaTarefa").value);
            const comentario = document.getElementById("comentarioAvaliacao").value.trim();

            if (isNaN(nota) || nota < 0 || nota > 10) {
                alert("Por favor, insira uma nota válida entre 0 e 10.");
                return;
            }

            if (!tarefaAtualParaAvaliar) {
                alert("Erro: nenhuma tarefa selecionada.");
                return;
            }

            // Salvar avaliação
            fetch(`/api/tarefas/${tarefaAtualParaAvaliar.id}/avaliar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nota)
            })
                .then(res => {
                    if (res.ok) {
                        // Se houver comentário, você pode criar uma notificação adicional
                        if (comentario) {
                            const notificacaoComentario = {
                                usuarioEmail: tarefaAtualParaAvaliar.usuarioDesignado,
                                titulo: "Comentário da avaliação",
                                mensagem: `Comentário sobre a tarefa "${tarefaAtualParaAvaliar.titulo}": ${comentario}`,
                                tipo: "COMENTARIO"
                            };
                            
                            fetch("/api/notificacoes", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(notificacaoComentario)
                            });
                        }

                        alert("Nota salva com sucesso!");
                        bootstrap.Modal.getInstance(document.getElementById('modalAvaliarTarefa')).hide();
                        carregarTarefasParaAvaliacao(filtroAtual);
                        tarefaAtualParaAvaliar = null;
                    } else {
                        throw new Error(`Erro HTTP ${res.status}`);
                    }
                })
                .catch(err => {
                    console.error("Erro ao salvar nota:", err);
                    alert("Erro ao salvar a nota. Tente novamente.");
                });
        });
    }

    // Carregar tarefas ao carregar a página
    carregarTarefasParaAvaliacao();
}

// Funcionalidades da página de Projetos
if (window.location.pathname.includes("projetos.html")) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    // Carregar meus projetos (criados por mim)
    function carregarMeusProjetos() {
        const meusProjetos = document.getElementById("meusProjetosLista");
        
        if (meusProjetos) {
            meusProjetos.innerHTML = "<p>Carregando seus projetos...</p>";
            
            fetch("/api/projetos")
                .then(res => res.json())
                .then(projetos => {
                    const projetosCriados = projetos.filter(p => p.criadorEmail === usuario.email);
                    
                    meusProjetos.innerHTML = "";
                    
                    if (projetosCriados.length === 0) {
                        meusProjetos.innerHTML = `
                            <div class="alert alert-info">
                                <h4>Nenhum projeto criado</h4>
                                <p>Você ainda não criou nenhum projeto. <a href="home.html">Clique aqui para criar um</a>.</p>
                            </div>
                        `;
                        return;
                    }

                    projetosCriados.forEach(projeto => {
                        const card = document.createElement("div");
                        card.classList.add("card", "mb-3");
                        card.innerHTML = `
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 class="card-title">${projeto.titulo}</h5>
                                        <p class="card-text">${projeto.descricao}</p>
                                        <p class="card-text">
                                            <small class="text-muted">
                                                <strong>Área:</strong> ${projeto.area} | 
                                                <strong>Vagas:</strong> ${projeto.vagas}
                                                ${projeto.adminResponsavel ? `<br><strong>Admin Responsável:</strong> ${projeto.adminResponsavel}` : ''}
                                            </small>
                                        </p>
                                    </div>
                                    <button class="btn btn-primary" onclick="verDetalhesProjeto(${projeto.id})">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        `;
                        meusProjetos.appendChild(card);
                    });
                })
                .catch(err => {
                    console.error("Erro ao carregar projetos:", err);
                    meusProjetos.innerHTML = "<p class='text-danger'>Erro ao carregar seus projetos.</p>";
                });
        }
    }

    // Carregar projetos em que participo
    function carregarProjetosParticipando() {
        const projetosParticipando = document.getElementById("projetosParticipandoLista");
        
        if (projetosParticipando) {
            projetosParticipando.innerHTML = "<p>Carregando projetos em que você participa...</p>";
            
            fetch(`/api/inscricoes/usuario/${usuario.email}`)
                .then(res => res.json())
                .then(inscricoes => {
                    projetosParticipando.innerHTML = "";
                    
                    if (inscricoes.length === 0) {
                        projetosParticipando.innerHTML = `
                            <div class="alert alert-info">
                                <h4>Nenhuma participação</h4>
                                <p>Você ainda não se inscreveu em nenhum projeto. <a href="home.html">Explore projetos disponíveis</a>.</p>
                            </div>
                        `;
                        return;
                    }

                    inscricoes.forEach(inscricao => {
                        const projeto = inscricao.projeto;
                        const card = document.createElement("div");
                        card.classList.add("card", "mb-3");
                        
                        let statusBadge = "";
                        if (inscricao.status === "PENDENTE") {
                            statusBadge = '<span class="badge bg-warning">Pendente</span>';
                        } else if (inscricao.status === "ACEITO") {
                            statusBadge = '<span class="badge bg-success">Aceito</span>';
                        } else if (inscricao.status === "REJEITADO") {
                            statusBadge = '<span class="badge bg-danger">Rejeitado</span>';
                        }

                        card.innerHTML = `
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 class="card-title">${projeto.titulo} ${statusBadge}</h5>
                                        <p class="card-text">${projeto.descricao}</p>
                                        <p class="card-text">
                                            <small class="text-muted">
                                                <strong>Área:</strong> ${projeto.area} | 
                                                <strong>Criado por:</strong> ${projeto.criadorEmail}<br>
                                                <strong>Inscrito em:</strong> ${new Date(inscricao.dataInscricao).toLocaleDateString()}
                                                ${projeto.adminResponsavel ? `<br><strong>Admin Responsável:</strong> ${projeto.adminResponsavel}` : ''}
                                            </small>
                                        </p>
                                    </div>
                                    <button class="btn btn-primary" onclick="verDetalhesProjeto(${projeto.id})">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        `;
                        projetosParticipando.appendChild(card);
                    });
                })
                .catch(err => {
                    console.error("Erro ao carregar participações:", err);
                    projetosParticipando.innerHTML = "<p class='text-danger'>Erro ao carregar suas participações.</p>";
                });
        }
    }

    // Ver detalhes completos do projeto
    window.verDetalhesProjeto = function(projetoId) {
        fetch(`/api/projetos/${projetoId}/detalhes`)
            .then(res => res.json())
            .then(detalhes => {
                const modalTitle = document.getElementById("modalDetalhesTitle");
                const modalBody = document.getElementById("modalDetalhesBody");
                
                modalTitle.textContent = `Detalhes: ${detalhes.projeto.titulo}`;
                
                // Construir lista de participantes
                let participantesHtml = "<p>Nenhum participante ainda.</p>";
                if (detalhes.participantes.length > 0) {
                    participantesHtml = `
                        <ul class="list-group list-group-flush">
                            ${detalhes.participantes.map(p => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${p.usuarioEmail}
                                    <span class="badge bg-${p.status === 'ACEITO' ? 'success' : p.status === 'PENDENTE' ? 'warning' : 'danger'}">${p.status}</span>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }

                // Construir lista de tarefas
                let tarefasHtml = "<p>Nenhuma tarefa criada ainda.</p>";
                if (detalhes.tarefas.length > 0) {
                    tarefasHtml = `
                        <ul class="list-group list-group-flush">
                            ${detalhes.tarefas.map(t => `
                                <li class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="mb-1">${t.titulo}</h6>
                                            <p class="mb-1">${t.descricao}</p>
                                            <small>Designado para: ${t.usuarioDesignado}</small>
                                        </div>
                                        <div class="text-end">
                                            <span class="badge bg-${t.status === 'AVALIADA' ? 'success' : t.status === 'ENTREGUE' ? 'info' : 'warning'}">${t.status}</span>
                                            ${t.nota ? `<br><small>Nota: ${t.nota}</small>` : ''}
                                        </div>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }

                modalBody.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Informações do Projeto</h6>
                            <p><strong>Descrição:</strong> ${detalhes.projeto.descricao}</p>
                            <p><strong>Área:</strong> ${detalhes.projeto.area}</p>
                            <p><strong>Vagas:</strong> ${detalhes.projeto.vagas}</p>
                            <p><strong>Criado por:</strong> ${detalhes.projeto.criadorEmail}</p>
                            ${detalhes.projeto.adminResponsavel ? `<p><strong>Admin Responsável:</strong> ${detalhes.projeto.adminResponsavel}</p>` : ''}
                        </div>
                        <div class="col-md-6">
                            <h6>Estatísticas</h6>
                            <p><strong>Participantes:</strong> ${detalhes.participantes.length}</p>
                            <p><strong>Tarefas:</strong> ${detalhes.tarefas.length}</p>
                            <p><strong>Nota Geral do Grupo:</strong> 
                                <span class="badge bg-${detalhes.notaGeral >= 7 ? 'success' : detalhes.notaGeral >= 5 ? 'warning' : 'danger'} fs-6">
                                    ${detalhes.notaGeral.toFixed(1)}
                                </span>
                            </p>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Participantes (${detalhes.participantes.length})</h6>
                            ${participantesHtml}
                        </div>
                        <div class="col-md-6">
                            <h6>Tarefas (${detalhes.tarefas.length})</h6>
                            ${tarefasHtml}
                        </div>
                    </div>
                `;
                
                new bootstrap.Modal(document.getElementById('modalDetalhesProjeto')).show();
            })
            .catch(err => {
                console.error("Erro ao carregar detalhes:", err);
                alert("Erro ao carregar detalhes do projeto");
            });
    };

    // Carregar dados ao inicializar a página
    carregarMeusProjetos();
    carregarProjetosParticipando();
}
