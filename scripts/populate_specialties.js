require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const JOBS_CATEGORIES_MAP = {
    'Serviços domésticos': [
        'Governanta doméstica', 'Empregada doméstica', 'Faxineira', 'Auxiliar de limpeza', 
        'Lavadeira', 'Passadeira de roupa', 'Cozinheiro(a)', 'Ajudante de cozinha', 
        'Babá', 'Cuidador de idosos', 'Chef ao domicílio', 'Arrumadeira', 
        'Personal Organizer', 'Limpeza pós-obra', 'Limpeza de estofos', 'Limpeza de tapetes'
    ],
    'Cuidados e apoio': [
        'Cuidador de crianças', 'Tutor escolar', 'Acompanhante de idosos', 
        'Enfermeiro domiciliar', 'Auxiliar de enfermagem domiciliar', 'Fisioterapeuta domiciliar',
        'Terapeuta da fala', 'Psicólogo clínico', 'Acompanhante hospitalar', 'Cuidador paliativo'
    ],
    'Construção e reparos': [
        'Pedreiro', 'Servente de pedreiro', 'Carpinteiro', 'Marceneiro', 
        'Serralheiro', 'Soldador', 'Pintor', 'Azulejista', 'Gesseiro', 'Telhadista',
        'Canalizador', 'Electricista', 'Engenheiro Civil', 'Arquiteto', 'Topógrafo',
        'Estucador', 'Taqueiro', 'Impermeabilizador', 'Montador de andaimes', 'Vidraceiro',
        'Calceiteiro', 'Técnico de pladur', 'Aplicador de papel de parede', 'Demolidor'
    ],
    'Instalações e manutenção': [
        'Técnico de ar-condicionado', 'Técnico de refrigeração', 'Técnico de eletrodomésticos', 
        'Técnico de bombas de água', 'Instalador de painéis solares', 'Instalador de antenas', 
        'Instalador de internet', 'Técnico de redes', 'Técnico de alarmes', 'Instalador de câmeras',
        'Reparador de elevadores', 'Técnico de geradores', 'Reparador de caldeiras', 'Instalador de gás'
    ],
    'Tecnologia': [
        'Técnico informático', 'Técnico de computadores', 'Programador', 'Desenvolvedor Web',
        'Especialista em redes', 'Reparador de telemóveis', 'Engenheiro de Software', 'Analista de Dados', 
        'QA / Tester', 'Especialista em Cibersegurança', 'Desenvolvedor Mobile', 'Administrador de Sistemas',
        'Arquiteto Cloud', 'Suporte de TI', 'Engenheiro de Machine Learning', 'Técnico de impressoras'
    ],
    'Jardim e agricultura': [
        'Jardineiro', 'Paisagista', 'Podador de árvores', 'Capinador', 
        'Agricultor', 'Horticultor', 'Fruticultor', 'Viveirista (plantas)', 
        'Trabalhador rural', 'Irrigador', 'Técnico agrícola', 'Tratorista', 
        'Especialista em estufas', 'Apicultor', 'Florista'
    ],
    'Animais': [
        'Tratador de animais', 'Criador de aves', 'Criador de gado', 
        'Veterinário', 'Auxiliar veterinário', 'Tosador de animais', 'Treinador de cães',
        'Passeador de cães (Dog Walker)', 'Pet Sitter', 'Cuidador de cavalos', 'Técnico de aquários'
    ],
    'Veículos e equipamentos': [
        'Motorista', 'Mecânico', 'Mecânico de motos', 'Mecânico de máquinas agrícolas', 
        'Lavador de carros', 'Reparador de bicicletas', 'Chapeiro', 'Pintor auto',
        'Bate-chapas', 'Eletricista auto', 'Motorista de pesados', 'Instrutor de condução',
        'Técnico de pneus', 'Estofador auto', 'Reboque/Pronto-socorro'
    ],
    'Segurança': [
        'Segurança', 'Guarda', 'Vigilante', 'Porteiro', 'Controlador de acesso',
        'Guarda-costas', 'Consultor de segurança', 'Segurança de eventos', 'Monitor de CCTV'
    ],
    'Serviços gerais': [
        'Entregador', 'Mensageiro', 'Carregador', 'Ajudante de mudanças', 'Montador de móveis',
        'Estafeta', 'Distribuidor', 'Embalador', 'Técnico de logística', 'Motorista de entregas'
    ],
    'Obras e infraestrutura': [
        'Mestre de obras', 'Engenheiro civil', 'Arquiteto', 'Topógrafo', 
        'Operador de escavadora', 'Operador de trator', 'Operador de retroescavadora',
        'Engenheiro ambiental', 'Engenheiro eletrotécnico', 'Projetista', 'Avaliador imobiliário'
    ],
    'Trabalhos artesanais': [
        'Ferreiro', 'Artesão', 'Oleiro', 'Escultor', 'Restaurador de móveis',
        'Sapateiro', 'Costureiro(a)', 'Alfaiate', 'Joalheiro', 'Bordador(a)'
    ],
    'Serviços complementares': [
        'Limpador de piscinas', 'Limpador de telhados', 'Limpador de vidros', 
        'Dedetizador', 'Técnico de controlo de pragas', 'Limpa-chaminés', 'Desentupidor'
    ],
    'Gestão e apoio': [
        'Administrador de propriedade', 'Caseiro', 'Gestor de fazenda', 
        'Supervisor de manutenção', 'Comprador de suprimentos', 'Assistente Administrativo', 'Secretária',
        'Recepcionista', 'Apoio ao Cliente', 'Telefonista', 'Gestor de Condomínio'
    ],
    'Outros serviços úteis': [
        'Instalador de cercas', 'Reparador de portões', 'Operador de gerador elétrico',
        'Assistente de armazém', 'Fiscal de loja', 'Repositor'
    ],
    'Design': [
        'Designer Gráfico', 'UI/UX Designer', 'Designer de Interiores', 'Ilustrador', 'Animador 3D',
        'Web Designer', 'Designer de Moda', 'Designer de Produto', 'Modelador 3D', 'Editor de Imagens'
    ],
    'Educação': [
        'Professor', 'Professor Particular', 'Tradutor', 'Revisor de Textos', 'Criador de Cursos',
        'Educador de Infância', 'Formador', 'Avaliador', 'Intérprete', 'Monitor de Estudos'
    ],
    'Beleza': [
        'Cabeleireiro', 'Manicure / Pedicure', 'Maquiador', 'Esteticista', 'Massagista',
        'Barbeiro', 'Depiladora', 'Designer de Sobrancelhas', 'Terapeuta de Spa', 'Consultor de Imagem'
    ],
    'Eventos': [
        'Organizador de Eventos', 'Cerimonialista', 'DJ', 'Barman', 'Músico',
        'Decorador de Eventos', 'Animador de Festas', 'Cozinheiro de Eventos', 'Empregado de Mesa', 'Promotor'
    ],
    'Fotografia e Vídeo': [
        'Fotógrafo', 'Editor de Vídeo', 'Videomaker', 'Operador de Drone',
        'Realizador', 'Fotógrafo de Casamentos', 'Fotógrafo de Produto', 'Colorista'
    ],
    'Consultoria': [
        'Consultor Financeiro', 'Consultor de RH', 'Consultor de Marketing', 'Advogado', 'Contabilista',
        'Consultor Jurídico', 'Consultor de Negócios', 'Auditor', 'Assessor Fiscal', 'Coach'
    ],
    'Serviços Digitais': [
        'Gestor de Redes Sociais', 'Copywriter', 'Especialista de SEO', 'Gestor de Tráfego',
        'Especialista em Marketing Digital', 'Criador de Conteúdo', 'Gestor de E-commerce', 'Assistente Virtual'
    ]
};

const MAPPING_OVERRIDE = {
    'Beleza': JOBS_CATEGORIES_MAP['Beleza'],
    'Eventos': JOBS_CATEGORIES_MAP['Eventos'],
    'Fotografia': JOBS_CATEGORIES_MAP['Fotografia e Vídeo'],
    'Consultoria': JOBS_CATEGORIES_MAP['Consultoria'],
    'Serviços digitais': JOBS_CATEGORIES_MAP['Serviços Digitais'],
    'Agricultura': JOBS_CATEGORIES_MAP['Jardim e agricultura'],
    'Transporte': JOBS_CATEGORIES_MAP['Veículos e equipamentos'],
    'Assistência': JOBS_CATEGORIES_MAP['Cuidados e apoio'],
    'Design': JOBS_CATEGORIES_MAP['Design'],
    'Educação': JOBS_CATEGORIES_MAP['Educação'],
    'Serviços empresariais': JOBS_CATEGORIES_MAP['Gestão e apoio']
};

(async () => {
    try {
        const { data: cats, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        
        const catMap = {};
        cats.forEach(c => catMap[c.name] = c.id);

        for (const [catName, specs] of Object.entries(MAPPING_OVERRIDE)) {
            const catId = catMap[catName];
            if (catId) {
                const { data: existing } = await supabase.from('specialties').select('name').eq('category_id', catId);
                const existingNames = existing.map(e => e.name);

                const toInsert = specs
                    .filter(s => !existingNames.includes(s))
                    .map(s => ({ category_id: catId, name: s }));

                if (toInsert.length > 0) {
                    await supabase.from('specialties').insert(toInsert);
                    console.log(`Inserted ${toInsert.length} specs for ${catName}`);
                }
            }
        }
        console.log('All done');
    } catch(e) {
        console.error(e);
    }
})();
