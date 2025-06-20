"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Image } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./page.module.css";
import { buscarTodospets, buscarPetPorRaca } from "../../api/ApiServicePets";
import { buscarTodasRacas } from "../../api/ApiServiceRaca";

export default function Consultar() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [racaFiltro, setRacaFiltro] = useState<string>("");
  const [racas, setRacas] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    async function fetchPets() {
      const pets = await buscarTodospets();
      setData(pets);
      setLoading(false);
    }
    fetchPets();
  }, []);

  useEffect(() => {
    async function carregarRacas() {
      const listaRacas = await buscarTodasRacas();
      setRacas(listaRacas);
    }
    carregarRacas();
  }, []);

  const handleFiltroRaca = async () => {
    if (racaFiltro.trim() === "") {
      toast.error("Selecione uma raça para buscar.");
      return;
    }

    try {
      const petsFiltrados = await buscarPetPorRaca(racaFiltro);

      if (petsFiltrados.length > 0) {
        setData(petsFiltrados);
        toast.success("Pets filtrados por raça!");
      } else {
        toast.info("Nenhum pet encontrado para essa raça.");
        setData([]);
      }
    } catch (error) {
      toast.error("Erro ao buscar pets por raça.");
    }
  };

  const handleCancelarFiltro = async () => {
    try {
      const todosPets = await buscarTodospets();
      setData(todosPets);
      setRacaFiltro("");
    } catch (error) {
      toast.error("Erro ao buscar todos os pets.");
    }
  };

  if (loading) {
    return <p>Carregando pets...</p>;
  }

  return (
    <main className={styles.container}>
      <h1>Lista de Pets</h1>

      <Form className="mb-3">
        <Form.Group className="mb-3">
          <Form.Label>Filtrar por Raça:</Form.Label>
          <Form.Select
            value={racaFiltro}
            onChange={(e) => setRacaFiltro(e.target.value)}
          >
            <option value="">Selecione uma raça</option>
            {racas.map((raca) => (
              <option key={raca.id} value={raca.nome}>
                {raca.nome}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button variant="primary" onClick={handleFiltroRaca} className="me-3">
          Buscar
        </Button>
        <Button variant="secondary" onClick={handleCancelarFiltro}>
          Cancelar
        </Button>
      </Form>

      <div className={styles.grid}>
        {data.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <Image
                src={
                  item.foto
                    ? item.foto
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGcv25gPu69uUIwPHWhqsQauv4E9FVhk7bCw&s"
                }
                alt={item.nome}
                className="img-fluid"
              />
            </div>
            <h2 className={styles.nome}>{item.nome}</h2>
            <p className={styles.text}>Raça: {item.raca}</p>
            <p className={styles.text}>Dono: {item.dono}</p>
          </div>
        ))}
      </div>

      <ToastContainer theme="colored" />
    </main>
  );
}
