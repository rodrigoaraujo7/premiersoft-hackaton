export class RegrasPacientes {
  public async processar(data: any): Promise<string> {
    // TODO: Implement business logic here
    console.log('Processing patient data:', data);
    // Pegue o data (que é um .json) e gere um arquivo .json com ele para mim, na pasta backend/src/resources/
    return 'OK';
  }
}
