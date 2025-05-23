package com.example.controller;

import com.example.model.Inscricao;
import com.example.model.Notificacao;
import com.example.model.Projeto;
import com.example.repository.InscricaoRepository;
import com.example.repository.NotificacaoRepository;
import com.example.repository.ProjetoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inscricoes")
@CrossOrigin(origins = "*")
public class InscricaoController {

    @Autowired
    private InscricaoRepository inscricaoRepository;
    
    @Autowired
    private ProjetoRepository projetoRepository;
    
    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @PostMapping
    public ResponseEntity<Inscricao> inscreverProjeto(@RequestBody Inscricao inscricao) {
        try {
            // Verificar se já está inscrito
            Optional<Inscricao> inscricaoExistente = inscricaoRepository
                .findByProjetoIdAndUsuarioEmail(inscricao.getProjeto().getId(), inscricao.getUsuarioEmail());
            
            if (inscricaoExistente.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Buscar o projeto completo
            Optional<Projeto> projetoOpt = projetoRepository.findById(inscricao.getProjeto().getId());
            if (projetoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            inscricao.setProjeto(projetoOpt.get());
            Inscricao savedInscricao = inscricaoRepository.save(inscricao);

            // Criar notificação para o usuário
            Notificacao notificacao = new Notificacao(
                inscricao.getUsuarioEmail(),
                "Inscrição realizada",
                "Você se inscreveu no projeto: " + projetoOpt.get().getTitulo(),
                "INSCRICAO"
            );
            notificacaoRepository.save(notificacao);

            return ResponseEntity.status(201).body(savedInscricao);
        } catch (Exception e) {
            System.err.println("Erro ao inscrever: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/usuario/{email}")
    public ResponseEntity<List<Inscricao>> getInscricoesByUsuario(@PathVariable String email) {
        List<Inscricao> inscricoes = inscricaoRepository.findByUsuarioEmail(email);
        return ResponseEntity.ok(inscricoes);
    }

    @GetMapping("/projeto/{projetoId}")
    public ResponseEntity<List<Inscricao>> getInscricoesByProjeto(@PathVariable Long projetoId) {
        List<Inscricao> inscricoes = inscricaoRepository.findByProjetoId(projetoId);
        return ResponseEntity.ok(inscricoes);
    }
}