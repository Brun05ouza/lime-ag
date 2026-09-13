import type { ImageMetadata } from 'astro';
import carol from '../assets/team/carol-melo.png';
import julia from '../assets/team/julia-lima.png';
export interface TeamMember {
  name: string;
  image: ImageMetadata;
  email: string;
  biography: string;
  belief: string;
  objectX: string;
  objectY: string;
}
// Source: slide 11. The briefing transposes the biographies; keep the source associations.
export const team: TeamMember[] = [
  {
    name: 'Carol Melo',
    image: carol,
    email: 'carol@limeagencia.com.br',
    biography:
      'Ao longo da carreira, Carol construiu uma trajetória marcada pela parceria com grandes marcas e pelos desafios de mercados altamente competitivos. Esteve à frente de contas como Goodyear, Brasif, Multiplan, Karter, Gafisa e Minalba, desenvolvendo estratégias de comunicação que equilibram criatividade, consistência e visão de negócio.',
    belief:
      'Acredita que resultados duradouros começam quando a comunicação traduz, com clareza, o verdadeiro valor de uma marca.',
    objectX: '32%',
    objectY: '100%',
  },
  {
    name: 'Julia Lima',
    image: julia,
    email: 'julia@limeagencia.com.br',
    biography:
      'Publicitária, com MBA em Marketing Digital, acredita que toda boa estratégia começa pelo relacionamento. Sua trajetória reúne experiências na liderança de marcas nacionais e internacionais como Globo, Boehringer Ingelheim e Bwin Portugal, gerenciando projetos que conectam comunicação, desenvolvimento de negócios e growth.',
    belief:
      'Combina visão estratégica, proximidade com os clientes e uma execução cuidadosa para transformar boas ideias em resultados concretos.',
    objectX: '48%',
    objectY: '100%',
  },
];
