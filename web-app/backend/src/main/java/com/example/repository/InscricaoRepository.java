package com.example.repository;

import com.example.model.Inscricao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {
    List<Inscricao> findByUsuarioEmail(String usuarioEmail);
    List<Inscricao> findByProjetoId(Long projetoId);
    Optional<Inscricao> findByProjetoIdAndUsuarioEmail(Long projetoId, String usuarioEmail);
}