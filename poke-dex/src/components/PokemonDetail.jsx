import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/PokemonDetail.css";

const typeKoMap = {
  normal: "노말",
  fighting: "격투",
  flying: "비행",
  poison: "독",
  ground: "땅",
  rock: "바위",
  bug: "벌레",
  ghost: "고스트",
  steel: "강철",
  fire: "불꽃",
  water: "물",
  grass: "풀",
  electric: "전기",
  psychic: "에스퍼",
  ice: "얼음",
  dragon: "드래곤",
  dark: "악",
  fairy: "페어리",
};

const getTypeKo = (type) => typeKoMap[type] || type;

const parseEvolutionChain = (chain) => {
  const evolutionArray = [];

  let current = chain;
  while (current) {
    evolutionArray.push(current.species);
    if (current.evolves_to.length > 0) {
      current = current.evolves_to[0];
    } else {
      current = null;
    }
  }

  return evolutionArray;
};

const PokemonDetail = () => {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const species = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        const evolution = await axios.get(species.data.evolution_chain.url);

        const koreanName = species.data.names.find(n => n.language.name === "ko");

        const abilityKoreanNames = await Promise.all(
          res.data.abilities.map(async (a) => {
            const abilityDetail = await axios.get(a.ability.url);
            const nameKo = abilityDetail.data.names.find(n => n.language.name === "ko");
            return nameKo?.name || a.ability.name;
          })
        );

        const habitatKo = species.data.habitat?.name || "없음";
        const habitatKoMap = {
          cave: "동굴",
          forest: "숲",
          grassland: "초원",
          mountain: "산",
          rare: "희귀",
          sea: "바다",
          urban: "도시",
          waters_edge: "물가",
        };

        const evolutionChain = await Promise.all(parseEvolutionChain(evolution.data.chain).map(async (species) => {
          const speciesDetail = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${species.name}`);
          const koreanNameEntry = speciesDetail.data.names.find(n => n.language.name === "ko");
          const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
          return {
            id: speciesRes.data.id,
            name: koreanNameEntry ? koreanNameEntry.name : species.name,
            image: speciesRes.data.sprites.front_default,
          };
        }));

        setPokemon({
          id: res.data.id,
          name: koreanName?.name || res.data.name,
          image: res.data.sprites.front_default,
          types: res.data.types.map(t => t.type.name),
          abilities: abilityKoreanNames,
          habitat: habitatKoMap[habitatKo] || habitatKo,
          evolutionChain,
          height: res.data.height / 10 + "m",
          weight: res.data.weight / 10 + "kg",
        });
      } catch (err) {
        console.error("상세 데이터 불러오기 실패:", err);
      }
    };

    fetchDetail();
  }, [id]);

  if (!pokemon) return <p>포켓몬 정보를 불러오는 중입니다...</p>;

  return (
    <div className="pokemon-detail">
      <h2>No.{String(pokemon.id).padStart(4, "0")} {pokemon.name}</h2>
      <img className="pokemon-detail-image" src={pokemon.image} alt={pokemon.name} />
      <table className="pokemon-info">
        <tbody>
        <tr>
          <th>타입</th>
          <td>
            {pokemon.types.map((type, i) => (
              <span key={i} className={`type-badge type-${type}`}>
                  {getTypeKo(type)}
                </span>
            ))}
          </td>
        </tr>
        <tr>
          <th>키</th>
          <td>{pokemon.height}</td>
        </tr>
        <tr>
          <th>몸무게</th>
          <td>{pokemon.weight}</td>
        </tr>
        <tr>
          <th>서식지</th>
          <td>{pokemon.habitat}</td>
        </tr>
        <tr>
          <th>특성</th>
          <td>{pokemon.abilities.join(", ")}</td>
        </tr>
        </tbody>
      </table>

      <h3>진화 트리</h3>
      <div className="evolution-chain">
        {pokemon.evolutionChain.map((species, idx) => (
          <React.Fragment key={species.name}>
            <Link to={`/pokemon/${species.id}`} className="evolution-item">
              <img src={species.image} alt={species.name} />
              <p>{species.name}</p>
            </Link>
            {idx < pokemon.evolutionChain.length - 1 && (
              <span className="arrow">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <Link to="/" className="back-home">메인으로 돌아가기</Link>

    </div>
  );
};

export default PokemonDetail;
