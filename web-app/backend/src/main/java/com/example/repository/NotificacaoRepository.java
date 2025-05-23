package com.example.repository;

import com.example.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findByUsuarioEmailOrderByDataCriacaoDesc(String usuarioEmail);
    List<Notificacao> findByUsuarioEmailAndLidaFalseOrderByDataCriacaoDesc(String usuarioEmail);
}