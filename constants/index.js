export const Colors = {
    primary: '#10B981',      // Custom Green (rgb(16, 185, 129))
    primaryDark: '#059669',  // Darker shade
    primaryLight: '#34D399', // Lighter shade
    primaryBg: '#ECFDF5',    // Soft Background
    white: '#FFFFFF',
    background: '#E5E7EB',   // Noticeably darker grey to ensure card contrast
    surface: '#FFFFFF',
    text: '#1A202C',         // Standard Dark text
    textSecondary: '#4A5568',
    textLight: '#718096',
    border: '#E2E8F0',
    borderLight: '#EDF2F7',
    error: '#EF4444',        // Red
    warning: '#F59E0B',      // Orange
    success: '#22C55E',      // Green
    successBg: '#F0FDF4',
    info: '#4A9EFF',         // Soft Blue (secondary)
    premium: '#10B981',      // Vibrant Green for Premium (Plus/Max)
    star: '#FFC107',
    shadow: '#0000000F',
};

export const Fonts = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 17,
        xl: 20,
        xxl: 26,
        title: 32,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const Radius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
};

export const API_URL = 'http://localhost:3000/api';
export const SOCKET_URL = 'http://localhost:3000';

export const JOBS_CATEGORIES_MAP = {
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

export const PROFESSION_CATEGORIES = Object.keys(JOBS_CATEGORIES_MAP).concat(['Outro']);
export const JOB_TYPES = Object.values(JOBS_CATEGORIES_MAP).flat().concat(['Outro']);

export const MODALITIES = {
    REMOTE: 'Remoto',
    ONSITE: 'Presencial',
    HYBRID: 'Híbrido'
};

// Classificação de categorias que aceitam trabalho remoto vs estritamente presenciais
export const REMOTE_CATEGORIES = [
    'Tecnologia', 'Design', 'Serviços Digitais', 'Consultoria', 'Educação', 'Gestão e apoio', 'Fotografia e Vídeo'
];

export const ONSITE_CATEGORIES = [
    'Serviços domésticos', 'Cuidados e apoio', 'Construção e reparos', 'Instalações e manutenção', 
    'Jardim e agricultura', 'Animais', 'Veículos e equipamentos', 'Segurança', 'Serviços gerais', 
    'Obras e infraestrutura', 'Trabalhos artesanais', 'Serviços complementares', 'Outros serviços úteis',
    'Beleza', 'Eventos'
];

export const COMMON_SKILLS = [
    'Montador de TV',
    'Montador de Antenas',
    'Limpeza Profunda',
    'Cozinha',
    'Primeiros Socorros',
    'Manutenção Preventiva',
    'Outro'
];

export const PROVINCES = [
    'Maputo',
    'Gaza',
    'Inhambane',
    'Sofala',
    'Manica',
    'Tete',
    'Zambézia',
    'Nampula',
    'Cabo Delgado',
    'Niassa',
];

export const PROVINCE_CITIES = {
    'Maputo': ['Maputo', 'Matola', 'Boane', 'Marracuene', 'Manhiça', 'Namaacha', 'Moamba', 'KaMpfumo', 'Nlhamankulu', 'KaMaxakeni', 'KaMavota', 'KaMubukwana', 'KaTembe', 'KaNyaka', 'Magude', 'Matutuíne'],
    'Gaza': ['Xai-Xai', 'Chókwè', 'Bilene', 'Chibuto', 'Mabalane', 'Mandlakazi', 'Massingir', 'Chigubo'],
    'Inhambane': ['Inhambane', 'Maxixe', 'Vilankulo', 'Inharrime', 'Massinga', 'Zavala', 'Homoíne', 'Jangamo', 'Mabote'],
    'Sofala': ['Beira', 'Dondo', 'Nhamatanda', 'Caia', 'Gorongosa', 'Marromeu', 'Búzi', 'Chibabava', 'Machanga', 'Cheringoma', 'Muanza'],
    'Manica': ['Chimoio', 'Manica', 'Gondola', 'Vila de Sussundenga', 'Barué', 'Mossurize', 'Machaze', 'Guro', 'Tambara', 'Macossa'],
    'Tete': ['Tete', 'Moatize', 'Angónia', 'Mutarara', 'Macanga', 'Tsangano', 'Chifunde', 'Marávia', 'Zumbo', 'Mágoè', 'Cahora Bassa'],
    'Zambézia': ['Quelimane', 'Mocuba', 'Gurúè', 'Milange', 'Alto Molócuè', 'Maganja da Costa', 'Pebane', 'Nicoadala', 'Namacurra', 'Namurroí', 'Mopeia', 'Morrumbala', 'Chinde', 'Inhassunge'],
    'Nampula': ['Nampula', 'Nacala-Porto', 'Angoche', 'Ilha de Moçambique', 'Monapo', 'Nacala-a-Velha', 'Meconta', 'Mongicual', 'Mogovolas', 'Murrupula', 'Rapale', 'Ribáuè', 'Malema', 'Lalaua', 'Mecubúri', 'Memba', 'Mossuril', 'Muecate', 'Eráti', 'Nacarôa'],
    'Cabo Delgado': ['Pemba', 'Montepuez', 'Mocímboa da Praia', 'Mueda', 'Palma', 'Chiúre', 'Ancuabe', 'Balama', 'Meluco', 'Mocubúri', 'Muidumbe', 'Namuno', 'Nangade', 'Quissanga'],
    'Niassa': ['Lichinga', 'Cuamba', 'Lago', 'Mecanhelas', 'Majune', 'Mandimba', 'Marrupa', 'Maúa', 'Mavago', 'Mecula', 'Metarica', 'Muembe', "N'gauma", 'Nipepe', 'Sanga'],
};

export const CONTRACT_TYPES = [
    { label: 'Serviço Único / Tarefa', value: 'SINGLE_TASK' },
    { label: 'Por Projeto', value: 'PROJECT' },
    { label: 'Recorrente', value: 'RECURRING' },
    { label: 'Contrato Contínuo', value: 'CONTINUOUS' },
    { label: 'Tempo Inteiro', value: 'FULL_TIME' },
    { label: 'Meio Tempo', value: 'PART_TIME' },
    { label: 'Freelance', value: 'FREELANCE' },
    { label: 'Temporário', value: 'TEMPORARY' },
    { label: 'Estágio', value: 'INTERNSHIP' },
];

export const AVAILABILITY_TYPES = [
    { label: 'Imediata', value: 'IMMEDIATE' },
    { label: 'Agendada / Programada', value: 'SCHEDULED' },
    { label: 'Horário Flexível', value: 'FLEXIBLE' },
];
