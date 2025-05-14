// backend/setup-tabelle.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database.sqlite');

// Funzione helper per eseguire query con log
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        console.error("Errore:", err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

(async () => {
  try {
    // Drop tabelle se esistono (per sviluppo)
    const tables = [
      'linee', 'stabilimenti', 'contenitori', 'formati', 'tipologie', 'categorie', 'tipo_contenitore'
    ];
    for (const table of tables) {
      await runQuery(`DROP TABLE IF EXISTS ${table}`);
    }

    // Creazione tabelle
    await runQuery(`CREATE TABLE linee (codice TEXT PRIMARY KEY, descrizione TEXT)`);
    await runQuery(`CREATE TABLE stabilimenti (codice TEXT PRIMARY KEY, descrizione TEXT)`);
    await runQuery(`CREATE TABLE contenitori (codice TEXT PRIMARY KEY, descrizione TEXT)`);
    await runQuery(`CREATE TABLE formati (codice TEXT PRIMARY KEY, descrizione TEXT)`);
    await runQuery(`CREATE TABLE tipologie (codice TEXT PRIMARY KEY, descrizione TEXT)`);
    await runQuery(`CREATE TABLE categorie (codice TEXT PRIMARY KEY, descrizione TEXT)`);
    await runQuery(`CREATE TABLE tipo_contenitore (codice TEXT PRIMARY KEY, descrizione TEXT)`);

    // Inserimento dati iniziali
    await runQuery(`INSERT INTO linee (codice, descrizione) VALUES
      ('VOL', 'Vola Volè'), ('LUN', 'Lunaria'), ('LNA', 'Lunaria Ancestrale'),
      ('VVD', 'Vola Volè Seven Dot'), ('VMP', 'Vola Volè Maiella Park'),
      ('EVA', 'Eva Patch'), ('PCH', 'Patch Wine')`);

    await runQuery(`INSERT INTO stabilimenti (codice, descrizione) VALUES
      ('0', 'Orsogna'), ('1', 'Castel Frentano'), ('2', 'Altro')`);

    await runQuery(`INSERT INTO contenitori (codice, descrizione) VALUES
      ('A', 'Bottiglia'), ('B', 'Bag in Box'), ('L', 'Lattina')`);

    await runQuery(`INSERT INTO formati (codice, descrizione) VALUES
      ('A', '3,5 L'), ('B', '0,75 L'), ('C', '1,5 L'), ('D', '3 L'),
      ('E', '5 L'), ('F', '10 L'), ('G', '15 L'), ('H', '2 + 2 L'),
      ('I', '2 L'), ('L', '0,5 L'), ('M', '0,25 L'), ('N', '0,375 L'), ('P', '20 L')`);

    await runQuery(`INSERT INTO tipologie (codice, descrizione) VALUES
      ('PSS','Passerina'), ('SPP','Spumante Passerina'), ('PCR','Pecorino'),
      ('TRB','Trebbiano'), ('CRS','Cerasuolo'), ('PNG','Pinot Grigio'),
      ('PGS','Pinot Grigio Spumante'), ('MNT','Montepulciano'),
      ('MNR','Montepulciano Riserva'), ('PRM','Montepulciano Primitivo'),
      ('SNP','Sangiovese Primitivo'), ('UAR','Uve Rosse Appassite'),
      ('CCC','Cococciola'), ('PTC','Primitivo Terre di Chieti'),
      ('PIP','Primitivo IGT Puglia'), ('MLV','Malvasia'),
      ('MSC','Moscato'), ('MSS','Moscato Spumante'),
      ('BGT','Vino Bianco IGT'), ('RGT','Vino Rosato IGT'),
      ('UAB','Uve Bianche Appassite'), ('PCS','Pecorino Spumante'),
      ('PCA','Pecorino Aete')`);

    await runQuery(`INSERT INTO categorie (codice, descrizione) VALUES
      ('1', 'Semilavorato'), ('2', 'Semiconfezionato'), ('3', 'Prodotto finito')`);

    await runQuery(`INSERT INTO tipo_contenitore (codice, descrizione) VALUES
      ('01','Capsula + Etichetta'), ('02','Tappo Sughero + Etichetta'),
      ('03','Tappo Vite + Etichetta'), ('10','Standard'), ('11','Etichetta Speciale')`);

    console.log("✅ Tabelle create e popolate correttamente.");
    db.close();
  } catch (err) {
    console.error("❌ Errore durante la creazione delle tabelle:", err);
    db.close();
  }
})();
