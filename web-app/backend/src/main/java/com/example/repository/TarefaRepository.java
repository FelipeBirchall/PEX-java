package com.example.repository;

import com.example.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByUsuarioDesignado(String usuarioDesignado);
    List<Tarefa> findByProjetoId(Long projetoId);
    List<Tarefa> findByStatus(String status);
}