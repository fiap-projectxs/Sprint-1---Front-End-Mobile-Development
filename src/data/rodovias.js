// Base de conhecimento do Raly sobre as vias do Brasil (em português).
// Cobre: regra de numeração das BR, os 26 estados + DF com prefixo das rodovias estaduais,
// as principais rodovias federais e as principais rodovias estaduais conhecidas.
// A lista é resumida: nem toda rodovia do país está listada, mas qualquer número de BR
// é classificado pela regra de numeração (ver classificarBR em utils/vias.js).

export const UFS = [
  { sigla: 'AC', nome: 'Acre', capital: 'Rio Branco', regiao: 'Norte' },
  { sigla: 'AL', nome: 'Alagoas', capital: 'Maceió', regiao: 'Nordeste' },
  { sigla: 'AP', nome: 'Amapá', capital: 'Macapá', regiao: 'Norte' },
  { sigla: 'AM', nome: 'Amazonas', capital: 'Manaus', regiao: 'Norte' },
  { sigla: 'BA', nome: 'Bahia', capital: 'Salvador', regiao: 'Nordeste' },
  { sigla: 'CE', nome: 'Ceará', capital: 'Fortaleza', regiao: 'Nordeste' },
  { sigla: 'DF', nome: 'Distrito Federal', capital: 'Brasília', regiao: 'Centro-Oeste' },
  { sigla: 'ES', nome: 'Espírito Santo', capital: 'Vitória', regiao: 'Sudeste' },
  { sigla: 'GO', nome: 'Goiás', capital: 'Goiânia', regiao: 'Centro-Oeste' },
  { sigla: 'MA', nome: 'Maranhão', capital: 'São Luís', regiao: 'Nordeste' },
  { sigla: 'MT', nome: 'Mato Grosso', capital: 'Cuiabá', regiao: 'Centro-Oeste' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', capital: 'Campo Grande', regiao: 'Centro-Oeste' },
  { sigla: 'MG', nome: 'Minas Gerais', capital: 'Belo Horizonte', regiao: 'Sudeste' },
  { sigla: 'PA', nome: 'Pará', capital: 'Belém', regiao: 'Norte' },
  { sigla: 'PB', nome: 'Paraíba', capital: 'João Pessoa', regiao: 'Nordeste' },
  { sigla: 'PR', nome: 'Paraná', capital: 'Curitiba', regiao: 'Sul' },
  { sigla: 'PE', nome: 'Pernambuco', capital: 'Recife', regiao: 'Nordeste' },
  { sigla: 'PI', nome: 'Piauí', capital: 'Teresina', regiao: 'Nordeste' },
  { sigla: 'RJ', nome: 'Rio de Janeiro', capital: 'Rio de Janeiro', regiao: 'Sudeste' },
  { sigla: 'RN', nome: 'Rio Grande do Norte', capital: 'Natal', regiao: 'Nordeste' },
  { sigla: 'RS', nome: 'Rio Grande do Sul', capital: 'Porto Alegre', regiao: 'Sul' },
  { sigla: 'RO', nome: 'Rondônia', capital: 'Porto Velho', regiao: 'Norte' },
  { sigla: 'RR', nome: 'Roraima', capital: 'Boa Vista', regiao: 'Norte' },
  { sigla: 'SC', nome: 'Santa Catarina', capital: 'Florianópolis', regiao: 'Sul' },
  { sigla: 'SP', nome: 'São Paulo', capital: 'São Paulo', regiao: 'Sudeste' },
  { sigla: 'SE', nome: 'Sergipe', capital: 'Aracaju', regiao: 'Nordeste' },
  { sigla: 'TO', nome: 'Tocantins', capital: 'Palmas', regiao: 'Norte' },
]

// Rodovias federais principais (prefixo BR).
export const RODOVIAS_FEDERAIS = [
  { numero: 101, nome: 'Rodovia Translitorânea', trecho: 'Touros (RN) a São José do Norte (RS)', ufs: ['RN', 'PB', 'PE', 'AL', 'SE', 'BA', 'ES', 'RJ', 'SP', 'PR', 'SC', 'RS'], nota: 'Percorre todo o litoral leste e sul; liga as capitais Natal, João Pessoa, Recife, Maceió, Aracaju, Vitória e Florianópolis.' },
  { numero: 116, nome: 'Rodovia Presidente Dutra, Régis Bittencourt e Rio-Bahia (conforme o trecho)', apelidos: ['dutra', 'regis bittencourt', 'rio-bahia', 'rio bahia'], trecho: 'Fortaleza (CE) a Jaguarão (RS)', ufs: ['CE', 'PE', 'BA', 'MG', 'RJ', 'SP', 'PR', 'SC', 'RS'], nota: 'Uma das maiores do país (mais de 4 mil km). Tem a Via Dutra entre São Paulo e Rio de Janeiro e a Régis Bittencourt entre São Paulo e Curitiba.' },
  { numero: 153, nome: 'Rodovia Transbrasiliana', apelidos: ['transbrasiliana', 'belem-brasilia', 'belem brasilia'], trecho: 'Marabá (PA) a Aceguá (RS)', ufs: ['PA', 'TO', 'GO', 'MG', 'SP', 'PR', 'SC', 'RS'], nota: 'Atravessa o país no sentido norte-sul pelo interior; no Tocantins e em Goiás é a antiga Belém-Brasília.' },
  { numero: 163, nome: 'Rodovia Cuiabá-Santarém (e Cuiabá-Campo Grande)', trecho: 'Tenente Portela (RS) a Santarém (PA)', ufs: ['RS', 'SC', 'PR', 'MS', 'MT', 'PA'], nota: 'Principal eixo de escoamento da soja do Centro-Oeste para os portos do Arco Norte.' },
  { numero: 230, nome: 'Rodovia Transamazônica', apelidos: ['transamazonica'], trecho: 'Cabedelo (PB) a Lábrea (AM)', ufs: ['PB', 'CE', 'PI', 'MA', 'TO', 'PA', 'AM'], nota: 'Transversal; no Norte tem muitos trechos sem pavimento.' },
  { numero: 319, nome: 'Rodovia Manaus-Porto Velho', trecho: 'Manaus (AM) a Porto Velho (RO)', ufs: ['AM', 'RO'], nota: 'Liga a malha de Rondônia a Manaus; trechos no meio da floresta têm condições precárias.' },
  { numero: 174, nome: 'Rodovia Manaus-Boa Vista', trecho: 'Manaus (AM) à fronteira com a Venezuela (RR)', ufs: ['AM', 'RR'], nota: 'Única ligação rodoviária de Roraima com o restante do país; cruza a Terra Indígena Waimiri-Atroari.' },
  { numero: 364, nome: 'Rodovia Cuiabá-Porto Velho / Rio Branco', trecho: 'Limeira (SP) a Mâncio Lima (AC)', ufs: ['SP', 'MG', 'GO', 'MT', 'RO', 'AC'], nota: 'Diagonal que liga o Sudeste ao Acre.' },
  { numero: 262, nome: 'Rodovia Vitória-Corumbá', trecho: 'Vitória (ES) a Corumbá (MS)', ufs: ['ES', 'MG', 'SP', 'MS'], nota: 'Transversal que passa por Belo Horizonte, Uberaba e Campo Grande.' },
  { numero: 277, nome: 'Rodovia do Café / Rodovia de Paranaguá', trecho: 'Paranaguá (PR) a Foz do Iguaçu (PR)', ufs: ['PR'], nota: 'Liga o Porto de Paranaguá, Curitiba, Ponta Grossa, Guarapuava, Cascavel e Foz do Iguaçu.' },
  { numero: 376, nome: 'Rodovia do Café (parte)', trecho: 'Dourados (MS) a Garuva (SC)', ufs: ['MS', 'PR', 'SC'], nota: 'Passa por Maringá, Apucarana, Ponta Grossa e Curitiba (Contorno Leste) até Joinville.' },
  { numero: 381, nome: 'Rodovia Fernão Dias', apelidos: ['fernao dias'], trecho: 'Belo Horizonte (MG) a São Paulo (SP)', ufs: ['MG', 'SP'], nota: 'Liga as duas maiores regiões metropolitanas do Sudeste.' },
  { numero: 40, nome: 'BR-040', trecho: 'Brasília (DF) ao Rio de Janeiro (RJ)', ufs: ['DF', 'GO', 'MG', 'RJ'], nota: 'Passa por Belo Horizonte, Juiz de Fora e Petrópolis. Radial.' },
  { numero: 50, nome: 'BR-050', trecho: 'Brasília (DF) a Santos (SP)', ufs: ['DF', 'GO', 'MG', 'SP'], nota: 'Passa por Uberlândia, Uberaba e Ribeirão Preto. Radial.' },
  { numero: 60, nome: 'BR-060', trecho: 'Brasília (DF) à fronteira com o Paraguai (MS)', ufs: ['DF', 'GO', 'MS'], nota: 'Passa por Goiânia e Jataí. Radial.' },
  { numero: 70, nome: 'BR-070', trecho: 'Brasília (DF) à fronteira com a Bolívia (MT)', ufs: ['DF', 'GO', 'MT'], nota: 'Passa por Cuiabá e Cáceres. Radial.' },
  { numero: 20, nome: 'BR-020', trecho: 'Brasília (DF) a Fortaleza (CE)', ufs: ['DF', 'GO', 'BA', 'PI', 'CE'], nota: 'Radial que liga o Centro-Oeste ao Nordeste.' },
  { numero: 324, nome: 'BR-324', trecho: 'Salvador (BA) a Capim Grosso (BA)', ufs: ['BA'], nota: 'Passa por Feira de Santana; principal saída de Salvador para o interior.' },
  { numero: 290, nome: 'Freeway', apelidos: ['freeway'], trecho: 'Osório (RS) a Uruguaiana (RS)', ufs: ['RS'], nota: 'O trecho Osório–Porto Alegre é a Freeway; segue pelo interior até a fronteira com a Argentina.' },
  { numero: 282, nome: 'BR-282', trecho: 'Florianópolis (SC) à fronteira com a Argentina (SC)', ufs: ['SC'], nota: 'Transversal catarinense; passa por Lages e Chapecó.' },
  { numero: 222, nome: 'BR-222', trecho: 'Fortaleza (CE) a Marabá (PA)', ufs: ['CE', 'PI', 'MA', 'PA'], nota: 'Transversal do Nordeste ao Pará.' },
  { numero: 304, nome: 'BR-304', trecho: 'Natal (RN) a Mossoró (RN) e Aracati (CE)', ufs: ['RN', 'CE'], nota: 'Liga Natal ao oeste potiguar.' },
]

// Rodovias estaduais principais (prefixo = sigla do estado).
export const RODOVIAS_ESTADUAIS = [
  { uf: 'SP', numero: 280, nome: 'Rodovia Castello Branco', apelidos: ['castello branco', 'castelo branco'], trecho: 'São Paulo, Barueri, Itu e Sorocaba rumo ao oeste paulista', nota: 'Principal ligação da capital com Sorocaba e o oeste paulista.' },
  { uf: 'SP', numero: 330, nome: 'Rodovia Anhanguera', apelidos: ['anhanguera'], trecho: 'São Paulo a Campinas, Ribeirão Preto e divisa com MG', nota: 'Eixo para o norte do estado.' },
  { uf: 'SP', numero: 348, nome: 'Rodovia dos Bandeirantes', apelidos: ['bandeirantes'], trecho: 'São Paulo a Campinas e Cordeirópolis', nota: 'Paralela à Anhanguera, de pista dupla.' },
  { uf: 'SP', numero: 150, nome: 'Via Anchieta', apelidos: ['anchieta'], trecho: 'São Paulo a Santos', nota: 'Uma das duas pistas de descida da serra do Mar.' },
  { uf: 'SP', numero: 160, nome: 'Rodovia dos Imigrantes', apelidos: ['imigrantes'], trecho: 'São Paulo a Praia Grande / Santos', nota: 'Segunda pista de descida da serra do Mar.' },
  { uf: 'SP', numero: 70, nome: 'Rodovia Ayrton Senna / Carvalho Pinto', trecho: 'São Paulo a Taubaté', nota: 'Liga a capital ao Vale do Paraíba.' },
  { uf: 'SP', numero: 310, nome: 'Rodovia Washington Luís', trecho: 'São Carlos, Rio Claro a São José do Rio Preto e divisa com MS', nota: 'Eixo do noroeste paulista.' },
  { uf: 'SP', numero: 300, nome: 'Rodovia Marechal Rondon', trecho: 'Itu a Castilho', nota: 'Atravessa o oeste do estado.' },
  { uf: 'SP', numero: 21, nome: 'Rodoanel Mário Covas', trecho: 'Anel viário da Grande São Paulo', nota: 'Evita a passagem de caminhões pela capital.' },
  { uf: 'SP', numero: 99, nome: 'Rodovia dos Tamoios', apelidos: ['tamoios'], trecho: 'São José dos Campos a Caraguatatuba', nota: 'Acesso ao litoral norte.' },
  { uf: 'SP', numero: 65, nome: 'Rodovia Dom Pedro I', trecho: 'Campinas a Jacareí', nota: 'Liga o interior ao Vale do Paraíba.' },
  { uf: 'SP', numero: 55, nome: 'Rodovia Padre Manoel da Nóbrega', trecho: 'Baixada Santista e litoral sul', nota: 'Acesso a Peruíbe e Itanhaém.' },
  { uf: 'RJ', numero: 124, nome: 'Via Lagos', apelidos: ['via lagos'], trecho: 'Rio Bonito a Arraial do Cabo', nota: 'Acesso à Região dos Lagos.' },
  { uf: 'RJ', numero: 106, nome: 'Rodovia Amaral Peixoto', trecho: 'Niterói a Macaé', nota: 'Passa por Maricá e Saquarema.' },
  { uf: 'RJ', numero: 71, nome: 'Linha Vermelha', trecho: 'Centro do Rio ao Aeroporto do Galeão e Baixada', nota: 'Via expressa urbana.' },
  { uf: 'MG', numero: 10, nome: 'Linha Verde', trecho: 'Belo Horizonte a Serra do Cipó e Aeroporto de Confins', nota: 'Acesso ao aeroporto e à Serra do Cipó.' },
  { uf: 'PR', numero: 323, nome: 'PR-323', trecho: 'Umuarama a Paranavaí e Maringá', nota: 'Eixo do noroeste paranaense.' },
  { uf: 'SC', numero: 401, nome: 'SC-401', trecho: 'Florianópolis ao norte da Ilha de Santa Catarina', nota: 'Acesso a Jurerê, Canasvieiras e Ingleses.' },
  { uf: 'BA', numero: 99, nome: 'Linha Verde (BA-099)', trecho: 'Salvador a Mangue Seco', nota: 'Acesso ao litoral norte baiano.' },
]

export const TELEFONES_EMERGENCIA = [
  ['Polícia Rodoviária Federal (PRF)', '191'],
  ['SAMU', '192'],
  ['Corpo de Bombeiros', '193'],
  ['Polícia Militar', '190'],
  ['Defesa Civil', '199'],
  ['ANTT (reclamações em rodovias concedidas)', '166'],
]
