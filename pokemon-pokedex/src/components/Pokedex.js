import React, { useEffect, useState } from 'react';
import axios from "axios";
import "../pokedex.css";

const Pokedex = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null); // 선택된 포켓몬 데이터
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5001/pokemon"); // 백엔드 API 호출
        setPokemonData(response.data);
      } catch (error) {
        console.error("❌ Error fetching Pokémon data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ 포켓몬 클릭 시 모달 열기
  const openModal = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
    document.body.classList.add("modal-open"); // ✅ 바깥 화면 드래그 방지
  };

  // ✅ 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
    document.body.classList.remove("modal-open"); // ✅ 바깥 화면 드래그 방지 해제
  };

  // ✅ 포켓몬 리스트 렌더링
  const renderPokemonList = () => {
    return pokemonData.map((pokemon) => (
      <div key={pokemon.id} className='pokemon' onClick={() => openModal(pokemon)}>
        <img src={pokemon.sprite} alt={pokemon.name}/>
        <p>{pokemon.name}</p>
        <p>도감번호: {pokemon.id}</p>
        <p>타입: {pokemon.type.join(", ")}</p>
      </div>
    ));
  };

  return (
    <>
      <h1>Pokédex</h1>
      <div className='container'>
        {loading ? <p>Loading...</p> : <div className="pokemon-list">{renderPokemonList()}</div>}

        {/* ✅ 모달 창 (포켓몬 클릭 시 표시) */}
        {isModalOpen && selectedPokemon && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closeModal}>✖</button>
              <img src={selectedPokemon.sprite} alt={selectedPokemon.name}/>
              <h2>{selectedPokemon.name} (#{selectedPokemon.id})</h2>
              <p>도감번호: {selectedPokemon.id}</p>
              <p>타입: {selectedPokemon.type.join(", ")}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Pokedex;
