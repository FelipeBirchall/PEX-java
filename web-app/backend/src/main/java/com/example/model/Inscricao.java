package com.example.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Inscricao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;
    
    private String usuarioEmail;
    private LocalDateTime dataInscricao;
    private String status; // "PENDENTE", "ACEITO", "REJEITADO"

    public Inscricao() {
        this.dataInscricao = LocalDateTime.now();
        this.status = "PENDENTE";
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Projeto getProjeto() { return projeto; }
    public void setProjeto(Projeto projeto) { this.projeto = projeto; }

    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }

    public LocalDateTime getDataInscricao() { return dataInscricao; }
    public void setDataInscricao(LocalDateTime dataInscricao) { this.dataInscricao = dataInscricao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}