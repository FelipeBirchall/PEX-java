public class Projeto {
    private Long id;
    private String titulo;
    private String descricao;
    private String area;
    private Integer vagas;

    public Projeto() {
    }

    public Projeto(Long id, String titulo, String descricao, String area, Integer vagas) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.area = area;
        this.vagas = vagas;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public Integer getVagas() {
        return vagas;
    }

    public void setVagas(Integer vagas) {
        this.vagas = vagas;
    }
}