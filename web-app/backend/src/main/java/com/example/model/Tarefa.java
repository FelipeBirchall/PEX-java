package com.example.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Tarefa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;
    
    private String titulo;
    private String descricao;
    private String usuarioDesignado; // Email do usuário
    private LocalDateTime dataCriacao;
    private LocalDateTime dataEntrega;
    private String status; // "PENDENTE", "ENTREGUE", "AVALIADA"
    private String resposta; // Resposta do aluno
    private Double nota; // Nota dada pelo admin

    public Tarefa() {
        this.dataCriacao = LocalDateTime.now();
        this.status = "PENDENTE";
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Projeto getProjeto() { return projeto; }
    public void setProjeto(Projeto projeto) { this.projeto = projeto; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getUsuarioDesignado() { return usuarioDesignado; }
    public void setUsuarioDesignado(String usuarioDesignado) { this.usuarioDesignado = usuarioDesignado; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public LocalDateTime getDataEntrega() { return dataEntrega; }
    public void setDataEntrega(LocalDateTime dataEntrega) { this.dataEntrega = dataEntrega; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResposta() { return resposta; }
    public void setResposta(String resposta) { this.resposta = resposta; }

    public Double getNota() { return nota; }
    public void setNota(Double nota) { this.nota = nota; }
}