package com.example.controller;

import com.example.model.Projeto;
import com.example.model.Inscricao;
import com.example.model.Tarefa;
import com.example.repository.ProjetoRepository;
import com.example.repository.InscricaoRepository;
import com.example.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProjetoController {

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private InscricaoRepository inscricaoRepository;

    @Autowired
    private TarefaRepository tarefaRepository;

    @GetMapping("/projetos")
    public ResponseEntity<List<Projeto>> getAllProjetos() {
        List<Projeto> projetos = projetoRepository.findAll();
        return ResponseEntity.ok(projetos);
    }

    @PostMapping("/projetos")
    public ResponseEntity<Projeto> createProjeto(@RequestBody Projeto projeto) {
        System.out.println("Criando projeto: " + projeto.getTitulo() + " por " + projeto.getCriadorEmail());
        
        if (projeto.getTitulo() == null || projeto.getDescricao() == null || 
            projeto.getArea() == null || projeto.getVagas() == null || 
            projeto.getCriadorEmail() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Projeto savedProjeto = projetoRepository.save(projeto);
            System.out.println("Projeto salvo com ID: " + savedProjeto.getId());
            return ResponseEntity.status(201).body(savedProjeto);
        } catch (Exception e) {
            System.err.println("Erro ao salvar projeto: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/projetos/{id}")
    public ResponseEntity<Projeto> updateProjeto(@PathVariable Long id, @RequestBody Projeto projetoAtualizado) {
        System.out.println("Atualizando projeto ID: " + id);
        
        Optional<Projeto> projetoOpt = projetoRepository.findById(id);
        if (projetoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Projeto projetoExistente = projetoOpt.get();
        
        // Verificar se o usuário é o criador do projeto
        if (!projetoExistente.getCriadorEmail().equals(projetoAtualizado.getCriadorEmail())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        // Atualizar campos
        projetoExistente.setTitulo(projetoAtualizado.getTitulo());
        projetoExistente.setDescricao(projetoAtualizado.getDescricao());
        projetoExistente.setArea(projetoAtualizado.getArea());
        projetoExistente.setVagas(projetoAtualizado.getVagas());
        
        try {
            Projeto savedProjeto = projetoRepository.save(projetoExistente);
            return ResponseEntity.ok(savedProjeto);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar projeto: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/projetos/{id}")
    public ResponseEntity<Void> deleteProjeto(@PathVariable Long id, @RequestParam String criadorEmail) {
        System.out.println("Deletando projeto ID: " + id + " por " + criadorEmail);
        
        Optional<Projeto> projetoOpt = projetoRepository.findById(id);
        if (projetoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Projeto projeto = projetoOpt.get();
        
        // Verificar se o usuário é o criador do projeto
        if (!projeto.getCriadorEmail().equals(criadorEmail)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        try {
            projetoRepository.deleteById(id);
            System.out.println("Projeto deletado com sucesso");
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Erro ao deletar projeto: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/projetos/{id}/assumir-responsabilidade")
    public ResponseEntity<Projeto> assumirResponsabilidade(@PathVariable Long id, @RequestParam String adminEmail) {
        System.out.println("Admin " + adminEmail + " assumindo responsabilidade do projeto ID: " + id);
        
        Optional<Projeto> projetoOpt = projetoRepository.findById(id);
        if (projetoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Projeto projeto = projetoOpt.get();
        projeto.setAdminResponsavel(adminEmail);
        
        try {
            Projeto savedProjeto = projetoRepository.save(projeto);
            System.out.println("Responsabilidade assumida com sucesso");
            return ResponseEntity.ok(savedProjeto);
        } catch (Exception e) {
            System.err.println("Erro ao assumir responsabilidade: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/projetos/{id}/detalhes")
    public ResponseEntity<ProjetoDetalhes> getProjetoDetalhes(@PathVariable Long id) {
        try {
            Optional<Projeto> projetoOpt = projetoRepository.findById(id);
            if (projetoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Projeto projeto = projetoOpt.get();
            
            // Buscar participantes
            List<Inscricao> inscricoes = inscricaoRepository.findByProjetoId(id);
            
            // Buscar tarefas e calcular nota média
            List<Tarefa> tarefas = tarefaRepository.findByProjetoId(id);
            double notaMedia = tarefas.stream()
                .filter(t -> t.getNota() != null)
                .mapToDouble(Tarefa::getNota)
                .average()
                .orElse(0.0);
            
            ProjetoDetalhes detalhes = new ProjetoDetalhes();
            detalhes.setProjeto(projeto);
            detalhes.setParticipantes(inscricoes);
            detalhes.setTarefas(tarefas);
            detalhes.setNotaGeral(notaMedia);
            
            return ResponseEntity.ok(detalhes);
        } catch (Exception e) {
            System.err.println("Erro ao buscar detalhes do projeto: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    // Classe auxiliar para retornar detalhes completos
    public static class ProjetoDetalhes {
        private Projeto projeto;
        private List<Inscricao> participantes;
        private List<Tarefa> tarefas;
        private double notaGeral;
        
        // Getters e Setters
        public Projeto getProjeto() { return projeto; }
        public void setProjeto(Projeto projeto) { this.projeto = projeto; }
        
        public List<Inscricao> getParticipantes() { return participantes; }
        public void setParticipantes(List<Inscricao> participantes) { this.participantes = participantes; }
        
        public List<Tarefa> getTarefas() { return tarefas; }
        public void setTarefas(List<Tarefa> tarefas) { this.tarefas = tarefas; }
        
        public double getNotaGeral() { return notaGeral; }
        public void setNotaGeral(double notaGeral) { this.notaGeral = notaGeral; }
    }
}