
-- Tabelle per i campi selezionabili
CREATE TABLE IF NOT EXISTS linee (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    codice TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS stabilimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    codice TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS contenitori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    codice TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS formati (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    codice TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipologie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    codice TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS confezioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    codice TEXT NOT NULL UNIQUE
);

-- Tabella prodotti principale
CREATE TABLE IF NOT EXISTS prodotti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_linea INTEGER NOT NULL,
    id_stabilimento INTEGER NOT NULL,
    id_contenitore INTEGER NOT NULL,
    id_formato INTEGER NOT NULL,
    id_tipologia INTEGER NOT NULL,
    id_confezione INTEGER NOT NULL,
    codice_cliente TEXT,
    data_creazione TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_linea) REFERENCES linee(id),
    FOREIGN KEY (id_stabilimento) REFERENCES stabilimenti(id),
    FOREIGN KEY (id_contenitore) REFERENCES contenitori(id),
    FOREIGN KEY (id_formato) REFERENCES formati(id),
    FOREIGN KEY (id_tipologia) REFERENCES tipologie(id),
    FOREIGN KEY (id_confezione) REFERENCES confezioni(id)
);
