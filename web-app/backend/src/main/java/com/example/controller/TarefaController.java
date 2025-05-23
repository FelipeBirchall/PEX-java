package com.example.controller;

import com.example.model.Notificacao;
import com.example.model.Projeto;
import com.example.model.Tarefa;
import com.example.repository.NotificacaoRepository;
import com.example.repository.ProjetoRepository;
import com.example.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tarefas")
@CrossOrigin(origins = "*")
public class TarefaController {

    @Autowired
    private TarefaRepository tarefaRepository;
    
    @Autowired
    private ProjetoRepository projetoRepository;
    
    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @GetMapping
    public ResponseEntity<List<Tarefa>> getAllTarefas() {
        List<Tarefa> tarefas = tarefaRepository.findAll();
        return ResponseEntity.ok(tarefas);
    }

    @PostMapping
    public ResponseEntity<Tarefa> criarTarefa(@RequestBody Tarefa tarefa) {
        try {
            // Buscar o projeto completo
            Optional<Projeto> projetoOpt = projetoRepository.findById(tarefa.getProjeto().getId());
            if (projetoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            tarefa.setProjeto(projetoOpt.get());
            Tarefa savedTarefa = tarefaRepository.save(tarefa);

            // Criar notificação para o usuário designado
            Notificacao notificacao = new Notificacao(
                tarefa.getUsuarioDesignado(),
                "Nova tarefa designada",
                "Você recebeu uma nova tarefa: " + tarefa.getTitulo() + " no projeto " + projetoOpt.get().getTitulo(),
                "TAREFA"
            );
            notificacaoRepository.save(notificacao);

            return ResponseEntity.status(201).body(savedTarefa);
        } catch (Exception e) {
            System.err.println("Erro ao criar tarefa: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/usuario/{email}")
    public ResponseEntity<List<Tarefa>> getTarefasByUsuario(@PathVariable String email) {
        List<Tarefa> tarefas = tarefaRepository.findByUsuarioDesignado(email);
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/projeto/{projetoId}")
    public ResponseEntity<List<Tarefa>> getTarefasByProjeto(@PathVariable Long projetoId) {
        List<Tarefa> tarefas = tarefaRepository.findByProjetoId(projetoId);
        return ResponseEntity.ok(tarefas);
    }

    @PutMapping("/{id}/entregar")
    public ResponseEntity<Tarefa> entregarTarefa(@PathVariable Long id, @RequestBody String resposta) {
        try {
            Optional<Tarefa> tarefaOpt = tarefaRepository.findById(id);
            if (tarefaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Tarefa tarefa = tarefaOpt.get();
            tarefa.setResposta(resposta);
            tarefa.setStatus("ENTREGUE");
            tarefa.setDataEntrega(LocalDateTime.now());
            
            Tarefa savedTarefa = tarefaRepository.save(tarefa);

            // Criar notificação para o criador do projeto (admin)
            Notificacao notificacao = new Notificacao(
                tarefa.getProjeto().getCriadorEmail(),
                "Tarefa entregue",
                "A tarefa '" + tarefa.getTitulo() + "' foi entregue por " + tarefa.getUsuarioDesignado(),
                "ENTREGA"
            );
            notificacaoRepository.save(notificacao);

            return ResponseEntity.ok(savedTarefa);
        } catch (Exception e) {
            System.err.println("Erro ao entregar tarefa: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/avaliar")
    public ResponseEntity<Tarefa> avaliarTarefa(@PathVariable Long id, @RequestBody Double nota) {
        try {
            Optional<Tarefa> tarefaOpt = tarefaRepository.findById(id);
            if (tarefaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Tarefa tarefa = tarefaOpt.get();
            tarefa.setNota(nota);
            tarefa.setStatus("AVALIADA");
            
            Tarefa savedTarefa = tarefaRepository.save(tarefa);

            // Criar notificação para o usuário
            Notificacao notificacao = new Notificacao(
                tarefa.getUsuarioDesignado(),
                "Tarefa avaliada",
                "Sua tarefa '" + tarefa.getTitulo() + "' foi avaliada. Nota: " + nota,
                "NOTA"
            );
            notificacaoRepository.save(notificacao);

            return ResponseEntity.ok(savedTarefa);
        } catch (Exception e) {
            System.err.println("Erro ao avaliar tarefa: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}