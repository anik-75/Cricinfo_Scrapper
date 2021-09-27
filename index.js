const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");

const matchId = "ipl-2020-21-1210595";

const URL = `https://www.espncricinfo.com/series/${matchId}/match-results`;

request(URL, result);

let matchStat = [];

function result(err, res, html) {
  if (err) {
    console.log(err);
    return;
  } else {
    const $ = cheerio.load(html);
    const scoreCard = $('[data-hover = "Scorecard"]');
    // console.log(scorecard.length);

    let count = 0;
    for (let i = 0; i < scoreCard.length; i++) {
      count++;
      const matchFixtureURL =
        "https://www.espncricinfo.com" + $(scoreCard[i]).attr("href");
      // console.log(matchFixtureURL);

      matchStat.push({
        Match: $(scoreCard[i]).attr("href").split("/")[3].split("-").join(" "),
        url: matchFixtureURL,
        Team1: {},
        Team2: {},
      });
    }

    for (let j in matchStat) {
      request(matchStat[j].url, fixture.bind(this, j));
    }
  }
}

let counter = 0;
function fixture(index, err, res, html) {
  counter++;

  let pathName = path.join(__dirname, matchId);

  if (fs.existsSync(pathName) == false) {
    fs.mkdirSync(pathName);
  }

  const $ = cheerio.load(html);

  let batting1 = [];
  let bowling2 = [];
  let batting2 = [];
  let bowling1 = [];

  let data = $($(".table.batsman")[0]); //bat innings1
  batInningOne(data, index);

  data = $($(".table.bowler")[0]); // bowl innings1
  bowlInningOne(data, index);

  data = $($(".table.batsman")[1]); // bat innings2
  batInningTwo(data, index);

  data = $($(".table.bowler")[1]); //bowl innings2
  bowlInningTwo(data, index);

  function batInningOne(html, index) {
    let batsmanrows = html.find("tbody>tr");

    for (let i = 0; i < batsmanrows.length; i++) {
      if (i % 2 == 0) {
        let colsData = $(batsmanrows[i]).find("td");
        if (colsData.length == 4) {
          let extras = $(colsData[2]).text();
          batting1.push({ Extras: extras });
        } else {
          let name = $($(colsData[0]).find("a")).text();
          let run = $(colsData[2]).text();
          let ball = $(colsData[3]).text();
          let four = $(colsData[5]).text();
          let six = $(colsData[6]).text();
          let sr = $(colsData[7]).text();

          batting1.push({
            Name: name,
            Runs: run,
            Balls: ball,
            "4s": four,
            "6s": six,
            SR: sr,
          });
        }
      }
    }
  }

  function bowlInningOne(html, index) {
    let bowlerRows = html.find("tbody>tr");

    for (let i = 0; i < bowlerRows.length; i++) {
      if (i % 2 == 0) {
        let colsData = $(bowlerRows[i]).find("td");

        let name = $($(colsData[0]).find("a")).text();
        let over = $(colsData[1]).text();
        let M = $(colsData[2]).text();
        let run = $(colsData[3]).text();
        let wicket = $(colsData[4]).text();
        let Econ = $(colsData[5]).text();
        let Os = $(colsData[6]).text();
        let four = $(colsData[7]).text();
        let six = $(colsData[8]).text();
        let wide = $(colsData[9]).text();
        let noBall = $(colsData[10]).text();

        bowling2.push({
          Name: name,
          O: over,
          M: M,
          R: run,
          W: wicket,
          ECON: Econ,
          "0s": Os,
          "4s": four,
          "6s": six,
          WD: wide,
          NB: noBall,
        });
      }
    }
  }

  function batInningTwo(html, index) {
    let batsmanrows = html.find("tbody>tr");

    for (let i = 0; i < batsmanrows.length; i++) {
      if (i % 2 == 0) {
        let colsData = $(batsmanrows[i]).find("td");
        if (colsData.length == 4) {
          let extras = $(colsData[2]).text();
          batting2.push({ Extras: extras });
        } else {
          let name = $($(colsData[0]).find("a")).text();
          let run = $(colsData[2]).text();
          let ball = $(colsData[3]).text();
          let four = $(colsData[5]).text();
          let six = $(colsData[6]).text();
          let sr = $(colsData[7]).text();

          batting2.push({
            Name: name,
            Runs: run,
            Balls: ball,
            "4s": four,
            "6s": six,
            SR: sr,
          });
        }
      }
    }
  }

  function bowlInningTwo(html, index) {
    let bowlerRows = html.find("tbody>tr");
    for (let i = 0; i < bowlerRows.length; i++) {
      if (i % 2 == 0) {
        let colsData = $(bowlerRows[i]).find("td");

        let name = $($(colsData[0]).find("a")).text();
        let over = $(colsData[1]).text();
        let M = $(colsData[2]).text();
        let run = $(colsData[3]).text();
        let wicket = $(colsData[4]).text();
        let Econ = $(colsData[5]).text();
        let Os = $(colsData[6]).text();
        let four = $(colsData[7]).text();
        let six = $(colsData[8]).text();
        let wide = $(colsData[9]).text();
        let noBall = $(colsData[10]).text();

        bowling1.push({
          Name: name,
          O: over,
          M: M,
          R: run,
          W: wicket,
          ECON: Econ,
          "0s": Os,
          "4s": four,
          "6s": six,
          WD: wide,
          NB: noBall,
        });
      }
    }
  }

  matchStat[index].Team1.Batting = batting1;
  matchStat[index].Team1.Bowling = bowling1;
  matchStat[index].Team2.Batting = batting2;
  matchStat[index].Team2.Bowling = bowling2;

  let matchPath = path.join(pathName, matchStat[index].Match);
  if (!fs.existsSync(matchPath)) {
    fs.mkdirSync(matchPath);
  }

  //JSON To Excel
  //Batting1
  let excelFilePath = path.join(matchPath, "Batting1.xlsx");
  let JsonData = matchStat[index].Team1.Batting;
  let sheetName = "Batting1";
  excelWriter(excelFilePath, JsonData, sheetName);
  //Bowling1
  excelFilePath = path.join(matchPath, "Bowling1.xlsx");
  JsonData = matchStat[index].Team1.Bowling;
  sheetName = "Bowling1";
  excelWriter(excelFilePath, JsonData, sheetName);

  //Batting2
  excelFilePath = path.join(matchPath, "Batting2.xlsx");
  JsonData = matchStat[index].Team2.Batting;
  sheetName = "Batting2";
  excelWriter(excelFilePath, JsonData, sheetName);
  //Bowling2
  excelFilePath = path.join(matchPath, "Bowling2.xlsx");
  JsonData = matchStat[index].Team2.Bowling;
  sheetName = "Bowling2";
  excelWriter(excelFilePath, JsonData, sheetName);

  function excelWriter(filePath, json, sheetName) {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
  }
  if (counter == 60) {
    // console.log(matchStat);
    fs.writeFileSync("Data.json", JSON.stringify(matchStat));
  }
}
