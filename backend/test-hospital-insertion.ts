import { RegrasHospitais } from './src/controllers/RegrasHospitais';

async function testHospitalInsertion() {
  console.log('Testing hospital insertion...');

  const regrasHospitais = new RegrasHospitais();

  // Sample data similar to what we saw in the JSON file
  const sampleData = [
    {
      "codigo": "1b2c137e-75e1-4644-b1ca-c04e1055443a",
      "nome": "Hospital Municipal Santo Antônio",
      "cidade": "4309654",
      "bairro": "Jardim",
      "especialidades": "Neurologia;Ortopedia",
      "leitos_totais": "335"
    },
    {
      "codigo": "c794ca06-1e7a-4012-99e1-1642d336232e",
      "nome": "Hospital Santa Santo Antônio",
      "cidade": "1505304",
      "bairro": "Centro",
      "especialidades": "Infectologia;Clínica Geral",
      "leitos_totais": "794"
    }
  ];

  try {
    await regrasHospitais.processar(sampleData);
    console.log('✅ Hospital insertion test completed successfully');
  } catch (error) {
    console.error('❌ Hospital insertion test failed:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
  }
}

testHospitalInsertion();