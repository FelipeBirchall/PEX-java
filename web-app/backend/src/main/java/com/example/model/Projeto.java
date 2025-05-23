package com.example.model;

import jakarta.persistence.*;

@Entity
public class Projeto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    private String descricao;
    private String area;
    private Integer vagas;
    private String criadorEmail;
    private String adminResponsavel; // Admin que se responsabiliza pelo projeto

    public Projeto() {}

    public Projeto(String titulo, String descricao, String area, Integer vagas, String criadorEmail) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.area = area;
        this.vagas = vagas;
        this.criadorEmail = criadorEmail;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public Integer getVagas() { return vagas; }
    public void setVagas(Integer vagas) { this.vagas = vagas; }

    public String getCriadorEmail() { return criadorEmail; }
    public void setCriadorEmail(String criadorEmail) { this.criadorEmail = criadorEmail; }

    public String getAdminResponsavel() { return adminResponsavel; }
    public void setAdminResponsavel(String adminResponsavel) { this.adminResponsavel = adminResponsavel; }
}