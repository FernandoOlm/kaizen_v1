// INÍCIO — importar se necessário
// (ajuste o caminho conforme sua estrutura)
import pkg from "@whiskeysockets/baileys";
const { delay } = pkg;
// FIM



// =========================================================
// INÍCIO listar-membros.js — Função PRO
// =========================================================
export async function comandoListarMembros(msg, sock) {
  try {
    // INÍCIO — JID
    const jid = msg.key.remoteJid;
    console.log("[LISTAR MEMBROS] JID recebido:", jid);
    // FIM

    // INÍCIO — Verifica se é grupo
    if (!jid.endsWith("@g.us")) {
      console.log("[LISTAR MEMBROS] Não é grupo, ignorando.");
      return {
        erro: "Este comando só funciona em grupos.",
        membros: []
      };
    }
    // FIM

    // INÍCIO — Metadata
    let meta;
    try {
      meta = await sock.groupMetadata(jid);
    } catch (e) {
      console.log("[LISTAR MEMBROS] Erro ao puxar metadata:", e);
      return {
        erro: "Não consegui puxar os dados do grupo.",
        membros: []
      };
    }

    console.log("[LISTAR MEMBROS] Metadata recebida. Participants:", meta?.participants?.length);
    // FIM

    // INÍCIO — Sem admin?
    if (!meta.participants || meta.participants.length === 0) {
      return {
        erro: "O bot NÃO é admin. O WhatsApp bloqueia a lista.",
        membros: []
      };
    }
    // FIM

    // INÍCIO — Processamento dos membros
    const membros = meta.participants.map(p => {
      const wid = p.id;
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

    return {
      total: membros.length,
      membros
    };

  } catch (err) {
    console.log("[LISTAR MEMBROS] ERRO CRÍTICO:", err);
    return {
      erro: "Erro inesperado.",
      membros: []
    };
  }
}
// =========================================================
// FIM listar-membros.js — Função PRO
// =========================================================





// =========================================================
// INÍCIO — Handler do comando !membros
// =========================================================
export async function handlerListarMembros(msg, sock, command) {
  try {
    // INÍCIO — Só ativa no comando correto
    if (command !== "!membros") return;
    // FIM

    // INÍCIO — Chama função principal
    const r = await comandoListarMembros(msg, sock);
    // FIM

    // INÍCIO — Tratamento de erro
    if (r.erro) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ ${r.erro}`
      });
      return;
    }
    // FIM

    // INÍCIO — Sem membros
    if (!r.membros || r.membros.length === 0) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Nenhum membro encontrado."
      });
      return;
    }
    // FIM

    // INÍCIO — Monta texto final
    const texto = `👥 *Membros (${r.total})*\n\n${r.membros.join("\n")}`;
    // FIM

    // INÍCIO — Envia
    await sock.sendMessage(msg.key.remoteJid, { text: texto });
    // FIM

  } catch (e) {
    console.log("[HANDLER LISTAR MEMBROS] ERRO:", e);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "❌ Erro ao listar membros."
    });
  }
}
// =========================================================
// FIM — Handler do comando !membros
// =========================================================