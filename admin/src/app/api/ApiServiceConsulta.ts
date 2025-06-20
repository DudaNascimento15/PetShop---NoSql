import {Timestamp, doc, updateDoc, deleteDoc, getDocs, addDoc, getDoc, collection, query, where  } from "firebase/firestore";
import { db } from "./firebase";


export interface ResponseApi {
  data?: any;
  mensagem?: string;
  status: number;
}

export async function buscarConsultaPorId(id: string): Promise<ResponseApi> {
    try {
      const docSnap = await getDoc(doc(db, "Consultas", id));
  
      if (docSnap.exists()) {
        const Consulta = { id: docSnap.id, ...docSnap.data() };
        return {
          status: 200,
          mensagem: "Consulta encontrado com sucesso!",
          data: Consulta
        };
      } else {
        return {
          status: 404,
          mensagem: "Consulta não encontrado!"
        };
      }
    } catch (error) {
      console.error("Erro ao buscar Consulta:", error);
      return {
        status: 500,
        mensagem: "Erro ao buscar Consulta",
        data: error
      };
    }
  }

  export async function buscarConsultaPorVetEData(
  veterinario: string,
  data: Date
): Promise<ResponseApi> {
  try {
    const ConsultasRef = collection(db, "Consultas");

    const startOfDay = new Date(data);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(data);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      ConsultasRef,
      where("veterinario", "==", veterinario),
      where("data", ">=", startOfDay),
      where("data", "<=", endOfDay)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const Consultas: any[] = [];
      querySnapshot.forEach((doc) => {
        Consultas.push({ id: doc.id, ...doc.data() });
      });

      return {
        status: 200,
        mensagem: "Consulta(s) encontrada(s) com sucesso!",
        data: Consultas,
      };
    } else {
      return {
        status: 404,
        mensagem: "Nenhuma consulta encontrada para esse veterinário e data.",
      };
    }
  } catch (error) {
    console.error("Erro ao buscar consulta:", error);
    return {
      status: 500,
      mensagem: "Erro ao buscar consulta",
      data: error,
    };
  }
}

export async function excluirConsultaPorId(id: string): Promise<ResponseApi> {
  try {
    await deleteDoc(doc(db, "Consultas", id));
    return {
      status: 204,
      mensagem: "Consulta excluído com sucesso!"
    };
  } catch (error) {
    console.error("Erro ao excluir Consulta:", error);
    return {
      status: 500,
      mensagem: "Erro ao excluir Consulta",
      data: error
    };
  }
}


interface ConsultaFiltro {
  veterinario?: string;
  pet?: string;
  data?: any; // Timestamp ou Date
}

export async function buscarConsultasPorFiltro(filtro: ConsultaFiltro) {
  const consultasRef = collection(db, "Consultas");

  let constraints = [];

  if (filtro.veterinario) {
    constraints.push(where("veterinario", "==", filtro.veterinario));
  }
  if (filtro.pet) {
    constraints.push(where("pet", "==", filtro.pet));
  }
  if (filtro.data) {
    const inicioDia = new Date(filtro.data);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(inicioDia);
    fimDia.setDate(fimDia.getDate() + 1);

    constraints.push(where("data", ">=", inicioDia));
    constraints.push(where("data", "<", fimDia));
  }

  const q = query(consultasRef, ...constraints);
  const snapshot = await getDocs(q);

  const resultados = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return resultados;
}


export async function alterarConsultaPorId(id: string, body: any): Promise<ResponseApi> {
  try {
    const consultasRef = collection(db, "Consultas");
    const q = query(
      consultasRef,
      where("veterinario", "==", body.veterinario),
      where("data", "==", body.data) 
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return {
        status: 400,
        mensagem: "Já existe uma consulta agendada para esse veterinário nessa data.",
        data: null
      };
    }

    const docRef = doc(db, "Consultas", id);
    await updateDoc(docRef, body);

    return {
      status: 200,
      mensagem: "Consulta alterado com sucesso!"
    };
  } catch (error) {
    console.error("Erro ao alterar Consulta:", error);
    return {
      status: 500,
      mensagem: "Erro ao alterar Consulta",
      data: error
    };
  }
}

export async function adicionarConsulta(body: any): Promise<ResponseApi> {
  try {
    const consultasRef = collection(db, "Consultas");
    const q = query(
      consultasRef,
      where("veterinario", "==", body.veterinario),
      where("data", "==", body.data) 
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return {
        status: 400,
        mensagem: "Já existe uma consulta agendada para esse veterinário nessa data.",
        data: null
      };
    }

    const docRef = await addDoc(collection(db, "Consultas"), body);

    return {
      status: 201,
      mensagem: "Consulta adicionado com sucesso!",
      data: { id: docRef.id }
    };
  } catch (error) {
    console.error("Erro ao adicionar Consulta:", error);
    return {
      status: 500,
      mensagem: "Erro ao adicionar Consulta",
      data: error
    };
  }
}


export async function buscarTodosConsultas() {
  try {
    const ConsultasRef = collection(db, "Consultas");
    const snapshot = await getDocs(ConsultasRef);

    const Consultas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Consultas;
  } catch (error) {
    console.error("Erro ao buscar todos Consultas:", error);
    return [];
  }
}

export async function buscarTodosConsultasParaPet() {
    try {
      const ConsultasRef = collection(db, "Consultas");
      const snapshot = await getDocs(ConsultasRef);
  
      const Consultas = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
  
      return Consultas;
    } catch (error) {
      console.error("Erro ao buscar todos Consultas:", error);
      return [];
    }
  }