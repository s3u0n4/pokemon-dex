import React, { useEffect, useState } from 'react';
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001"; // 환경 변수 또는 기본값

const Pokedex = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/pokemon`); // API 호출
        setPokemonData(response.data);
      } catch (error) {
        console.error("❌ Error fetching Pokémon data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className='container'>
      <h1>Pokédex</h1>
      {loading ? <p>Loading...</p> : (
        <div className="pokemon-list">
          {pokemonData.map((pokemon) => (
            <div key={pokemon.id} className='pokemon'>
              <img src={pokemon.sprite} alt={pokemon.name} />
              <p>{pokemon.name}</p>
              <p>ID: {pokemon.id}</p>
              <p>Type: {pokemon.type.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pokedex;
