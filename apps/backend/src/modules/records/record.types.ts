export interface CreateRecordInput {
  title: string;
  amount: number;
}

export interface UpdateRecordInput {
  title?: string;
  amount?: number;
}
