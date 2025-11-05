import { useEffect, useRef, useState } from 'react';

// IDs dos Pokémon de Gen 1 (excluindo lendários)
const NORMAL_POKEMON_IDS = [
  1, 4, 7, 10, 13, 16, 19, 21, 23, 25, 27, 29, 32, 35, 37, 39, 41, 43, 46, 48,
  50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 83, 84, 86, 88, 90,
  92, 95, 96, 98, 100, 102, 104, 106, 107, 108, 109, 111, 113, 114, 115, 116,
  118, 120, 122, 123, 124, 125, 126, 127, 128, 129, 131, 132, 133, 137, 138, 140, 143, 147
];

// IDs dos Lendários de Gen 1
const LEGENDARY_POKEMON_IDS = [144, 145, 146, 150, 151];

const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon/';

/**
 * Componente para injetar estilos CSS globais sem usar arquivos externos.
 */
const GlobalStyles = () => (
  <style>{`
    :root {
      --primary-color: #3B4CCA;
      --secondary-color: #FFDE00;
      --accent-color: #CC0000;
      --bg-color: #f0f2f5;
      --card-bg: rgba(255, 255, 255, 0.9); /* Fundo semi-transparente */
      --text-color: #333;
      --overlay-color: rgba(0, 0, 0, 0.6); /* Overlay escuro para contraste */
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      overflow: hidden; /* Evita scroll na tela principal */
    }

    /* --- Video Background --- */
    .video-background-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: -2; /* Atrás de tudo */
    }

    .video-background {
      position: absolute;
      top: 50%;
      left: 50%;
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      z-index: -2;
      transform: translateX(-50%) translateY(-50%);
    }
    
    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--overlay-color);
      z-index: -1; /* Atrás do conteúdo, mas na frente do vídeo */
    }

    /* --- Container Principal --- */
    .app-container {
      width: 100%;
      max-width: 800px; /* Aumentado para melhor visualização em 2 linhas */
      min-height: 500px;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); /* Sombra mais forte */
      padding: 2rem;
      text-align: center;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative; /* Para z-index se necessário */
      backdrop-filter: blur(5px); /* Efeito de blur no fundo do card */
    }

    h1 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    h2 {
      color: var(--text-color);
      margin-bottom: 1rem;
      font-weight: 500;
    }
    
    h3 {
      color: var(--primary-color);
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--secondary-color);
      padding-bottom: 5px;
    }

    p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    /* --- Botão Principal --- */
    .btn {
      background-color: var(--accent-color);
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 1.1rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.2s;
    }

    .btn:hover {
      background-color: #a70000;
      transform: translateY(-2px);
    }
    
    .btn:disabled {
      background-color: #999;
      cursor: not-allowed;
    }

    /* --- Tela de Seleção --- */
    .selection-screen .timer {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--accent-color);
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .pokemon-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr); /* 3 colunas para 6 itens em 2 linhas */
      gap: 1rem;
      margin-top: 1.5rem;
      justify-items: center; /* Centraliza os cards */
    }
    
    /* Ajustes para telas menores */
    @media (max-width: 600px) {
      .pokemon-options {
        grid-template-columns: repeat(2, 1fr); /* 2 colunas em telas pequenas */
      }
    }


    .pokemon-card {
      border: 2px solid #ddd;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
      background-color: #f9f9f9;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      width: 100%; /* Garante que o card ocupe o espaço na grid */
      max-width: 150px; /* Limita o tamanho máximo do card */
    }

    .pokemon-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      border-color: var(--primary-color);
    }

    .pokemon-card img {
      width: 96px;
      height: 96px;
      image-rendering: pixelated; /* Mantém o estilo pixel art */
      margin-bottom: 0.5rem;
    }

    .pokemon-card p {
      text-transform: capitalize;
      font-weight: bold;
      font-size: 1rem;
      margin: 0;
    }

    /* --- Tela de Resumo --- */
    .summary-screen {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    .team-display {
      display: grid;
      grid-template-columns: repeat(3, 1fr); /* 3 colunas para 6 itens em 2 linhas */
      gap: 1rem;
    }
    
    .team-member {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 10px;
      border: 1px solid #eee;
    }
    
    .team-member img {
      width: 80px;
      height: 80px;
      image-rendering: pixelated;
    }
    
    .team-member p {
      text-transform: capitalize;
      font-size: 0.9rem;
      margin: 0;
      font-weight: 600;
    }

    /* --- Loader --- */
    .loader-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid var(--primary-color);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

/**
 * Componente para o vídeo de fundo do YouTube.
 */
const YoutubeBackground = () => (
  <div className="video-background-container">
    <iframe
      className="video-background"
      src="https://www.youtube.com/embed/fJ9rUzIMcZQ?controls=0&showinfo=0&rel=0&autoplay=1&loop=1&mute=1&playlist=fJ9rUzIMcZQ"
      frameBorder="0"
      allow="autoplay; encrypted-media"
      allowFullScreen
      title="Pokemon Go Capture Background Video"
    ></iframe>
    <div className="video-overlay"></div>
  </div>
);


/**
 * Busca detalhes de um Pokémon específico pela ID.
 */
const fetchPokemonDetails = async (id) => {
  try {
    const response = await fetch(`${POKEMON_API_URL}${id}`);
    if (!response.ok) {
      throw new Error('Falha ao buscar dados da API');
    }
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      sprite: data.sprites.front_default || 'https://placehold.co/96x96/eee/ccc?text=No+Img',
    };
  } catch (error) {
    console.error(`Erro ao buscar Pokémon ${id}:`, error);
    // Retorna um placeholder em caso de falha
    return {
      id: id,
      name: 'Erro',
      sprite: 'https://placehold.co/96x96/ff0000/ffffff?text=Error',
    };
  }
};

/**
 * Pega uma contagem de IDs aleatórios da lista de origem.
 */
const getRandomIds = (count, isLegendary) => {
  const source = isLegendary ? LEGENDARY_POKEMON_IDS : NORMAL_POKEMON_IDS;
  // Embaralha a lista de origem e pega os primeiros 'count' IDs
  const shuffled = [...source].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};


/**
 * Componente Principal: App
 */
export default function App() {
  // Estado para controlar a fase do jogo: 'welcome', 'selection', 'summary'
  const [gamePhase, setGamePhase] = useState('welcome');
  
  // Estado para o time do usuário
  const [userTeam, setUserTeam] = useState([]);
  
  // Estado para o time adversário
  const [opponentTeam, setOpponentTeam] = useState([]);
  
  // Estado para a rodada atual de seleção (0 a 5)
  const [currentRound, setCurrentRound] = useState(0);
  
  // Estado para as 5 opções de Pokémon da rodada
  const [selectionOptions, setSelectionOptions] = useState([]);
  
  // Estado para o timer de 5 segundos
  const [timer, setTimer] = useState(5);
  
  // Estado para controlar o carregamento (loading)
  const [isLoading, setIsLoading] = useState(false);
  
  const timerRef = useRef(null);

  /**
   * Busca os próximos 5 Pokémon para a rodada de seleção.
   */
  const fetchNextRound = async (roundIndex) => {
    setIsLoading(true);
    setSelectionOptions([]); // Limpa opções anteriores
    
    // A última rodada (índice 5) é de lendários
    const isLegendary = roundIndex === 5;
    const ids = getRandomIds(5, isLegendary); // Ainda buscando 5
    
    // Busca os dados dos 5 Pokémon em paralelo
    const pokemonData = await Promise.all(
      ids.map(id => fetchPokemonDetails(id))
    );
    
    setSelectionOptions(pokemonData);
    setIsLoading(false);
    setTimer(15); // Reinicia o timer
  };

  /**
   * Gera o time adversário aleatório.
   */
  const generateOpponentTeam = async () => {
    setIsLoading(true);
    const normalIds = getRandomIds(5, false);
    const legendaryId = getRandomIds(1, true);
    
    const allIds = [...normalIds, ...legendaryId];
    
    const teamData = await Promise.all(
      allIds.map(id => fetchPokemonDetails(id))
    );
    
    setOpponentTeam(teamData);
    setIsLoading(false);
  };

  /**
   * Lida com o início do jogo.
   */
  const handleStartGame = () => {
    setUserTeam([]);
    setOpponentTeam([]);
    setCurrentRound(0);
    setGamePhase('selection');
    fetchNextRound(0); // Busca a primeira rodada
  };

  /**
   * Lida com a seleção de um Pokémon pelo usuário.
   */
  const handleSelectPokemon = (pokemon) => {
    if (isLoading) return; // Impede seleção durante o carregamento

    // Para o timer atual
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const newTeam = [...userTeam, pokemon];
    setUserTeam(newTeam);
    
    const nextRound = currentRound + 1;
    
    if (nextRound < 6) {
      // Se ainda houver rodadas, avança
      setCurrentRound(nextRound);
      fetchNextRound(nextRound);
    } else {
      // Se for a última rodada, muda para o resumo
      setGamePhase('summary');
      generateOpponentTeam(); // Gera o time inimigo
    }
  };
  
  /**
   * Efeito para controlar o timer.
   */
  useEffect(() => {
    // Só roda o timer na fase de seleção e se não estiver carregando
    if (gamePhase !== 'selection' || isLoading || selectionOptions.length === 0) {
      return;
    }

    if (timer === 0) {
      // Se o timer zerar, auto-seleciona o primeiro Pokémon da lista
      handleSelectPokemon(selectionOptions[0]);
      return;
    }

    // Inicia o intervalo do timer
    timerRef.current = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);

    // Função de limpeza: para o intervalo quando o componente desmontar
    // ou quando as dependências mudarem
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gamePhase, isLoading, timer, selectionOptions]);


  // --- Renderização dos Componentes ---

  /**
   * Renderiza a tela de boas-vindas.
   */
  const renderWelcomeScreen = () => (
    <div className="welcome-screen">
      <h1>Bem-vindo ao PokeGui!</h1>
      <p>Monte seu time para a batalha da Geração I.</p>  
      <p>Você escolherá 5 Pokémon e 1 Lendário em 6 rodadas de seleção. Prepare-se!</p>
      <button className="btn" onClick={handleStartGame}>
        Começar Montagem
      </button>
    </div>
  );

  /**
   * Renderiza a tela de seleção de Pokémon.
   */
  const renderSelectionScreen = () => {
    const roundTitle = currentRound === 5 
      ? "Rodada Lendária! (Escolha 1)" 
      : `Rodada ${currentRound + 1} de 6 (Escolha 1)`;

    return (
      <div className="selection-screen">
        <h2>{roundTitle}</h2>
        
        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Buscando Pokémon...</p>
          </div>
        ) : (
          <>
            <div className="timer">{timer}</div>
            <div className="pokemon-options">
              {selectionOptions.map(pokemon => (
                <div 
                  key={pokemon.id} 
                  className="pokemon-card" 
                  onClick={() => handleSelectPokemon(pokemon)}
                >
                  <img 
                    src={pokemon.sprite} 
                    alt={pokemon.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/eee/ccc?text=No+Img'; }}
                  />
                  <p>{pokemon.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  /**
   * Renderiza a tela de resumo dos times.
   */
  const renderSummaryScreen = () => (
    <div className="summary-screen">
      <h1>Montagem Concluída!</h1>
      
      <h3>Seu Time</h3>
      <div className="team-display">
        {userTeam.map((p, index) => (
          <div key={`${p.id}-${index}`} className="team-member">
            <img src={p.sprite} alt={p.name} />
            <p>{p.name}</p>
          </div>
        ))}
      </div>
      
      <h3>Time Adversário</h3>
      {isLoading ? (
        <div className="loader-container" style={{ minHeight: '150px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <div className="team-display">
          {opponentTeam.map((p, index) => (
            <div key={`${p.id}-${index}`} className="team-member">
              <img src={p.sprite} alt={p.name} />
              <p>{p.name}</p>
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="btn" 
        onClick={handleStartGame} 
        style={{ marginTop: '2rem' }}
        disabled={isLoading}
      >
        Montar Novo Time
      </button>
    </div>
  );

  /**
   * Renderiza o conteúdo principal baseado na fase do jogo.
   */
  const renderContent = () => {
    switch (gamePhase) {
      case 'selection':
        return renderSelectionScreen();
      case 'summary':
        return renderSummaryScreen();
      case 'welcome':
      default:
        return renderWelcomeScreen();
    }
  };

  return (
    <>
      {/* Injeta os estilos CSS na página */}
      <GlobalStyles />
      
      {/* Adiciona o vídeo de fundo */}
      <YoutubeBackground />

      {/* Container principal do app */}
      <div className="app-container">
        {renderContent()}
      </div>
    </>
  );
}