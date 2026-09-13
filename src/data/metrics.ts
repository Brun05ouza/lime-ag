export interface Metric {
  value: number;
  suffix: string;
  display: string;
  label: string;
}
export const metrics: Metric[] = [
  { value: 30, suffix: '+', display: '30+', label: 'Clientes atendidos de ponta a ponta' },
  { value: 50, suffix: '+', display: '50+', label: 'Influenciadores gerenciados on & off' },
  { value: 40, suffix: '+', display: '40+', label: 'Grandes campanhas de varejo' },
  { value: 20, suffix: '+', display: '20+', label: 'Campanhas institucionais' },
  { value: 5, suffix: '+', display: '05+', label: 'Rebrandings e evoluções de marca' },
  { value: 100, suffix: 'M+', display: '100M+', label: 'Impressões geradas' },
  { value: 5, suffix: 'M+', display: '5M+', label: 'Cliques em campanhas de mídia' },
  { value: 1.5, suffix: 'M+', display: '1.5M+', label: 'Interações em redes sociais' },
  { value: 400, suffix: 'K+', display: '400K+', label: 'Novos seguidores' },
];
