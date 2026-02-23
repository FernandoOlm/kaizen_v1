// INÍCIO listar-membros.js — VERSÃO PRO V2 TOTAL

export async function comandoListarMembros(msg, sock) {
  try {
    // INÍCIO — Identifica JID
    const jid = msg.key.remoteJid;
    console.log("[LISTAR MEMBROS] JID recebido:", jid);
    // FIM

    // INÍCIO — Confere se é grupo
    if (!jid.endsWith("@g.us")) {
      console.log("[LISTAR MEMBROS] Não é grupo, ignorando.");
      return {
        tipo: "listar_membros",
        erro: "JID não é grupo",
        membros: []
      };
    }
    // FIM

    // INÍCIO — Puxa metadata
    let meta;
    try {
      meta = await sock.groupMetadata(jid);
    } catch (e) {
      console.log("[LISTAR MEMBROS] Erro ao puxar metadata:", e);
      return {
        tipo: "listar_membros",
        erro: "Falha ao puxar metadata do grupo",
        membros: []
      };
    }

    console.log("[LISTAR MEMBROS] Metadata recebida. Participants:", meta?.participants?.length);
    // FIM

    // INÍCIO — Se não vier participants, provavelmente sem admin
    if (!meta.participants || meta.participants.length === 0) {
      console.log("[LISTAR MEMBROS] Participants vazio → bot sem admin.");
      return {
        tipo: "listar_membros",
        erro: "Permissão insuficiente (bot não é admin)",
        membros: []
      };
    }
    // FIM

    // INÍCIO — Lista final
    const membros = meta.participants.map(p => {
      const wid = p.id; // ex: 55119..@c.us
      const [base, dominio] = wid.split("@");

      const nomeDetectado =
        p.notify ||
        p.name ||
        p.vname ||
        null;

      let nomeFinal = "Oculto";

      if (dominio === "c.us" || dominio === "s.whatsapp.net") {
        nomeFinal = nomeDetectado ? nomeDetectado : "Sem nome";
      } else {
        nomeFinal = nomeDetectado
          ? `${nomeDetectado} (privado)`
          : "Oculto";
      }

      return `${base} | ${nomeFinal}`;
    });
    // FIM

    // INÍCIO — Retorna
    return {
      tipo: "listar_membros",
      total: membros.length,
      membros
    };
    // FIM

  } catch (err) {
    console.log("[LISTAR MEMBROS] Erro crítico:", err);
    return {
      tipo: "listar_membros",
      erro: "Erro inesperado",
      detalhes: String(err),
      membros: []
    };
  }
}

// FIM listar-membros.js — VERSÃO PRO V2 TOTAL