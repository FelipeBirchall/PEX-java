package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.model.Usuario;
import com.example.repository.UsuarioRepository;

@RestController
@RequestMapping("/api") 
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/register")
    public ResponseEntity<Usuario> register(@RequestBody Usuario usuario) {
        System.out.println("Cadastrando: " + usuario.getNome() + " - " + usuario.getEmail());
        
        if (usuario.getNome() == null || usuario.getEmail() == null || 
            usuario.getSenha() == null || usuario.getMatricula() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // ✅ Definir tipo padrão como "user" se não especificado
        if (usuario.getTipo() == null || usuario.getTipo().isEmpty()) {
            usuario.setTipo("user");
        }
        
        try {
            Usuario savedUsuario = usuarioRepository.save(usuario);
            System.out.println("Usuário salvo com ID: " + savedUsuario.getId() + " - Tipo: " + savedUsuario.getTipo());
            return ResponseEntity.status(201).body(savedUsuario);
        } catch (Exception e) {
            System.err.println("Erro ao salvar: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/login")
        public ResponseEntity<Usuario> login(@RequestBody Usuario usuario) {
    System.out.println("Tentativa de login com: " + usuario.getEmail());
    try {
        var usuarioOpt = usuarioRepository.findByEmailAndSenha(usuario.getEmail(), usuario.getSenha());
        if (usuarioOpt.isEmpty()) {
            System.out.println("Usuário não encontrado com email: " + usuario.getEmail());
            return ResponseEntity.status(401).build();
        }
        Usuario usuarioLogado = usuarioOpt.get();
        System.out.println("Login bem-sucedido para: " + usuarioLogado.getNome() + " (" + usuarioLogado.getTipo() + ")");
        return ResponseEntity.ok(usuarioLogado);
    } catch (Exception e) {
        System.err.println("Erro no login: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).build();
    }
}}