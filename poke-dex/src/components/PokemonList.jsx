import React, { useEffect, useState } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import "../styles/PokemonList.css";

const LIMIT = 18;

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

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [allPokemonNames, setAllPokemonNames] = useState([]);
  const [showTopButton, setShowTopButton] = useState(false);
  const { ref, inView } = useInView();

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`);
      const results = res.data.results;

      const detailPromises = results.map((pokemon) => axios.get(pokemon.url));
      const speciesPromises = results.map((pokemon) =>
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`)
      );

      const detailResults = await Promise.all(detailPromises);
      const speciesResults = await Promise.all(speciesPromises);

      const data = detailResults.map((res, index) => {
        const speciesData = speciesResults[index].data;
        const koreanNameEntry = speciesData.names.find(
          (entry) => entry.language.name === "ko"
        );
        return {
          id: res.data.id,
          name: koreanNameEntry ? koreanNameEntry.name : res.data.name,
          image: res.data.sprites.front_default,
          types: res.data.types.map((t) => t.type.name),
        };
      });

      setPokemonList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueData = data.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueData];
      });
    } catch (err) {
      console.error("API 에러:", err);
    }
    setLoading(false);
  };

  const fetchAllPokemonNames = async () => {
    try {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
      setAllPokemonNames(res.data.results);
    } catch (err) {
      console.error("전체 포켓몬 목록 불러오기 실패:", err);
    }
  };

  const searchPokemon = async (term) => {
    if (!term) return;

    const matched = allPokemonNames.filter((p) => p.name.includes(term.toLowerCase()));
    if (matched.length === 0) {
      setSearchResult([]);
      return;
    }

    try {
      const limitedMatched = matched.slice(0, 50);

      const detailPromises = limitedMatched.map((pokemon) => axios.get(pokemon.url));
      const speciesPromises = limitedMatched.map((pokemon) =>
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`)
      );

      const detailResults = await Promise.all(detailPromises);
      const speciesResults = await Promise.all(speciesPromises);

      const results = detailResults.map((res, index) => {
        const speciesData = speciesResults[index].data;
        const koreanNameEntry = speciesData.names.find(
          (entry) => entry.language.name === "ko"
        );
        return {
          id: res.data.id,
          name: koreanNameEntry ? koreanNameEntry.name : res.data.name,
          image: res.data.sprites.front_default,
          types: res.data.types.map((t) => t.type.name),
        };
      });

      setSearchResult(results);
    } catch (err) {
      console.error("검색 결과 가져오기 실패:", err);
      setSearchResult([]);
    }
  };

  useEffect(() => {
    fetchPokemon();
    fetchAllPokemonNames();
  }, []);

  useEffect(() => {
    if (offset === 0) return;
    fetchPokemon();
  }, [offset]);

  useEffect(() => {
    if (inView && !loading && !searchTerm) {
      setOffset((prev) => prev + LIMIT);
    }
  }, [inView, loading, searchTerm]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchTerm(value);

    if (value === "") {
      setSearchResult([]);
    } else {
      searchPokemon(value);
    }
  };

  const localFiltered = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayList = searchTerm
    ? searchResult.length
      ? searchResult
      : localFiltered
    : pokemonList;

  return (
    <>
      <div className="search-bar">
        <input
          type="text"
          placeholder="포켓몬 이름 검색..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="pokemon-grid">
        {displayList.map((pokemon) => (
          <Link to={`/pokemon/${pokemon.id}`} key={pokemon.id}>
            <div className="pokemon-card">
              <img className="pokemon-image" src={pokemon.image} alt={pokemon.name} />
              <p className="pokemon-id">No.{String(pokemon.id).padStart(4, "0")}</p>
              <h3 className="pokemon-name">{pokemon.name}</h3>
              <div className="pokemon-types">
                {pokemon.types.map((type, i) => (
                  <span className={`type-badge type-${type}`} key={i}>
                    {getTypeKo(type)}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {loading && <p className="loading-text">로딩 중...</p>}
      <div ref={ref} className="inview-trigger" />

      {showTopButton && (
        <button className="top-button" onClick={scrollToTop}>TOP</button>
      )}

    </>
  );
};

export default PokemonList;
