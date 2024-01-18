const express = require("express");
const app = express();

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDb = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => console.log("Server Stared"));
  // console.log(db);
};
initializeDb();

app.get("/players/", async (request, response) => {
  const query = `SELECT player_id AS playerId , player_name AS playerName
    FROM
    player_details
    `;
  const result = await db.all(query);
  response.send(result);
});

app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const query = `SELECT player_id AS playerId , player_name AS playerName
    FROM
    player_details
    WHERE
    player_id=${playerId}
    `;
    const result = await db.get(query);
    // console.log(playerId);
    response.send(result);
  } catch (e) {
    console.log(e);
  }
  // console.log(request.params);
});

app.use(express.json());

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  console.log(playerName);
  const query = `UPDATE player_details
    SET
    player_name='${playerName}'
    WHERE
    player_id=${playerId}
    `;
  const result = await db.run(query);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `
    SELECT match_id as matchId , match,year
    FROM 
    match_details
    WHERE
    match_id=${matchId}

    `;
  const result = await db.get(query);
  response.send(result);
});

app.get("/players/:playerId/matches", async (request, response) => {
  try {
    const { playerId } = request.params;
    const query = `
     SELECT match_details.match_id as matchId , match, year
     FROM
     match_details
     INNER JOIN player_match_score ON player_match_score.match_id=match_details.match_id
     WHERE
     player_id =${playerId}
    `;
    const result = await db.all(query);
    response.send(result);
  } catch (e) {
    console.log(e);
  }
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `
    SELECT player_details.player_id as playerId , player_name as playerName
    FROM
    player_details
    INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id
    WHERE
    match_id=${matchId}
    `;
  const result = await db.all(query);
  response.send(result);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    SELECT player_details.player_id as playerId,
    player_details.player_name as playerName,
    SUM(score) as totalScore,
    SUM(fours) as totalFours,
    SUM(sixes) as totalSixes
    FROM 
    player_match_score
    INNER JOIN player_details ON player_details.player_id=player_match_score.player_id
    WHERE
    player_match_score.player_id=${playerId}
    `;
  const result = await db.get(query);
  response.send(result);
});

module.exports = app;
