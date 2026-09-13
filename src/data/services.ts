export interface Service {
  id: string;
  title: string;
  introduction: string;
  items: string[];
}
export const services: Service[] = [
  {
    id: 'estrategia',
    title: 'Estratégia',
    introduction:
      'Antes de dizer, entender. Encontramos o que torna sua marca relevante e traçamos o caminho para comunicar isso.',
    items: [
      'Diagnóstico da marca',
      'Posicionamento e Branding',
      'Planejamento de comunicação',
      'Campanha publicitária',
      'Calendário estratégico',
    ],
  },
  {
    id: 'performance',
    title: 'Performance',
    introduction:
      'Criatividade com direção. Conectamos sua marca às pessoas certas, com decisões orientadas por dados.',
    items: [
      'Gestão de tráfego pago',
      'Geração de leads',
      'Landing pages de conversão',
      'Sites institucionais',
      'Parcerias com influenciadores',
    ],
  },
  {
    id: 'conteudo',
    title: 'Conteúdo',
    introduction:
      'Uma história que merece ser contada do jeito certo. Transformamos o posicionamento da marca em presença.',
    items: [
      'Planejamento editorial',
      'Conteúdo para redes sociais',
      'Roteiros para vídeos',
      'Direção criativa',
      'Captação in loco',
      'Edição de vídeos',
    ],
  },
  {
    id: 'inteligencia',
    title: 'Inteligência & Crescimento',
    introduction:
      'Olhar para os dados, encontrar possibilidades e evoluir. A estratégia continua depois que a campanha vai ao ar.',
    items: [
      'Relatórios estratégicos',
      'Análise de métricas',
      'Estudos de concorrência',
      'Recomendações de melhoria',
    ],
  },
];
