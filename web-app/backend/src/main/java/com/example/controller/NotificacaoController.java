package com.example.controller;

import com.example.model.Notificacao;
import com.example.repository.NotificacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notificacoes")
@CrossOrigin(origins = "*")
public class NotificacaoController {

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @GetMapping("/usuario/{email}")
    public ResponseEntity<List<Notificacao>> getNotificacoesByUsuario(@PathVariable String email) {
        List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioEmailOrderByDataCriacaoDesc(email);
        return ResponseEntity.ok(notificacoes);
    }

    @GetMapping("/usuario/{email}/nao-lidas")
    public ResponseEntity<List<Notificacao>> getNotificacaoNaoLidas(@PathVariable String email) {
        List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioEmailAndLidaFalseOrderByDataCriacaoDesc(email);
        return ResponseEntity.ok(notificacoes);
    }

    @PostMapping
    public ResponseEntity<Notificacao> criarNotificacao(@RequestBody Notificacao notificacao) {
        try {
            Notificacao savedNotificacao = notificacaoRepository.save(notificacao);
            return ResponseEntity.status(201).body(savedNotificacao);
        } catch (Exception e) {
            System.err.println("Erro ao criar notificação: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/marcar-lida")
    public ResponseEntity<Notificacao> marcarComoLida(@PathVariable Long id) {
        try {
            Optional<Notificacao> notificacaoOpt = notificacaoRepository.findById(id);
            if (notificacaoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Notificacao notificacao = notificacaoOpt.get();
            notificacao.setLida(true);
            
            Notificacao savedNotificacao = notificacaoRepository.save(notificacao);
            return ResponseEntity.ok(savedNotificacao);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}