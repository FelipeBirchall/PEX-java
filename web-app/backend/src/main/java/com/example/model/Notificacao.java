package com.example.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String usuarioEmail;
    private String titulo;
    private String mensagem;
    private String tipo; // "INSCRICAO", "TAREFA", "ENTREGA", "NOTA"
    private LocalDateTime dataCriacao;
    private boolean lida;

    public Notificacao() {
        this.dataCriacao = LocalDateTime.now();
        this.lida = false;
    }

    public Notificacao(String usuarioEmail, String titulo, String mensagem, String tipo) {
        this();
        this.usuarioEmail = usuarioEmail;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.tipo = tipo;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public boolean isLida() { return lida; }
    public void setLida(boolean lida) { this.lida = lida; }
}