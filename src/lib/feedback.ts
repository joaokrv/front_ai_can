export type FeedbackTipo = 'exercicio' | 'refeicao';
export type VotoUsuario = 'up' | 'down' | null;

export interface FeedbackItem {
  id: number;
  tipo: FeedbackTipo;
  item_nome: string;
  gostou: boolean;
}

export const buildTreinoItemNome = (focoMuscular: string, planoId: number): string =>
  `Treino ${focoMuscular} - Plano ${planoId}`;

export const parsePlanoIdFromItemNome = (itemNome: string): number | null => {
  const m = itemNome.match(/- Plano (\d+)$/);
  return m ? Number(m[1]) : null;
};
