import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.model.Usuario;
import com.example.repository.UsuarioRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/register")
    public ResponseEntity<Usuario> register(@RequestBody Usuario usuario) {
        if (usuario.getNome() == null || usuario.getEmail() == null || usuario.getSenha() == null || usuario.getMatricula() == null) {
            return ResponseEntity.badRequest().build();
        }
        Usuario savedUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.status(201).body(savedUsuario);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Usuario usuario) {
        Usuario foundUsuario = usuarioRepository.findByMatriculaAndSenha(usuario.getMatricula(), usuario.getSenha());
        if (foundUsuario == null) {
            return ResponseEntity.status(401).body("Credenciais inválidas.");
        }
        return ResponseEntity.ok("Login bem-sucedido!");
    }
}