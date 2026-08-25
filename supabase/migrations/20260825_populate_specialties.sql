-- Adicionar categoria Instalação
INSERT INTO categories (name) VALUES ('Instalação') ON CONFLICT DO NOTHING;

-- Garantir que as especialidades são adicionadas às suas respectivas categorias
DO $$
DECLARE
    cat_instalacao uuid;
    cat_beleza uuid;
    cat_eventos uuid;
    cat_fotografia uuid;
    cat_consultoria uuid;
    cat_servicos_digitais uuid;
    cat_agricultura uuid;
    cat_transporte uuid;
    cat_assistencia uuid;
    cat_design uuid;
    cat_educacao uuid;
    cat_servicos_empresariais uuid;
    cat_manutencao uuid;
BEGIN
    SELECT id INTO cat_instalacao FROM categories WHERE name = 'Instalação' LIMIT 1;
    SELECT id INTO cat_beleza FROM categories WHERE name = 'Beleza' LIMIT 1;
    SELECT id INTO cat_eventos FROM categories WHERE name = 'Eventos' LIMIT 1;
    SELECT id INTO cat_fotografia FROM categories WHERE name = 'Fotografia' LIMIT 1;
    SELECT id INTO cat_consultoria FROM categories WHERE name = 'Consultoria' LIMIT 1;
    SELECT id INTO cat_servicos_digitais FROM categories WHERE name = 'Serviços digitais' LIMIT 1;
    SELECT id INTO cat_agricultura FROM categories WHERE name = 'Agricultura' LIMIT 1;
    SELECT id INTO cat_transporte FROM categories WHERE name = 'Transporte' LIMIT 1;
    SELECT id INTO cat_assistencia FROM categories WHERE name = 'Assistência' LIMIT 1;
    SELECT id INTO cat_design FROM categories WHERE name = 'Design' LIMIT 1;
    SELECT id INTO cat_educacao FROM categories WHERE name = 'Educação' LIMIT 1;
    SELECT id INTO cat_servicos_empresariais FROM categories WHERE name = 'Serviços empresariais' LIMIT 1;
    SELECT id INTO cat_manutencao FROM categories WHERE name = 'Manutenção' LIMIT 1;

    -- Instalação
    IF cat_instalacao IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_instalacao, 'Electricidade'),
        (cat_instalacao, 'Instalação de câmeras'),
        (cat_instalacao, 'Redes'),
        (cat_instalacao, 'Antenas')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Beleza
    IF cat_beleza IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_beleza, 'Cabeleireiro'),
        (cat_beleza, 'Manicure / Pedicure'),
        (cat_beleza, 'Maquiador'),
        (cat_beleza, 'Esteticista'),
        (cat_beleza, 'Massagista')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Eventos
    IF cat_eventos IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_eventos, 'Organizador de Eventos'),
        (cat_eventos, 'Cerimonialista'),
        (cat_eventos, 'DJ'),
        (cat_eventos, 'Barman'),
        (cat_eventos, 'Músico')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Fotografia
    IF cat_fotografia IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_fotografia, 'Fotógrafo'),
        (cat_fotografia, 'Editor de Vídeo'),
        (cat_fotografia, 'Videomaker'),
        (cat_fotografia, 'Operador de Drone')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Consultoria
    IF cat_consultoria IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_consultoria, 'Consultor Financeiro'),
        (cat_consultoria, 'Consultor de RH'),
        (cat_consultoria, 'Consultor de Marketing'),
        (cat_consultoria, 'Advogado'),
        (cat_consultoria, 'Contabilista')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Serviços digitais
    IF cat_servicos_digitais IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_servicos_digitais, 'Gestor de Redes Sociais'),
        (cat_servicos_digitais, 'Copywriter'),
        (cat_servicos_digitais, 'Especialista de SEO'),
        (cat_servicos_digitais, 'Gestor de Tráfego')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Agricultura (Jardim e agricultura)
    IF cat_agricultura IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_agricultura, 'Jardineiro'),
        (cat_agricultura, 'Paisagista'),
        (cat_agricultura, 'Podador de árvores'),
        (cat_agricultura, 'Capinador'),
        (cat_agricultura, 'Agricultor'),
        (cat_agricultura, 'Horticultor'),
        (cat_agricultura, 'Fruticultor'),
        (cat_agricultura, 'Viveirista (plantas)'),
        (cat_agricultura, 'Trabalhador rural'),
        (cat_agricultura, 'Irrigador')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Transporte (Veículos e equipamentos)
    IF cat_transporte IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_transporte, 'Motorista'),
        (cat_transporte, 'Mecânico'),
        (cat_transporte, 'Mecânico de motos'),
        (cat_transporte, 'Mecânico de máquinas agrícolas'),
        (cat_transporte, 'Lavador de carros'),
        (cat_transporte, 'Reparador de bicicletas')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Assistência (Cuidados e apoio)
    IF cat_assistencia IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_assistencia, 'Cuidador de crianças'),
        (cat_assistencia, 'Tutor escolar'),
        (cat_assistencia, 'Acompanhante de idosos'),
        (cat_assistencia, 'Enfermeiro domiciliar'),
        (cat_assistencia, 'Auxiliar de enfermagem domiciliar')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Design
    IF cat_design IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_design, 'Designer Gráfico'),
        (cat_design, 'UI/UX Designer'),
        (cat_design, 'Designer de Interiores'),
        (cat_design, 'Ilustrador'),
        (cat_design, 'Animador 3D')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Educação
    IF cat_educacao IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_educacao, 'Professor'),
        (cat_educacao, 'Professor Particular'),
        (cat_educacao, 'Tradutor'),
        (cat_educacao, 'Revisor de Textos'),
        (cat_educacao, 'Criador de Cursos')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Serviços empresariais (Gestão e apoio)
    IF cat_servicos_empresariais IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_servicos_empresariais, 'Administrador de propriedade'),
        (cat_servicos_empresariais, 'Caseiro'),
        (cat_servicos_empresariais, 'Gestor de fazenda'),
        (cat_servicos_empresariais, 'Supervisor de manutenção'),
        (cat_servicos_empresariais, 'Comprador de suprimentos'),
        (cat_servicos_empresariais, 'Assistente Administrativo'),
        (cat_servicos_empresariais, 'Secretária')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Manutenção
    IF cat_manutencao IS NOT NULL THEN
        INSERT INTO specialties (category_id, name) VALUES
        (cat_manutencao, 'Manutenção de Computadores'),
        (cat_manutencao, 'Reparação de Eletrodomésticos'),
        (cat_manutencao, 'Ar-condicionado e Frio')
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
