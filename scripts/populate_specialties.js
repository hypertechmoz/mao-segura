require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const JOBS_CATEGORIES_MAP = {
    'Serviços domésticos': [
        'Governanta doméstica', 'Empregada doméstica', 'Faxineira', 'Auxiliar de limpeza', 
        'Lavadeira', 'Passadeira de roupa', 'Cozinheiro(a)', 'Ajudante de cozinha', 
        'Babá', 'Cuidador de idosos'
    ],
    'Cuidados e apoio': [
        'Cuidador de crianças', 'Tutor escolar', 'Acompanhante de idosos', 
        'Enfermeiro domiciliar', 'Auxiliar de enfermagem domiciliar'
    ],
    'Construção e reparos': [
        'Pedreiro', 'Servente de pedreiro', 'Carpinteiro', 'Marceneiro', 
        'Serralheiro', 'Soldador', 'Pintor', 'Azulejista', 'Gesseiro', 'Telhadista'
    ],
    'Instalações e manutenção': [
        'Canalizador (encanador)', 'Electricista', 'Técnico de ar-condicionado', 
        'Técnico de refrigeração', 'Técnico de eletrodomésticos', 'Técnico de bombas de água', 
        'Instalador de painéis solares', 'Instalador de antenas', 'Instalador de internet', 
        'Técnico de redes'
    ],
    'Tecnologia': [
        'Técnico informático', 'Técnico de computadores', 'Programador', 'Desenvolvedor Web',
        'Especialista em redes', 'Reparador de telemóveis', 'Engenheiro de Software', 'Analista de Dados', 'QA / Tester'
    ],
    'Jardim e agricultura': [
        'Jardineiro', 'Paisagista', 'Podador de árvores', 'Capinador', 
        'Agricultor', 'Horticultor', 'Fruticultor', 'Viveirista (plantas)', 
        'Trabalhador rural', 'Irrigador'
    ],
    'Animais': [
        'Tratador de animais', 'Criador de aves', 'Criador de gado', 
        'Veterinário', 'Auxiliar veterinário', 'Tosador de animais', 'Treinador de cães'
    ],
    'Veículos e equipamentos': [
        'Motorista', 'Mecânico', 'Mecânico de motos', 'Mecânico de máquinas agrícolas', 
        'Lavador de carros', 'Reparador de bicicletas'
    ],
    'Segurança': [
        'Segurança', 'Guarda', 'Vigilante', 'Porteiro', 'Controlador de acesso'
    ],
    'Serviços gerais': [
        'Entregador', 'Mensageiro', 'Carregador', 'Ajudante de mudanças', 'Montador de móveis'
    ],
    'Obras e infraestrutura': [
        'Mestre de obras', 'Engenheiro civil', 'Arquiteto', 'Topógrafo', 
        'Operador de escavadora', 'Operador de trator', 'Operador de retroescavadora'
    ],
    'Trabalhos artesanais': [
        'Ferreiro', 'Artesão', 'Oleiro', 'Escultor', 'Restaurador de móveis'
    ],
    'Serviços complementares': [
        'Limpador de piscinas', 'Limpador de telhados', 'Limpador de vidros', 
        'Dedetizador', 'Técnico de controlo de pragas'
    ],
    'Gestão e apoio': [
        'Administrador de propriedade', 'Caseiro', 'Gestor de fazenda', 
        'Supervisor de manutenção', 'Comprador de suprimentos', 'Assistente Administrativo', 'Secretária'
    ],
    'Outros serviços úteis': [
        'Instalador de cercas', 'Reparador de portões', 'Técnico de alarmes', 
        'Instalador de câmeras de segurança', 'Operador de gerador elétrico'
    ],
    'Design': [
        'Designer Gráfico', 'UI/UX Designer', 'Designer de Interiores', 'Ilustrador', 'Animador 3D'
    ],
    'Educação': [
        'Professor', 'Professor Particular', 'Tradutor', 'Revisor de Textos', 'Criador de Cursos'
    ],
    'Beleza': [
        'Cabeleireiro', 'Manicure / Pedicure', 'Maquiador', 'Esteticista', 'Massagista'
    ],
    'Eventos': [
        'Organizador de Eventos', 'Cerimonialista', 'DJ', 'Barman', 'Músico'
    ],
    'Fotografia e Vídeo': [
        'Fotógrafo', 'Editor de Vídeo', 'Videomaker', 'Operador de Drone'
    ],
    'Consultoria': [
        'Consultor Financeiro', 'Consultor de RH', 'Consultor de Marketing', 'Advogado', 'Contabilista'
    ],
    'Serviços Digitais': [
        'Gestor de Redes Sociais', 'Copywriter', 'Especialista de SEO', 'Gestor de Tráfego'
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
