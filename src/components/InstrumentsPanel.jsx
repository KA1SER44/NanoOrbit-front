import { useCallback, useEffect, useState } from "react";
import {
  createEmbarquement,
  deleteEmbarquement,
  fetchAllSatellites,
  fetchSatelliteInstruments,
  updateEmbarquementEtat,
} from "../api/back.js";
import "../styles/planCommunication.css";
import "../styles/satellitesList.css";
import "../styles/instrumentsList.css";

const ETAT_OPTIONS = ["Nominal", "Dégradé", "Hors service"];

function getEtatBadgeClass(etat) {
  const value = String(etat ?? "").toLowerCase();

  if (value.includes("nominal")) {
    return "instrEtatBadge instrEtatNominal";
  }

  if (value.includes("dégrad") || value.includes("degrad")) {
    return "instrEtatBadge instrEtatDegrade";
  }

  if (value.includes("hors")) {
    return "instrEtatBadge instrEtatHorsService";
  }

  return "instrEtatBadge";
}

function EtatBadge({ etat }) {
  return <span className={getEtatBadgeClass(etat)}>{etat ?? "—"}</span>;
}

export default function InstrumentsPanel() {
  const [satellites, setSatellites] = useState([]);
  const [satellitesLoading, setSatellitesLoading] = useState(true);
  const [satellitesError, setSatellitesError] = useState("");

  const [idSatellite, setIdSatellite] = useState("");
  const [instruments, setInstruments] = useState([]);
  const [instrumentsLoading, setInstrumentsLoading] = useState(false);
  const [instrumentsError, setInstrumentsError] = useState("");

  const [addIdInstrument, setAddIdInstrument] = useState("");
  const [addEtat, setAddEtat] = useState(ETAT_OPTIONS[0]);
  const [adding, setAdding] = useState(false);
  const [addFeedback, setAddFeedback] = useState(null);

  const [rowAction, setRowAction] = useState(null);
  const [rowFeedback, setRowFeedback] = useState(null);

  const loadSatellites = useCallback(async () => {
    setSatellitesLoading(true);
    setSatellitesError("");

    try {
      const data = await fetchAllSatellites();
      const rows = Array.isArray(data) ? data : [];
      setSatellites(rows);
      setIdSatellite((current) => current || rows[0]?.id_satellite || "");
    } catch (error) {
      setSatellites([]);
      setSatellitesError(
        error.response?.data?.error ||
          "Impossible de charger la liste des satellites.",
      );
    } finally {
      setSatellitesLoading(false);
    }
  }, []);

  const loadInstruments = useCallback(async (satelliteId) => {
    if (!satelliteId) {
      setInstruments([]);
      return;
    }

    setInstrumentsLoading(true);
    setInstrumentsError("");

    try {
      const data = await fetchSatelliteInstruments(satelliteId);
      setInstruments(Array.isArray(data) ? data : []);
    } catch (error) {
      setInstruments([]);
      setInstrumentsError(
        error.response?.data?.error ||
          "Impossible de charger les instruments embarqués.",
      );
    } finally {
      setInstrumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSatellites();
  }, [loadSatellites]);

  useEffect(() => {
    if (!idSatellite) {
      setInstruments([]);
      return;
    }

    loadInstruments(idSatellite);
  }, [idSatellite, loadInstruments]);

  const selectedSatellite = satellites.find(
    (sat) => sat.id_satellite === idSatellite,
  );

  async function handleAddInstrument(event) {
    event.preventDefault();
    setAddFeedback(null);

    const refInstrument = addIdInstrument.trim();
    if (!refInstrument) {
      setAddFeedback({
        type: "error",
        message: "Saisissez la référence de l'instrument.",
      });
      return;
    }

    setAdding(true);

    try {
      const data = await createEmbarquement({
        id_satellite: idSatellite,
        id_instrument: refInstrument,
        etat_fonctionnement: addEtat,
      });

      setAddFeedback({
        type: "success",
        message: data.message || "Instrument embarqué sur le satellite.",
      });
      setAddIdInstrument("");
      await loadInstruments(idSatellite);
    } catch (error) {
      setAddFeedback({
        type: "error",
        message:
          error.response?.data?.error ||
          "Échec de l'embarquement. Vérifiez que l'instrument n'est pas déjà sur un autre satellite (RG-I03).",
      });
    } finally {
      setAdding(false);
    }
  }

  async function handleEtatChange(idInstrument, newEtat) {
    setRowFeedback(null);
    setRowAction({ idInstrument, type: "etat" });

    try {
      const data = await updateEmbarquementEtat(
        idSatellite,
        idInstrument,
        newEtat,
      );
      setInstruments((rows) =>
        rows.map((row) =>
          row.id_instrument === idInstrument
            ? { ...row, etat_fonctionnement: newEtat }
            : row,
        ),
      );
      setRowFeedback({
        type: "success",
        message: data.message || "État de l'instrument mis à jour.",
      });
    } catch (error) {
      setRowFeedback({
        type: "error",
        message:
          error.response?.data?.error ||
          "Échec de la mise à jour de l'état.",
      });
      await loadInstruments(idSatellite);
    } finally {
      setRowAction(null);
    }
  }

  async function handleRemove(idInstrument, nom) {
    const label = nom || idInstrument;
    if (
      !window.confirm(
        `Retirer l'instrument ${label} du satellite ${idSatellite} ?`,
      )
    ) {
      return;
    }

    setRowFeedback(null);
    setRowAction({ idInstrument, type: "delete" });

    try {
      const data = await deleteEmbarquement(idSatellite, idInstrument);
      setRowFeedback({
        type: "success",
        message: data.message || "Instrument retiré du satellite.",
      });
      await loadInstruments(idSatellite);
    } catch (error) {
      setRowFeedback({
        type: "error",
        message:
          error.response?.data?.error || "Échec du retrait de l'instrument.",
      });
    } finally {
      setRowAction(null);
    }
  }

  return (
    <div className="instrumentsPage">
      <section
        className="satShell planShell instrumentsShell"
        aria-labelledby="instruments-title"
      >
        <header className="planHeader">
          <div>
            <span className="page-label">BO-05</span>
            <h2 id="instruments-title">Instruments embarqués</h2>
            <p className="planSubtitle">
              Gérez les instruments de chaque satellite — ajout, retrait et état
              de fonctionnement. Un instrument ne peut pas être embarqué sur
              deux satellites (RG-I03).
            </p>
          </div>
          <span className="planRoleTag">operateur · admin</span>
        </header>

        <div className="instrumentsToolbar">
          <div className="instrumentsFilterField">
            <label className="form-label" htmlFor="instruments-satellite">
              Satellite
            </label>
            <select
              id="instruments-satellite"
              className="form-input instrumentsSelect"
              value={idSatellite}
              onChange={(event) => setIdSatellite(event.target.value)}
              disabled={satellitesLoading || !satellites.length}
            >
              <option value="">
                {satellitesLoading
                  ? "Chargement…"
                  : satellites.length === 0
                    ? "Aucun satellite"
                    : "Choisir un satellite"}
              </option>
              {satellites.map((sat) => (
                <option key={sat.id_satellite} value={sat.id_satellite}>
                  {sat.id_satellite} — {sat.nom ?? sat.nom_satellite}
                </option>
              ))}
            </select>
          </div>

          {selectedSatellite ? (
            <p className="instrumentsSatMeta">
              <span className="instrumentsSatLabel">Satellite sélectionné</span>
              <strong>{selectedSatellite.nom ?? selectedSatellite.nom_satellite}</strong>
              <span className="instrumentsSatStatut">
                {selectedSatellite.statut ?? "—"}
              </span>
            </p>
          ) : null}
        </div>

        {satellitesError ? (
          <p className="planState planStateError" role="alert">
            {satellitesError}
          </p>
        ) : null}

        {rowFeedback ? (
          <div
            className={`alert-banner planFeedback ${rowFeedback.type === "success" ? "info" : "critical"}`}
            role="alert"
          >
            <div>
              <p className="alert-title">
                {rowFeedback.type === "success" ? "Succès" : "Erreur"}
              </p>
              <p className="alert-body">{rowFeedback.message}</p>
            </div>
          </div>
        ) : null}

        <div className="instrumentsListScroll">
        <div className="instrumentsList" role="table" aria-label="Instruments embarqués">
          <div className="instrumentsHeader" role="row">
            <span role="columnheader">ID</span>
            <span role="columnheader">Nom</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">État</span>
            <span role="columnheader">Actions</span>
          </div>

          {satellitesLoading || instrumentsLoading ? (
            <p className="instrumentsState">Chargement des instruments…</p>
          ) : instrumentsError ? (
            <p className="instrumentsState instrumentsStateError" role="alert">
              {instrumentsError}
            </p>
          ) : !idSatellite ? (
            <p className="instrumentsState">Sélectionnez un satellite.</p>
          ) : instruments.length === 0 ? (
            <p className="instrumentsState">
              Aucun instrument embarqué sur ce satellite.
            </p>
          ) : (
            instruments.map((instrument) => {
              const idInst = instrument.id_instrument;
              const isUpdating =
                rowAction?.idInstrument === idInst &&
                rowAction?.type === "etat";
              const isDeleting =
                rowAction?.idInstrument === idInst &&
                rowAction?.type === "delete";
              const etat = instrument.etat_fonctionnement || "Nominal";

              return (
                <div key={idInst} className="instrumentsRow" role="row">
                  <span className="instrumentsId" role="cell">
                    {idInst}
                  </span>
                  <span className="instrumentsNom" role="cell">
                    {instrument.nom ?? instrument.nom_instrument ?? "—"}
                  </span>
                  <span className="instrumentsType" role="cell">
                    {instrument.type_instrument ?? "—"}
                  </span>
                  <span className="instrumentsEtatCell" role="cell">
                    <EtatBadge etat={etat} />
                    <select
                      className="form-input instrumentsEtatSelect"
                      value={etat}
                      onChange={(event) =>
                        handleEtatChange(idInst, event.target.value)
                      }
                      disabled={isUpdating || isDeleting}
                      aria-label={`État de ${idInst}`}
                    >
                      {ETAT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span className="instrumentsActions" role="cell">
                    <button
                      type="button"
                      className="btn btn-danger instrumentsRemoveBtn"
                      onClick={() =>
                        handleRemove(
                          idInst,
                          instrument.nom ?? instrument.nom_instrument,
                        )
                      }
                      disabled={isUpdating || isDeleting}
                    >
                      {isDeleting ? "Retrait…" : "Retirer"}
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>
        </div>

        <form
          className="planForm instrumentsAddForm"
          onSubmit={handleAddInstrument}
        >
          <h3 className="instrumentsAddTitle">Ajouter un instrument</h3>

          <div className="planFormGrid">
            <div className="form-group">
              <label className="form-label" htmlFor="instruments-add-ref">
                ID / réf. instrument
              </label>
              <input
                id="instruments-add-ref"
                type="text"
                className="form-input"
                value={addIdInstrument}
                onChange={(event) => setAddIdInstrument(event.target.value)}
                placeholder="ex. IR-MID-01"
                disabled={adding || !idSatellite}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="instruments-add-etat">
                État initial
              </label>
              <select
                id="instruments-add-etat"
                className="form-input"
                value={addEtat}
                onChange={(event) => setAddEtat(event.target.value)}
                disabled={adding || !idSatellite}
              >
                {ETAT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {addFeedback ? (
            <div
              className={`alert-banner planFeedback ${addFeedback.type === "success" ? "info" : "critical"}`}
              role="alert"
            >
              <div>
                <p className="alert-title">
                  {addFeedback.type === "success" ? "Succès" : "Erreur"}
                </p>
                <p className="alert-body">{addFeedback.message}</p>
              </div>
            </div>
          ) : null}

          <div className="planActions">
            <button
              type="submit"
              className="btn btn-primary planSubmit"
              disabled={adding || !idSatellite}
            >
              {adding ? "Embarquement…" : "Embarquer l'instrument"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
